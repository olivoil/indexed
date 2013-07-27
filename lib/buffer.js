/**
 * Quick and dirty Buffer helper for browser
 */

exports.isBuffer = function(buf) {
  return buf instanceof ArrayBuffer;
};

exports.isEmpty = function(buf) {
  return exports.isBuffer(buf) && buf.byteLength === 0;
};

// https://github.com/maxogden/level.js/blob/master/index.js#L102
exports.strToBuffer = function(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// https://github.com/maxogden/level.js/blob/master/index.js#L98
exports.bufferToStr = function(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};
