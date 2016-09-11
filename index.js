'use strict'

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
  const domains = { wc: [], single: [], both: [] }
  names.forEach((e) => {
    var wc = false
    if (e[0] === '*') {
      wc = true
      e = e.split('.').splice(1).join('.')
    }
    e = e.replace(/\./g, '\\.')
    if (wc) domains.wc.push(e)
    else domains.single.push(e)
  })
  domains.wc = domains.wc.filter((e) => {
    const idx = domains.single.indexOf(e)
    if (idx === -1) return true
    domains.single.splice(idx, 1)
    domains.both.push(e)
    return false
  })
  const entries = []
  if (domains.single.length > 0) {
    entries.push(domains.single.join('|'))
  }
  if (domains.wc.length > 0) {
    entries.push('[^\\.]+\\.(' + domains.wc.join('|') + ')')
  }
  if (domains.both.length > 0) {
    entries.push('([^\\.]+\\.)?(' + domains.both.join('|') + ')')
  }
  return new RegExp('^((' + entries.join(')|(') + '))$', 'gm')
}

exports.getCommonNames = getCommonNames
exports.toRegEx = toRegEx
