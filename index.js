'use strict'

const net = require('net')
const asn1 = require('asn1.js')
const asn1Cert = require('asn1.js-rfc3280')

const ASNStr = asn1.define('ASNStr', function () {
  this.choice({
    bit: this.bitstr(),
    bmp: this.bmpstr(),
    chr: this.charstr(),
    gen: this.genstr(),
    grp: this.graphstr(),
    ia5: this.ia5str(),
    iso: this.iso646str(),
    num: this.numstr(),
    oct: this.octstr(),
    prt: this.printstr(),
    t61: this.t61str(),
    uni: this.unistr(),
    utf: this.utf8str(),
    vid: this.videostr()
  })
})

function _getCommon (cns) {
  const counts = {}
  cns.forEach((t) => {
    for (var i = 1; i <= t.length; i++) {
      const cmn = t.slice(0, i).join('.')
      counts[cmn] = (counts[cmn] || 0) + (i - 1)
    }
  })
  var max = -1
  var ret = null
  Object.keys(counts).forEach((cmn) => {
    if (counts[cmn] > max) {
      ret = cmn
      max = counts[cmn]
    }
  })
  return {
    common: ret,
    entries: cns.filter((e, i, a) => {
      const es = e.join('.')
      if ((es === ret) ||
          (es.indexOf(ret + '.') === 0)) {
        return true
      }
    })
  }
}

function getCommonNames (buffer, encoding) {
  if (encoding === undefined) {
    encoding = (/^\s*-----\s*BEGIN/.test(buffer.toString())) ? 'pem' : 'der'
  }
  const cert = asn1Cert.Certificate.decode(buffer, encoding, {label: 'CERTIFICATE'})
  var names = []
  cert.tbsCertificate.subject.value.forEach((e) => {
    if (e[0].type.join('.') !== '2.5.4.3') return
    names.push(ASNStr.decode(e[0].value).value)
  })
  cert.tbsCertificate.extensions.forEach((e) => {
    if (e.extnID.join('.') !== '2.5.29.17') return
    names.push.apply(names, asn1Cert.GeneralNames.decode(e.extnValue).map((e) => {
      switch (e.type) {
        case 'dNSName':
          return e.value
        case 'iPAddress':
          if (e.value.length === 4) {
            return [e.value[0], e.value[1], e.value[2], e.value[3]].join('.')
          } else if (e.value.length === 16) {
            return e.value.toString('hex').replace(/(.{4})/g, '$1:').replace(/:$/, '')
          }
          console.log('Unknown IP value: %s', e.value.toString('hex'))
          return null
        default:
          console.log('Unknown type: %s', e.type)
          return null
      }
    }))
  })
  return names.filter((e, i, s) => {
    if (e === null) return false
    return s.indexOf(e) === i
  })
}

function toRegEx (names) {
  const domains = { cn: [], ip: [], ip6: [] }
  names.forEach((e) => {
    const ip = net.isIP(e)
    if (ip === 4) return domains.ip.push(e)
    if (ip === 6) return domains.ip6.push(e)
    domains.cn.push(e.split('.').reverse())
  })
  domains.cn.sort()

  const entries = []
  if (domains.ip6.length > 0) {
    entries.push('(\\[?' + domains.ip6.map((e) => {
      return e.replace(/:0([^0])/g, ':0?$1').replace(/(^|:)[0:]+:/, '$1[0:]*:').replace(/:0{2,}/g, ':0*')
    }).join('\\]?)|(\\[?') + '\\]?)')
  }
  if (domains.ip.length > 0) {
    entries.push(domains.ip.map(e => e.split('.').map(i => '0*' + i).join('\\.')).join('|'))
  }
  const starmap = e => e.replace(/\*/g, '[^.]+')
  while (domains.cn.length > 0) {
    const common = _getCommon(domains.cn)
    const suf = common.common.split('.').reverse()
    const ents = common.entries.map(e => e.slice(suf.length).join('.'))

    const base = ents.indexOf('')
    if (base !== -1) ents.splice(base, 1)

    const entry =
      (
        (ents.length > 0)
        ? '(((' + ents.map(e => e.split('.').reverse().map(starmap).join('\\.')).join(')|(') + '))\\.)' + (base !== -1 ? '?' : '')
        : ''
      ) + suf.map(starmap).join('\\.')
    entries.push(entry)
    domains.cn = domains.cn.filter(e => (common.entries.indexOf(e) === -1))
  }
  return new RegExp('^((' + entries.join(')|(') + '))$', 'm')
}

exports.getCommonNames = getCommonNames
exports.toRegEx = toRegEx
