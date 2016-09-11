/* global describe, it */

const assert = require('assert')
const {getCommonNames, toRegEx} = require('.')

// Certificate from google.com:443 at 2016/09/11
const certbufstr = 'MIIH0DCCBrigAwIBAgIIFWbcFYt6MAkwDQYJKoZIhvcNAQELBQAwSTELMAkGA1UEBhMCVVMxEzARBgNVBAoTCkdvb2dsZSBJbmMxJTAjBgNVBAMTHEdvb2dsZSBJbnRlcm5ldCBBdXRob3JpdHkgRzIwHhcNMTYwOTAxMTM0NTAwWhcNMTYxMTI0MTM0NTAwWjBmMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNTW91bnRhaW4gVmlldzETMBEGA1UECgwKR29vZ2xlIEluYzEVMBMGA1UEAwwMKi5nb29nbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAys3TI36TumZnI2YcvtbiJchoJ4q5pwIxqqgu2Jk/y7H7g2mUCRc79yuRMTBA39NkNGsjex+HdAY4fNM1nq2YbjJvQV2eSBpk8TthBQG5qLrj+NG5NlFOtPlTqJLrdMz+GsEVM+BoBpY1+WULwMNMFgJGUXHRMZewte0JY5LfstHFiy8xKF90wESXPsXUKoy9j5eiLYgVwPeHyvZLqSrLSrMDEPHqaKzmP3x2XN6BqWAuJsPOn0UmLY4haYppvoi1t+1xU758igRx8AhNxhBarTJ0Vk3veagJU8RlPdeUN8hRGYg6h7+x5gDZGayHtXvcV+e4wwx5fAjI2qbs9WTfoQIDAQABo4IEnTCCBJkwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMIIDaQYDVR0RBIIDYDCCA1yCDCouZ29vZ2xlLmNvbYINKi5hbmRyb2lkLmNvbYIWKi5hcHBlbmdpbmUuZ29vZ2xlLmNvbYISKi5jbG91ZC5nb29nbGUuY29tghYqLmdvb2dsZS1hbmFseXRpY3MuY29tggsqLmdvb2dsZS5jYYILKi5nb29nbGUuY2yCDiouZ29vZ2xlLmNvLmlugg4qLmdvb2dsZS5jby5qcIIOKi5nb29nbGUuY28udWuCDyouZ29vZ2xlLmNvbS5hcoIPKi5nb29nbGUuY29tLmF1gg8qLmdvb2dsZS5jb20uYnKCDyouZ29vZ2xlLmNvbS5jb4IPKi5nb29nbGUuY29tLm14gg8qLmdvb2dsZS5jb20udHKCDyouZ29vZ2xlLmNvbS52boILKi5nb29nbGUuZGWCCyouZ29vZ2xlLmVzggsqLmdvb2dsZS5mcoILKi5nb29nbGUuaHWCCyouZ29vZ2xlLml0ggsqLmdvb2dsZS5ubIILKi5nb29nbGUucGyCCyouZ29vZ2xlLnB0ghIqLmdvb2dsZWFkYXBpcy5jb22CDyouZ29vZ2xlYXBpcy5jboIUKi5nb29nbGVjb21tZXJjZS5jb22CESouZ29vZ2xldmlkZW8uY29tggwqLmdzdGF0aWMuY26CDSouZ3N0YXRpYy5jb22CCiouZ3Z0MS5jb22CCiouZ3Z0Mi5jb22CFCoubWV0cmljLmdzdGF0aWMuY29tggwqLnVyY2hpbi5jb22CECoudXJsLmdvb2dsZS5jb22CFioueW91dHViZS1ub2Nvb2tpZS5jb22CDSoueW91dHViZS5jb22CFioueW91dHViZWVkdWNhdGlvbi5jb22CCyoueXRpbWcuY29tghphbmRyb2lkLmNsaWVudHMuZ29vZ2xlLmNvbYILYW5kcm9pZC5jb22CBGcuY2+CBmdvby5nbIIUZ29vZ2xlLWFuYWx5dGljcy5jb22CCmdvb2dsZS5jb22CEmdvb2dsZWNvbW1lcmNlLmNvbYIZcG9saWN5Lm10YS1zdHMuZ29vZ2xlLmNvbYIKdXJjaGluLmNvbYIKd3d3Lmdvby5nbIIIeW91dHUuYmWCC3lvdXR1YmUuY29tghR5b3V0dWJlZWR1Y2F0aW9uLmNvbTBoBggrBgEFBQcBAQRcMFowKwYIKwYBBQUHMAKGH2h0dHA6Ly9wa2kuZ29vZ2xlLmNvbS9HSUFHMi5jcnQwKwYIKwYBBQUHMAGGH2h0dHA6Ly9jbGllbnRzMS5nb29nbGUuY29tL29jc3AwHQYDVR0OBBYEFGKEthFkxJN0EYXz5qo3Di7luCr6MAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUSt0GFhu89mi1dvWBtrtiGrpagS8wIQYDVR0gBBowGDAMBgorBgEEAdZ5AgUBMAgGBmeBDAECAjAwBgNVHR8EKTAnMCWgI6Ahhh9odHRwOi8vcGtpLmdvb2dsZS5jb20vR0lBRzIuY3JsMA0GCSqGSIb3DQEBCwUAA4IBAQAg1vgwAqVvcACvkPTp/+IBlVBZm1CoUrWr9kU0TF77RLSVgeqqBu6I8LMHLkAlXkMI2bme7C3mOBvHR4+7/uTiPCRbwbRBLvpl9kqlT8hFmxf3v0Bye78T/KFDkUESP44w/m71bdwv3MbhXwzf/4gg2YcuPbbh9bAkyMHzszI2xMvepgjsY8sOZTrm2BKxI3K+5hwaGn5ObOzL0YsRLJYLtIL4ue4GecmWERWQp8afBBr+mT8/88xZumXXQn5ba2HZb4louQKS/6bliVh92RT2VZPRhyPJ4gNdXiYxtViIX8chIDNS/+aR6XXtzw4BWltKauZHv8vn1Gm3WPPYYRs/'
const certpem = '-----BEGIN CERTIFICATE-----\n' + certbufstr.replace(/(.{64})/g, '$1\n') + '\n-----END CERTIFICATE-----\n'
const certbuf = new Buffer(certbufstr, 'base64')

// Fetched with OpenSSL
const expectedNames = ['*.google.com', '*.android.com', '*.appengine.google.com', '*.cloud.google.com', '*.google-analytics.com', '*.google.ca', '*.google.cl', '*.google.co.in', '*.google.co.jp', '*.google.co.uk', '*.google.com.ar', '*.google.com.au', '*.google.com.br', '*.google.com.co', '*.google.com.mx', '*.google.com.tr', '*.google.com.vn', '*.google.de', '*.google.es', '*.google.fr', '*.google.hu', '*.google.it', '*.google.nl', '*.google.pl', '*.google.pt', '*.googleadapis.com', '*.googleapis.cn', '*.googlecommerce.com', '*.googlevideo.com', '*.gstatic.cn', '*.gstatic.com', '*.gvt1.com', '*.gvt2.com', '*.metric.gstatic.com', '*.urchin.com', '*.url.google.com', '*.youtube-nocookie.com', '*.youtube.com', '*.youtubeeducation.com', '*.ytimg.com', 'android.clients.google.com', 'android.com', 'g.co', 'goo.gl', 'google-analytics.com', 'google.com', 'googlecommerce.com', 'policy.mta-sts.google.com', 'urchin.com', 'www.goo.gl', 'youtu.be', 'youtube.com', 'youtubeeducation.com']

const invalidNames = [
  // IP addresses
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::]',
  // Unexpected domains
  'comodo.com',
  'guugle.net',
  // Only-wildcarded domains
  'google.com.co',
  // Non-wildcarded subdomains
  'www.g.co',
  'a.goo.gl',
  // Too deep subdomains
  'a.b.google.com',
  'a.b.url.google.com'
]

describe('getCommonNames', () => {
  it('should parse PEM-encoded (String) certificates', (done) => {
    const names = getCommonNames(certpem)
    assert.ok(names instanceof Array, 'should return array')
    assert.deepStrictEqual(names, expectedNames, 'should return expected names')
    done()
  })
  it('should parse PEM-encoded (Buffer) certificates', (done) => {
    const names = getCommonNames(new Buffer(certpem))
    assert.ok(names instanceof Array, 'should return array')
    assert.deepStrictEqual(names, expectedNames, 'should return expected names')
    done()
  })
  it('should parse DER-encoded certificates', (done) => {
    const names = getCommonNames(certbuf)
    assert.ok(names instanceof Array, 'should return array')
    assert.deepStrictEqual(names, expectedNames, 'should return expected names')
    done()
  })
})

describe('toRegEx', () => {
  it('should return regular expression', (done) => {
    const regex = toRegEx(expectedNames)
    assert.ok(regex instanceof RegExp, 'should return RegExp')
    done()
  })
  it('should return regular expression that pass all names', (done) => {
    const regex = toRegEx(expectedNames)
    expectedNames.forEach((cn) => {
      assert.ok(
        regex.test(cn.replace(/\*/g, 'a')),
        'should pass: ' + cn
      )
    })
    done()
  })
  it('should return regular expression that NOT pass invalid names', (done) => {
    const regex = toRegEx(expectedNames)
    invalidNames.forEach((cn) => {
      assert.ok(
        !regex.test(cn),
        'should NOT pass: ' + cn
      )
    })
    done()
  })
  it('should properly handle multi-level wildcards', (done) => {
    const names = ['example.com', '*.example.com', '*.*.example.com', 'my.example.com']
    const invalid = ['test.com', 'a.b.c.exapmle.com']
    const regex = toRegEx(names)
    names.forEach((cn) => {
      assert.ok(
        regex.test(cn.replace(/\*/g, 'a')),
        'should pass: ' + cn
      )
    })
    invalid.forEach((cn) => {
      assert.ok(
        !regex.test(cn),
        'should NOT pass: ' + cn
      )
    })
    done()
  })
  it('should properly handle IP addresses', (done) => {
    const names = ['127.0.0.1', '0000:0000:0000:0000:0000:0000:0000:0001', '2a00:1450:4010:0c01:0000:0000:0000:0071', 'example.com']
    const aliases = ['127.000.000.001', '::1', '[2a00:1450:4010:c01::71]']
    const invalid = ['192.168.1.1', '127.0.0.2', '2a00:1234:5678::1', '::2', '::1:1']
    const regex = toRegEx(names)
    names.forEach((cn) => {
      assert.ok(
        regex.test(cn.replace(/\*/g, 'a')),
        'should pass: ' + cn
      )
    })
    aliases.forEach((cn) => {
      assert.ok(
        regex.test(cn.replace(/\*/g, 'a')),
        'should pass: ' + cn
      )
    })
    invalid.forEach((cn) => {
      assert.ok(
        !regex.test(cn),
        'should NOT pass: ' + cn
      )
    })
    done()
  })
})
