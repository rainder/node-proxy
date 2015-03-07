var http = require('http');
var httpProxy = require('http-proxy');
var hosts = require('./lib/hosts');
var commander = require('commander');
var Debug = require('debug');
var packageJson = require(__dirname + '/package.json');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'proxy',
  serializers: {
    req: bunyan.stdSerializers.req
  }
});

//define command line parameters
commander
  .version(packageJson.version)
  .option('-p, --port <n>', 'Port to listen to', 80)
  .parse(process.argv);

//instantiate the proxy server
var proxy = httpProxy.createProxyServer({ ws: true, xfwd: true });

//define error function
var sendError = function (res, message) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(message);
};

//error handler
proxy.on('error', function (err, req, res) {
  log.error('Proxy error:', hosts(req), err);
  sendError(res, 'That\'s a pretty fookin bad gateway!');
});

//simple Dynamic HTTP Proxy
var server = http.createServer(function (req, res) {
  var target;

  if (target = hosts(req)) {
    log.info({req: req});
    return proxy.web(req, res, { target: target });
  }

  log.error('Host not found');
  sendError(res, 'Oooopsy... The host was not found.');
});

//enable support for WebSockets
server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, { target: hosts(req) });
});

//start the server
server.listen(commander.port, function () {
  log.info('Proxy server is listening on ' + commander.port)
});