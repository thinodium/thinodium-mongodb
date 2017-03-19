"use strict";

require('co-mocha');

const _ = require('lodash'),
  chai = require('chai'),
  path = require('path'),
  sinon = require('sinon'),
  Q = require('bluebird'),
  ReplicaSet = require('mongo-replica-set').ReplicaSet,
  MongoClient = require('mongodb').MongoClient;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

exports.assert = chai.assert;
exports.expect = chai.expect;
exports.should = chai.should();

exports.sinon = sinon;

exports.Thinodium = require('thinodium');
exports.Plugin = require('../');

const DB_NAME = 'thinodium-mongodb-test'

const testObjectMethods = {
  startDb: function(isReplicaSet = false) {
    this._rs = new ReplicaSet({
      numInstances: isReplicaSet ? 3 : 1,
      startPort: 55000,
      // verbose: true
    });

    return this._rs.start()
  },
  stopDb: function() {
    if (this._rs) {
      return this._rs.stop()
      .then(() => {
        this._rs = null
      })
    }
  },
  connect: function(dbName = DB_NAME) {
    return MongoClient.connect(`mongodb://localhost:55000/${dbName}`)
    .then(db => {
      this._db = db
      this._db.collectionAsync = Q.promisify(this._db.collection, this._db)
    })
  },
  disconnect: function() {
    if (!this._db) {
      return Q.resolve();
    } else {
      return this._db.close(true)
      .then(() => {
        this._db = null
      })
    }
  },
  dropDb: function(dbName = DB_NAME) {
    if (this._db) {
      return this._db.dropDatabase(dbName)
    } else {
      return Q.resolve()
    }
  },
};



exports.createTest = function(_module) {
  var test = _module.exports = {};

  var testMethods = {};

  test[path.basename(_module.filename)] = {
    beforeEach: function*() {
      this.mocker = sinon.sandbox.create();

      _.each(testObjectMethods, (m, k) => {
        this[k] = _.bind(m, this);
      });

      yield this.startDb();
      yield this.connect();
      this.dbName = DB_NAME
      this.dbConfig = {
        url: `mongodb://localhost:55000/${this.dbName}`
      }
    },
    afterEach: function*() {
      yield this.disconnect();
      yield this.dropDb();
      yield this.stopDb();

      this.mocker.restore();
    },
    'tests': testMethods
  };

  return testMethods;
};
