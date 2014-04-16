var fs = require('fs');

var hostsFilePath = __dirname + '/../hosts.json';
var hosts = {};

if (!fs.existsSync(hostsFilePath)) {
    fs.writeFileSync(hostsFilePath, "{}", {encoding: 'utf-8'});
}


function readFile() {
    hosts = JSON.parse(fs.readFileSync(hostsFilePath, {encode: 'utf-8'}));
}

readFile();
fs.watchFile(hostsFilePath, function (curr, prev) {
    console.log('Reloading hosts file...');
    readFile();
});

module.exports = function (host) {
    return hosts[host];
};