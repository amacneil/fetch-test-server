import fetch from 'node-fetch';
import http from 'http';
import debug from 'debug';

const log = debug('fetch-test-server');

export default class TestServer {
  constructor(app) {
    this.server = http.createServer(app);

    ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'].forEach((method) => {
      this[method] = (path, options) =>
        this.fetch(path, Object.assign({}, options, { method: method.toUpperCase() }));
    });
  }

  listen() {
    if (!this.listener) {
      this.listener = new Promise((resolve, reject) => {
        this.server.listen(0, () => resolve())
          .on('error', (err) => reject(err));
      });
    }

    return this.listener;
  }

  close() {
    this.listener = null;

    return new Promise((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  get address() {
    const { port } = this.server.address();
    return `http://localhost:${port}`;
  }

  fetch(path, opts) {
    return this.listen().then(() => {
      const options = Object.assign({ headers: {} }, opts);

      // automatic JSON encoding
      if (typeof options.body === 'object') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      const url = `${this.address}${path}`;
      log(url, options);

      return fetch(url, options);
    });
  }
}
