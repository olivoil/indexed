var tape       = require('tape');
var testCommon = require('./test-common');

function factory(location) {
  return new Indexed(location);
}

// Test compatibility with basic LevelDOWN API
require('abstract-leveldown/abstract/leveldown-test').args(factory, tape, testCommon);
require('abstract-leveldown/abstract/open-test').all(factory, tape, testCommon);
require('abstract-leveldown/abstract/close-test').close(factory, tape, testCommon);
// require('abstract-leveldown/abstract/put-test').all(factory, tape, testCommon)
// require('abstract-leveldown/abstract/del-test').all(factory, tape, testCommon)
// require('abstract-leveldown/abstract/get-test').all(factory, tape, testCommon);
// require('abstract-leveldown/abstract/put-get-del-test').all(factory, tape, testCommon, testBuffer)
// require('abstract-leveldown/abstract/batch-test').all(factory, tape, testCommon)
// require('abstract-leveldown/abstract/chained-batch-test').all(factory, tape, testCommon)
// require('abstract-leveldown/abstract/iterator-test').all(factory, tape, testCommon)
