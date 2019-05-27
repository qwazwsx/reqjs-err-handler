'use strict'

class ErrorHandler {
  /*
  customizable error handler

  Params:
    cases: object representing error cases
    body: HTTP response body
    status: HTTP response code

    {
      fail: {
        body: [
          { text: 'password-error', rejectComment: 'Username is incorrect.' },
          { text: 'Incorrect Username and/or Password', rejectComment: 'Password is incorrect.' },
          { text: 'No Campus Application selected', rejectComment: 'District/School name failed.' }
        ],
        status: [{ status: 400, rejectComment: 'bad request' }]
      },
      success: {
        body: 'success':
        status: [200],
        rejectComment: 'unknown error'
      },
      prefix: 'LOGIN_REQ'
    }

    this will throw an error if the body contains 'password-error', 'Incorrect Username and/or Password', etc
    this will throw an error if the body DOES NOT contain 'success' AND and the request has status code 200
    example of how errors get formatted:
      [F_BODY_1][LOGIN_REQ] Password is incorrect
      [S_STATUS][LOGIN_REQ] bad request
*/
  constructor (cases) {
    this.cases = cases
  }

  // body, status, err
  handle (err, res, body) {
    this.err = err
    this.res = res
    this.body = body
    let status = res.statusCode

    // if the server dropped the request
    if (res === undefined) {
      throw new Error('[errorHandler] Server dropped the request or sent a malformed response.\n' + err)
    }
    // handle generic HTTP errors from request.js
    if (err) { throw new Error(err) }

    // fail cases
    if (this.cases.fail !== undefined) {
      // fail body
      if (this.cases.fail.body !== undefined) {
        // loop over body fail cases
        this.cases.fail.body.forEach((item, i) => {
          // if we find a fail case in the body
          if (body.indexOf(item.text) > -1) {
            this._throwErr(`F_BODY_${i}`, item.rejectComment)
          }
        })
      }

      // fail status
      if (this.cases.fail.status !== undefined) {
        // loop over status fail cases
        this.cases.fail.status.forEach((item, i) => {
          if (status === item.status) {
            this._throwErr(`F_STATUS_${item.status}`, item.rejectComment)
          }
        })
      }
    }

    // success cases
    if (this.cases.success !== undefined) {
      // success body
      if (this.cases.success.body !== undefined) {
        let found = false
        // loop over body success cases
        this.cases.success.body.forEach((item) => {
          // if we find a success case in the body
          if (body.indexOf(item) > -1) { found = true }
        })

        // if no success cases were found
        if (!found) {
          this._throwErr('S_BODY', this.cases.success.rejectComment)
        }
      }

      // success status
      if (this.cases.success.status !== undefined) {
        let found = false
        // loop over sucess status cases
        this.cases.success.status.forEach((item) => {
          if (status === item) { found = true }
        })

        // if no success cases were found
        if (!found) {
          this._throwErr('S_STATUS', this.cases.success.rejectComment.replace('%status%', status)) // replace %status%)
        }
      }
    }
  }

  // handles the formatting and throwing of errors
  _throwErr (errPrefix, text) {
    let prefix = this.cases.prefix || ''
    if (this.cases.verbose) {
      let verbosePrefix = `[${prefix}][${errPrefix}][VERBOSE]`
      console.group(verbosePrefix)

      console.groupCollapsed('[ERR]')
      console.log(this.err)
      console.groupEnd('[ERR]')

      console.groupCollapsed('[RES]')
      console.log(this.res)
      console.groupEnd('[RES]')

      console.groupCollapsed('[BODY]')
      console.log(this.body)
      console.groupEnd('[BODY]')

      console.groupEnd(verbosePrefix)
    }
    throw new Error(`[${prefix}][${errPrefix}] ${text}`)
  }
}

// export our class
module.exports = ErrorHandler
