var http = require('http');
var httpProxy = require('http-proxy');
var hosts = require('./lib/hosts');
var commander = require('commander');
var package = require(__dirname + '/package.json');

//define command line parameters
commander
  .version(package.version)
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
  console.log('Proxy error:', hosts(req), err);
  sendError(res, 'That\'s a pretty fookin bad gateway!');
});

//simple Dynamic HTTP Proxy
var server = http.createServer(function (req, res) {
  var target;

  if (target = hosts(req)) {
    return proxy.web(req, res, { target: target });
  }

  sendError(res, 'Oooopsy... The host was not found.');
});

//enable support for WebSockets
server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, { target: hosts(req) });
});

//start the server
server.listen(commander.port, function () {
  console.log('Proxy server is listening on ' + commander.port);
});