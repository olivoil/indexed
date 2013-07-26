var dbidx  = 0;
var dbName = 'leveldown-test-db';

exports.location = function() {
  return dbName + ':' + dbidx++;
};

exports.setUp =
exports.tearDown = function (t) {
  cleanup(function(err) {
    t.notOk(err, 'cleanup returned an error');
    t.end();
  });
};

/**
 * Helpers
 */

function cleanup(cb) {
  dbidx = 0; // reset counter
  Indexed.destroy(dbName, cb);
}
