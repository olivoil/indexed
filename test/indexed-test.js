(function() {
  var Indexed    = require('indexed');
  var testBuffer = Indexed.toArrayBuffer('foo');

  function factory(location) {
    return new Indexed(location);
  }

  var dbidx  = 0;
  var dbName = 'leveldown-test-db';
  var testCommon = {};

  testCommon.location = function() {
    return dbName + ':' + dbidx++;
  };

  testCommon.setUp =
  testCommon.tearDown = function (t) {
    dbidx = 0; // reset counter
    Indexed.destroy(dbName, function(err) {
      t.notOk(err, 'cleanup returned an error');
      t.end();
    });
  };

  // Test compatibility with LevelDown API
  require('abstract-leveldown/abstract/leveldown-test').args(factory, tape, testCommon);
  require('abstract-leveldown/abstract/open-test').all(factory, tape, testCommon);
  require('abstract-leveldown/abstract/close-test').close(factory, tape, testCommon);
  require('abstract-leveldown/abstract/put-test').all(factory, tape, testCommon);
  require('abstract-leveldown/abstract/del-test').all(factory, tape, testCommon);
  require('abstract-leveldown/abstract/get-test').all(factory, tape, testCommon);
  require('abstract-leveldown/abstract/put-get-del-test').all(factory, tape, testCommon, testBuffer);
  // require('abstract-test-suite/abstract/batch-test').all(factory, tape, testCommon);
  // require('abstract-test-suite/abstract/chained-batch-test').all(factory, tape, testCommon);
  // require('abstract-test-suite/abstract/iterator-test').all(factory, tape, testCommon);
}).call(this);
