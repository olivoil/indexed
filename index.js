
/**
 * Module dependencies.
 */

var store    = require('store');
var nextTick = require('next-tick');
var type     = require('type');

/**
 * Local variables.
 */

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB;
var dbs       = {};
var indexOf   = [].indexOf;
var slice     = [].slice;

/**
 * Check support of latest standarts.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase#Browser_Compatibility
 */

var IDBDatabase       = window.IDBDatabase || window.webkitIDBDatabase;
var IDBTransaction    = window.IDBTransaction || window.webkitIDBTransaction;
var hasOnUpgradeEvent = ! IDBDatabase.prototype.setVersion;
var hasStringModes    = IDBTransaction.READ_WRITE !== 1;
var hasIndexedDB      = !! indexedDB;

/**
 * Expose public api.
 */

module.exports    = exports = Indexed;
exports.drop      = drop;
exports.supported = hasIndexedDB && hasOnUpgradeEvent && hasStringModes;

/**
 * Drop IndexedDB instance by name.
 *
 * @options {String} dbName
 * @options {function} cb
 * @api public
 */

function drop(dbName, cb) {
  store('indexed-' + dbName, null);

  if (dbs[dbName]) {
    db.close();
    delete dbs[dbName];
  }

  var req = indexedDB.deleteDatabase(dbName);
  req.onerror = onerror(cb);
  req.onsuccess = function(event) { cb(); };
}

/**
 * Construtor to wrap IndexedDB API with nice async methods.
 * `name` contains db-name and store-name splited with colon.
 *
 * Example:
 *
 *   // connect to db with name `notepad`, use store `notes`
 *   // use _id field as a key
 *   var indexed = new Indexed('notepad:notes', { key: '_id' });
 *
 * @options {String} name
 * @options {Object} options
 * @api public
 */

function Indexed(name, options) {
  if (type(name) !== 'string') throw new TypeError('name required');
  if (!options) options = {};
  var params = name.split(':');

  this.dbName    = params[0];
  this.name      = params[1];
  this.key       = options.key || 'id';
  this.autoKey   = options.autoKey || true;
  this.connected = false;
}

/**
 * Get all values from the object store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.all = transaction('readonly', function(store, tr, cb) {
  var result = [];
  var req = store.openCursor();
  req.onerror = onerror(cb);
  req.onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    } else {
      cb(null, result);
    }
  };
});

/**
 * Get object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.get = transaction('readonly', function(store, tr, key, cb) {
  var req = store.get(key);
  req.onerror = onerror(cb);
  req.onsuccess = function(event) { cb(null, req.result); };
});

/**
 * Clear object store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.clear = transaction('readwrite', function(store, tr, cb) {
  var req = store.clear();
  req.onerror = onerror(cb);
  tr.oncomplete = function(event) { cb(null); };
});

/**
 * Delete object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.del = transaction('readwrite', function(store, tr, key, cb) {
  var req = store.delete(key);
  req.onerror = onerror(cb);
  tr.oncomplete = function(event) { cb(null); };
});

/**
 * Put - replace or create object by `key` with `val`.
 * Extends `val` with `key` automatically.
 *
 * @options {Mixin} key
 * @options {Mixin} val
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.put = transaction('readwrite', function(store, tr, key, val, cb) {
  if (this.autoKey) val[this.key] = key;
  try {
    var req = store.put(val);
    req.onerror = onerror(cb);
    tr.oncomplete = function(event) { cb(null, val); };
  } catch (err) {
    nextTick(function(){ cb(err); });
  }
});

/**
 * Creates new transaction and returns object store.
 *
 * @options {String} mode - readwrite|readonly
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._getStore = function(mode, cb) {
  var that = this;
  this._getDb(function(err, db) {
    if (err) return cb(err);

    var transaction = db.transaction([that.name], mode);
    var objectStore = transaction.objectStore(that.name);
    cb.call(that, null, objectStore, transaction);
  });
};

/**
 * Returns db instance, performs connection and upgrade if needed.
 *
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._getDb = function(cb) {
  var that = this;
  var db   = dbs[this.dbName];

  if (db) {
    if (this.connected) return cb(null, db);
    this._connectOrUpgrade(db, cb);
  } else {
    var req = indexedDB.open(this.dbName);
    req.onerror = onerror(cb);
    req.onsuccess = function(event) {
      var db = this.result;
      dbs[that.dbName] = db;
      that._connectOrUpgrade(db, cb);
    };
  }
};

/**
 * Check that `db.version` is equal to config version or
 * Performs connect or db upgrade.
 *
 * @options {Object} db
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._connectOrUpgrade = function(db, cb) {
  var config = this._getUpgradeConfig(db, false);

  if (config.version !== db.version) {
    this._upgrade(db, cb);
  } else {
    this.connected = true;
    cb(null, db);
  }
};

/**
 * Close current db connection and open new.
 * Create object store if needed and recreate it when keyPath changed.
 *
 * @options {Object} db
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._upgrade = function(db, cb) {
  var that   = this;
  var config = this._getUpgradeConfig(db, true);

  db.close();
  var req = indexedDB.open(this.dbName, config.version);
  req.onerror = onerror(cb);
  req.onsuccess = function(event) {
    var db = event.target.result;
    dbs[that.dbName] = db;
    that.connected = true;
    cb(null, db);
  };
  req.onupgradeneeded = function(event) {
    var db = this.result;

    if (config.action === 'recreate') db.deleteObjectStore(that.name);
    if (config.action) db.createObjectStore(that.name, { keyPath: that.key });
  };
};

/**
 * Returns config for upgrade of `db`: new version and action.
 * Prefers info from db to stored config.
 * Backup config to localStorage when `save` is true.
 *
 * @options {Object} db
 * @options {Boolean} save
 * @api private
 */

Indexed.prototype._getUpgradeConfig = function(db, save) {
  var name    = 'indexed-' + this.dbName;
  var version = db.version || 1;
  var config  = store(name) || { version: version, stores: [], keys: {} };
  var action  = null;

  if (config.stores.indexOf(this.name) < 0) {
    config.stores.push(this.name);
    if (indexOf.call(db.objectStoreNames, this.name) < 0) {
      config.version += 1;
      action = 'create';
    }
  }
  if (!config.keys[this.name] || config.keys[this.name] !== this.key) {
    config.keys[this.name] = this.key;
    if (!action) {
      var objectStore = db.transaction([this.name], 'readonly')
        .objectStore(this.name);

      if (objectStore.keyPath !== this.key) {
        config.version += 1;
        action = 'recreate';
      }
    }
  }

  if (save) store(name, config);
  return { version: config.version, action: action };
};

/**
 * Helper to manage errors.
 *
 * @options {Function} cb
 * @return {Function}
 */

function onerror(cb) {
  return function(event) {
    cb(event.target.errorCode);
  };
}

/**
 * Helper to force new transaction for current store.
 *
 * @options {String} mode {readwrite|readonly}
 * @options {Function} handler
 * @return {Function}
 */

function transaction(mode, handler) {
  return function() {
    var args = slice.call(arguments, 0);
    var cb   = args[args.length - 1];

    this._getStore(mode, function(err, store, tr) {
      if (err) return cb(err);
      handler.apply(this, [store, tr].concat(args));
    });
  };
}
