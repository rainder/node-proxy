var
  fs = require('fs'),
  url = require('url'),
  hostsFilePath = process.env['HOME'] + '/.proxy-routes.json',
  hosts = {},
  fsOptions = {encode: 'utf-8'};

function parseRoute(route) {
  var matches, urlObj;

  urlObj = url.parse('');
  urlObj.hostname = '127.0.0.1';
  urlObj.protocol = 'http:';

  switch (false) {
    case !(matches = route.match(/^(\d+)$/)):
      urlObj.port = matches[1];
      break;
    case !(matches = route.match(/^([0-9\.]+):(\d+)$/)):
      urlObj.hostname = matches[1];
      urlObj.port = matches[2];
      break;
    case !(matches = route.match(/^([a-z]+:)\/\/([0-9\.]+):(\d+)$/)):
      urlObj.protocol = matches[1];
      urlObj.hostname = matches[2];
      urlObj.port = matches[3];
      break;
  }
  return urlObj.format();
}

function readFile() {
  var k,
    data = JSON.parse(fs.readFileSync(hostsFilePath, fsOptions));

  for (k in data) {
    if (!data.hasOwnProperty(k)) { continue; }
    data[k] = parseRoute(data[k]);
  }

  hosts = data;
}

if (!fs.existsSync(hostsFilePath)) {
  fs.writeFileSync(hostsFilePath, "{}", fsOptions);
}

readFile();
fs.watchFile(hostsFilePath, function () {
  console.log('Reloading hosts file...');
  readFile();
});

module.exports = function (req) {
  var host = req.headers.host;

  if (!host) {
    return null;
  }

  return hosts[host.split(':')[0]];
};