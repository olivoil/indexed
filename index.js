var Indexed  = require('./lib/indexeddb');
var LocalStorage  = require('./lib/localstorage');

var supported = Indexed.supported || LocalStorage.supported;

if(supported){
  exports = module.exports = Indexed.supported ? Indexed : LocalStorage;
} else {
}

exports.supported = supported;
