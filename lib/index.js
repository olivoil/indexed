var Indexed  = require('./indexeddb');
module.exports = Indexed.supported ? Indexed : require('./localstorage');
