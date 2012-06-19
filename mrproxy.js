#!/usr/bin/env node

var http = require('http'),
    Proxy = require('http-proxy').RoutingProxy,
    proxy = new Proxy(),
    url = require('url'),
    util = require('util'),
    config = require('./config.json');

function log() {
  var argv = [].slice.call(arguments),
      str = argv.shift();

  if (typeof str !== 'string') {
    str = util.inspect(str);
  }

  str = str.split('\n').map(function (l) {
    return '☺ ' + l;
  }).join('\n');

  console.log.apply(null, [ str ].concat(argv));
}

log('Hi! I am mrproxy!');

process.on('uncaughtException', function (err) {
  var msg = err.message.split('\n'),
      head = msg.shift();

  msg = msg.map(function (l) {
    return '☠ ' + l;
  });

  console.error('');
  console.error('%s: %s', err.name, head);
  console.error(msg.join('\n'));
  err.stack.split('\n').slice(msg.length + 1).forEach(function (l) {
    console.error(l);
  });
  process.exit(1);
});

var parsed = url.parse(config.url),
    host = parsed.hostname,
    port = parsed.port || 80;

function clientIp(req) {
  return (
    req.headers["X-Forwarded-For"] ||
    req.headers["x-forwarded-for"] ||
    req.client.remoteAddress
  );
};

log('I\'m proxying requests to %s:%d today!', host, port);

var server = http.createServer(function (req, res) {
  log('Proxied client at %s to %s:%d !', clientIp(req), host, port);
  proxy.proxyRequest(req, res, { port: port, host: host });
});

server.listen(8080, function (err) {
  if (err) {
    throw err;
  }

  var address = server.address();

  log('Now I\'m listening on http://%s:%d !', address.address, address.port);
});
