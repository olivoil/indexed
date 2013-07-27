var type   = require('type');
var buffer = require('./buffer');

exports.toString = function(val) {
  var result, currentType = type(val);

  if (buffer.isBuffer(val)) result = buffer.bufferToStr(val);
  else if (currentType === 'number' && val !== +val) result = 'NaN'; // isNaN
  else if (currentType !== 'string' && currentType !== 'object') result = JSON.stringify(val);

  return result || val;
};

exports.checkKeyValue = function(key, keyValueType) {
  var msg;

  if (key === null || key === undefined) msg = 'cannot be `null` or `undefined`';
  else if (buffer.isEmpty(key)) msg = 'cannot be an empty ArrayBuffer';
  else if (key === '') msg = 'cannot be an empty String';
  else if (type(key) === 'array' && key.length === 0) msg = 'cannot be an empty Array';

  if (msg) return new Error(keyValueType + ' ' + msg);
};
