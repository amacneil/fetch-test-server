var debug = require('debug');
var http = require('http');
var nodeFetch = require('node-fetch');

var log = debug('fetch-test-server');

function TestServer(app) {
  if (!(this instanceof TestServer)) {
    return new TestServer();
  }

  // allow custom promise
  if (!TestServer.Promise) {
    throw new Error('native promise missing, set TestServer.Promise to your favorite alternative');
  }

  this.Promise = TestServer.Promise;
  this.server = http.createServer(app);

  ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'].forEach((method) => {
    this[method] = (path, options) =>
      this.fetch(path, Object.assign({}, options, { method: method.toUpperCase() }));
  });

  Object.defineProperty(this, 'address', {
    get: function address() {
      var port = this.server.address().port;
      return `http://localhost:${port}`;
    }
  });
}

TestServer.prototype.listen = function listen() {
  if (!this.listener) {
    this.listener = new this.Promise((resolve, reject) => {
      this.server.listen(0, () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  return this.listener;
};

TestServer.prototype.close = function close() {
  this.listener = null;

  return new this.Promise((resolve, reject) => {
    this.server.close((err) => (err ? reject(err) : resolve()));
  });
};

TestServer.prototype.fetch = function fetch(path, opts) {
  return this.listen().then(() => {
    var url = `${this.address}${path}`;
    var options = Object.assign({ headers: {} }, opts);

    // automatic JSON encoding
    if (typeof options.body === 'object') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    log(url, options);

    return nodeFetch(url, options);
  });
};

// expose Promise
TestServer.Promise = global.Promise;

module.exports = TestServer;
