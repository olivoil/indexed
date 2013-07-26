var _     = require('underscore');
var dbidx = 0;

exports.location = function() {
  return namespace(dbidx++);
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
  if (!dbidx) return cb();

  var done = _.after(dbidx, cb);
  _.times(dbidx, function(i) {
    Indexed.dropDb(namespace(i), function(err) {
      err ? cb(err) : done();
    });
  });

  // reset counter
  dbidx = 0;
}

function namespace(i) {
  return 'leveldown-test-db:' + i;
}
