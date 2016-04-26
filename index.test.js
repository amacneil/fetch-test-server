import { assert } from 'chai';

import TestServer from './index';

// very simple http handler
const app = (req, res) => {
  const headers = {};
  if (req.headers.ping) {
    headers.pong = req.headers.ping;
  }

  res.writeHead(200, headers);
  res.end(`${req.method} ${req.url} works!`);
};

describe('TestServer', () => {
  let server;

  beforeEach(() => {
    server = new TestServer(app);
  });

  it('creates an http server', () => {
    assert.isOk(server.server);
  });

  it('listens on a random port', () => {
    assert.isFalse(server.server.listening);

    return server.listen().then(() => {
      assert.isTrue(server.server.listening);

      const address = server.server.address();
      assert.isAbove(address.port, 49000);
    });
  });

  it('can\'t close connection if not listening', () => {
    return server.close()
      .then(assert.fail)
      .catch((err) => {
        assert.strictEqual(err.message, 'Not running');
      });
  });

  it('closes the server connection', () => {
    return server.listen().then(() => {
      assert.isTrue(server.server.listening);

      return server.close();
    }).then(() => {
      assert.isFalse(server.server.listening);
    });
  });

  it('returns server address', () => {
    return server.listen().then(() => {
      assert.match(server.address, /http:\/\/localhost:[0-9]{5}/);
    });
  });

  it('listens on fetch', () => {
    return server.fetch().then(() => {
      assert.isTrue(server.server.listening);
    });
  });

  it('fetches from server', () => {
    return server.fetch('/foo').then((res) => {
      assert.strictEqual(res.status, 200);

      return res.text();
    }).then((body) => {
      assert.strictEqual(body, 'GET /foo works!');
    });
  });

  it('supports fetch options', () => {
    const opts = {
      headers: { ping: 'foo' },
    };

    return server.fetch('/bar', opts).then((res) => {
      assert.strictEqual(res.headers.get('pong'), 'foo');
    });
  });

  it('supports helper methods', () => {
    for (const method of ['delete', 'get', 'head', 'options', 'patch', 'post', 'put']) {
      assert.typeOf(server[method], 'function');
    }

    const opts = {
      headers: { ping: 'foo' },
    };

    return server.post('/mail', opts).then((res) => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('pong'), 'foo');

      return res.text();
    }).then((body) => {
      assert.strictEqual(body, 'POST /mail works!');
    });
  });
});
