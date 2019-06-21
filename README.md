## reqjs-err-handler.js

[![npm version](https://badge.fury.io/js/reqjs-err-handler.svg)](https://badge.fury.io/js/reqjs-err-handler)

##### ⚙️ powerful HTTP error handler built for `request.js`

### `npm i reqjs-err-handler`

### EASY TO SETUP:

```JavaScript
// define the reqjs-err-handler conditions
const loginHandler = new ErrorHandler({
  prefix: 'LOGIN',    // prefix to put in front of thrown errors
  
  // define 'success' cases. These conditions MUST be met or else an error will be thrown
  success: {
    status: [200],    // the HTTP response code must be 200
    body: ['login successful', 'logged in'],    // the response body must contain 'login successful' or 'logged in'
    // if these cases are not met, use this as the error text to throw:
    rejectComment: 'Unknown error (got HTTP %status%, expected HTTP 200).' // %status% is replaced HTTP status code
  },
  
  // define 'fail' cases. If ANY of these conditions are met, an error will be thrown 
  fail: {
    body: [    // throw an error if the response body contains any of these
      { text: 'password-error', rejectComment: 'Password is incorrect.' },
      { text: 'username-error', rejectComment: 'Username is incorrect.' }
    ],
    // throw an error if the HTTP response code is 429
    status: [{ status: 429, rejectComment: 'Please slow down your login attempts.' }]
  }
})

// make a request and call reqjs-err-handler
request('https://api.example.com/XXX', (err, res, body) => {
  loginHandler.handle(err, res, body)
  
  // ....
});
```

##### ANATOMY OF THE ERROR:
"Error: [`PREFIX`][`ERROR TYPE`]  `error message`"

—`[PREFIX]` - customisable error prefix parameter set above

—`[ERROR TYPE]` - the reason the error was thrown.
* `[F_BODY_X]` - body fail condition met. X is a number representing the specific condition that triggered the error
* `[F_STATUS_XXX]` - HTTP status fail condition met. XXX is the expected HTTP status
* `[S_BODY]` - success body condition not met
* `[S_STATUS]` - success HTTP status condition not met

—`error message` - customisable error message set above. For success status errors, The `%status%` placeholder is automatically replaced with the unexpected status code 

##### EXAMPLES:
Example errors based off the conditions defined above

###### body: `<p>login successful</p>` — HTTP code: `200`
no error is thrown because both body and status conditions are met

###### body: `<p>unexpected server error</p>` — HTTP code: `500`
the following error is thrown because one or more 'success' conditions are not met
`Error: [LOGIN][S_STATUS] Unknown error (got HTTP 404, expected HTTP 200).`

###### body: `<p>password-error</p>` — HTTP code: `500`
the following error is thrown because the fail body condition was met
`Error: [LOGIN][F_BODY_0] Password is incorrect.`
\* note: both the fail body condition (body can't contain "password-error") and the success HTTP status condition (status must be 200) should be triggered. However, fail conditions take precedence over success conditions because of its specificity, so only the fail condition is thrown.

###### body: `<p>username-error</p>` — HTTP code: `500`
the following error is thrown because the fail body condition was met
`Error: [LOGIN][F_BODY_1] Username is incorrect.`

###### body: `<p>ratelimiting active</p>` — HTTP code: `429`
the following error is thrown because the fail HTTP status condition was met
`Error: [LOGIN][F_STATUS_429] Please slow down your login attempts.`

##### EXAMPLE PRESETS:
a bit confused? here's a few more examples

```JavaScript
const genericHandler = new ErrorHandler({
  prefix: 'GEN_200',
  success: {
    status: [200],
    body: ['SUCCESS', 'OK'],
    rejectComment: 'Unknown error (got HTTP %status%, expected HTTP 200).'
  }
})
```
This will throw an error if the response body **doesn't** contain either *"SUCCESS"* or *"OK"*. This will also throw an error if the HTTP status code **isn't** 200. 

```JavaScript
const loginHandler = new ErrorHandler({
  prefix: 'LOGIN',
  fail: {
    body: [
      { text: 'no account found', rejectComment: 'Username is incorrect.' },
      { text: 'password incorrect', rejectComment: 'Password is incorrect.' }
    ],
    status: [{ status: 400, rejectComment: 'bad request' }]
  }
})
```
This will throw an error if the response body contains either the text *"no account found"* or *"password incorrect"*. This will also throw an error if the HTTP status code is 400. 

##### ADVANCED DEBUGGING
reqjs-err-handler has a verbose debugging mode designed to make tracking down errors in your code easy. No more `console.log()`ing!

Simply set the `verbose` parameter when setting up conditions. 
```JavaScript
const loginHandler = new ErrorHandler({
  verbose: true,
  // ....
})
```

Verbose mode prints out request.js errors, the full request.js response object, and the response body. This is a LOT of text so using devtools with `--inspect` is recommended.
