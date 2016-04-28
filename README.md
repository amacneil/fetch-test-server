# Node.js Fetch Test Server

[![Build Status](https://img.shields.io/travis/amacneil/fetch-test-server/master.svg)](https://travis-ci.org/amacneil/fetch-test-server)
[![Version](https://img.shields.io/npm/v/fetch-test-server.svg)](https://www.npmjs.com/package/fetch-test-server)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/amacneil/fetch-test-server/blob/master/LICENSE)

This package allows you to easily run your Node.js server for integration testing, and interact with it using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It is similar to [SuperTest](https://github.com/visionmedia/supertest), but using the Fetch API means that you can take advantage of promises, and newer ES2017 features like [async/await](https://tc39.github.io/ecmascript-asyncawait/).

## Installation

```sh
npm install --save-dev fetch-test-server
```

## Usage

Create a new instance of `TestServer`, passing in your HTTP server. You can then call `fetch()` to make requests against it. This example uses [Mocha](https://mochajs.org/) (which natively supports promises), but you can use any test framework you like.

```js
import { assert } from 'chai';
import app from './myapp';

const server = new TestServer(app);

describe('API Integration Test', () => {
  it('responds to /user', () => {
    return server.fetch('/user').then((res) => {
      assert.strictEqual(res.status, 200);
      
      return res.json();
    }).then((body) => {
      assert.strictEqual(body.name, 'Adrian');
    });
  });
});
```

Using async/await (currently requires [Babel](http://babeljs.io/) or another transpiler):

```js
import { assert } from 'chai';
import app from './myapp';

const server = new TestServer(app);

describe('API Integration Test', () => {
  it('responds to /user', async () => {
    const res = await server.fetch('/user');
    const body = await res.json();
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.name, 'Adrian');
  });
});
```

Behind the scenes, it uses [node-fetch](https://github.com/bitinn/node-fetch) to implement the Fetch API. The server listens on a random port, and does not start listening until you first call `fetch()`. Your requests will be automatically held until the server is available.

You can also use helper methods to call common HTTP verbs:

```js
server.head('/path');
server.get('/path');
server.post('/path');
server.put('/path');
server.patch('/path');
server.delete('/path');
server.options('/path');
```

Per the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch), you can customize the request with an optional second parameter:

```js
server.post('/users', {
  headers: { authorization: 'supersecret' },
  body: 'name=adrian',
});
```

Finally, if you pass an object as the `body` parameter, it will automatically be encoded as JSON and sent with a `Content-Type: application/json` header:

```js
server.post('/users', {
  headers: { authorization: 'supersecret' },
  body: { name: 'Adrian' },
});
```

This is equivalent to `body: JSON.stringify({ name: 'adrian' })`

If you need the URL of your test server, use `server.address`:

```js
server.listen().then(() => {
  // server is listening
  console.log(server.address);
});
```

If you want to stop the HTTP server, simply call `server.close()`:

```js
server.listen().then(() => {
  // server is listening
  return server.close();
}).then(() => {
  // server is now stopped
});
```

## HTTP Framework Support

Fetch Test Server works with any Node.js HTTP framework.

**Express**

```js
import app from './expressapp';

const server = new TestServer(app);
```

**Koa**

```js
import app from './koaapp';

const server = new TestServer(app.callback());
```

## License

[MIT](/LICENSE)
