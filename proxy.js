var http = require('http');
var httpProxy = require('http-proxy');
var hosts = require('./lib/hosts');
var commander = require('commander');

commander
    .version('0.0.1')
    .option('-p, --port <n>', 'Port to listen to', 80)
    .parse(process.argv);

var proxy = httpProxy.createProxyServer({
    ws: true,
    xfwd: true
});



proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    console.log('Proxy error', err, req.headers);
    res.end('Something went wrong. No worries it\'s reported.');
});


var server = http.createServer(function (req, res) {
    var target = hosts(req.headers.host.split(':')[0]);

    if (target) {
        proxy.web(req, res, {
            target: target
        });
    } else {
        res.statusCode = 500;
        res.end('Oooopsy... The host was not found.');
    }

});

server.on('upgrade', function (req, socket, head) {
    var target = hosts(req.headers.host.split(':')[0]);

    if (target) {
        proxy.ws(req, socket, head, {
            target: target
        });
    } else {
        socket.write('Oooopsy... The host was not found.');
        socket.end()
    }
});

server.listen(commander.port, function () {
    console.log('Proxy server is listening on ' + commander.port);
});