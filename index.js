const crypto = require('crypto')

const _sign = (input, key) => crypto.createSign('RSA-SHA256').update(input).sign(key, 'base64')
const _escape = (str) => str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
const _base64 = (obj) => _escape(Buffer.from(obj).toString('base64'))
const _unescape = (str) => str.replace(/-/g, '+').replace(/_/g, '/') + ('====='.substr(4 - str.length % 4))
const _verify = (input, test, key) => crypto.createVerify('RSA-SHA256').update(input).verify(key, test, 'base64')

const header = _base64(JSON.stringify({alg: 'RS256'}))

module.exports = {
    sign(payload, key) {
        const input = header + '.' + _base64(JSON.stringify(payload))
        return input + '.' + _escape(_sign(input, key))
    },
    verify(token, key) {
        const parts = token && token.split('.')
        return parts && parts.length === 3
            ? _verify(parts[0] + '.' + parts[1], _unescape(parts[2]), key)
            : false
    }
}