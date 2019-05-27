'use strict'

// this is a unit test file designed to be ran with mocha

const ErrorHandler = require('./index.js')
const assert = require('assert')

let test = new ErrorHandler({
  prefix: 'test',
  fail: {
    body: [
      { text: 'Incorrect password', rejectComment: 'Password is incorrect.' },
      { text: 'Incorrect username', rejectComment: 'Username is incorrect.' }
    ],
    status: [{ status: 500, rejectComment: 'HTTP 500 server error, malformed request' }, { status: 418, rejectComment: 'HTTP 418 server error' }]
  },
  success: {
    status: [200, 201],
    rejectComment: 'Unknown error while logging in (got HTTP %status%, expected HTTP 200)',
    body: [
      'SUCCESS', 'PASS'
    ]
  }
})

it('passes with OK success status code & body', () => { // eslint-disable-line no-undef
  assert.doesNotThrow(() => { test.handle(undefined, { statusCode: 200 }, 'SUCCESS') })
  assert.doesNotThrow(() => { test.handle(undefined, { statusCode: 201 }, 'SUCCESS') })
})

//

it('fails with BAD success status code', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle(undefined, { statusCode: 404 }, 'SUCCESS') })
  assert.throws(() => { test.handle(undefined, { statusCode: 400 }, 'SUCCESS') })
})

it('fails with BAD success body', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle(undefined, { statusCode: 200 }, 'hjasdhjkasdjhk') })
})

//

it('fails with BAD fail body', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle(undefined, { statusCode: 200 }, 'Incorrect password') })
  assert.throws(() => { test.handle(undefined, { statusCode: 200 }, 'Incorrect username') })
})

it('fails with BAD fail status code', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle(undefined, { statusCode: 500 }, 'SUCCESS') })
  assert.throws(() => { test.handle(undefined, { statusCode: 418 }, 'SUCCESS') })
})

//

it('fails with request.js errors', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle('Error: Invalid URL "hppt:/google.x"', { statusCode: 200 }, 'SUCCESS') })
})

it('fails with dropped request', () => { // eslint-disable-line no-undef
  assert.throws(() => { test.handle(undefined, undefined, undefined) })
})
