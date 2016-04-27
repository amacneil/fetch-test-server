var assert = require('chai').assert;

var TestServer = require('.');

// very simple http handler
var app = (req, res) => {
  var headers = {};
  if (req.headers.ping) {
    headers.pong = req.headers.ping;
  }

  res.writeHead(200, headers);
  res.end(`${req.method} ${req.url} works!`);
};

describe('TestServer', () => {
  var server;

  beforeEach(() => {
    server = new TestServer(app);
  });

  it('creates an http server', () => {
    assert.typeOf(server.server, 'object');
  });

  it('supports calling constructor', () => {
    server = TestServer(app);
    assert.typeOf(server.server, 'object');
  });

  it('listens on a random port', () => {
    assert.isNull(server.server.address());

    return server.listen().then(() => {
      var address = server.server.address();

      assert.isAbove(address.port, 10000);
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
      assert.typeOf(server.server.address(), 'object');

      return server.close();
    }).then(() => {
      assert.isNull(server.server.address());
    });
  });

  it('returns server address', () => {
    return server.listen().then(() => {
      assert.match(server.address, /http:\/\/localhost:[0-9]{5}/);
    });
  });

  it('listens on fetch', () => {
    return server.fetch('/foo').then(() => {
      assert.typeOf(server.server.address(), 'object');
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
    var opts = {
      headers: { ping: 'foo' }
    };

    return server.fetch('/bar', opts).then((res) => {
      assert.strictEqual(res.headers.get('pong'), 'foo');
    });
  });

  it('supports helper methods', () => {
    var opts = {
      headers: { ping: 'foo' }
    };

    ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'].forEach((method) => {
      assert.typeOf(server[method], 'function');
    });

    return server.post('/mail', opts).then((res) => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('pong'), 'foo');

      return res.text();
    }).then((body) => {
      assert.strictEqual(body, 'POST /mail works!');
    });
  });
});
