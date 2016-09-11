# Certificate common names extract library

[![NPM](https://nodei.co/npm/certnames.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/certnames/)

[![npm](https://img.shields.io/npm/v/certnames.svg)](https://www.npmjs.com/package/certnames)
[![npm](https://img.shields.io/npm/l/certnames.svg)](https://www.npmjs.com/package/certnames)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/dm/certnames.svg)](https://www.npmjs.com/package/certnames)
[![build](https://git.phoenix.dj/phoenix/node-certnames/badges/master/build.svg)](https://git.phoenix.dj/phoenix/node-certnames/builds)

This module provides API to get SSL certificate common names list.

## Usage

```javascript
const certnames = require('certnames')
const tls = require('tls')

const host = 'comodo.com'
const sock = tls.connect(443, host)

sock.on('secureConnect', () => {
  const cert = sock.getPeerCertificate().raw
  const names = certnames.getCommonNames(cert)
  console.log('Common names: %j', names)
  // Common names: ["ssl383141.cloudflaressl.com","*.comodo.com","comodo.com"]
  const regex = certnames.toRegEx(names)
  console.log('Regex: %s', regex)
  // Regex: /^((ssl383141\.cloudflaressl\.com)|(([^\.]+\.)?(comodo\.com)))$/gm
})
```

## API

### getCommonNames(buffer[, encoding])
Extracts common names (with "alternative" if present) from buffer. Both `der` and `pem` encodings supported.

### toRegEx(names)
Generates regular expression that match any of common name extracted before. Supports RegEx simplification, so wildcard and non-wildcard domains are grouped into single expression.

## Thanks to
* [Fedor Indutny](https://github.com/indutny)<br>
  For powerful ASN.1 parser library

## LICENSE
This software is licensed under the MIT License.

Copyright Yury Popov _a.k.a. [PhoeniX](https://phoenix.dj)_, 2016.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.