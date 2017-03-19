"use strict";

var _ = require('lodash'),
  Q = require('bluebird');

var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Plugin = utils.Plugin,
  Database = Plugin.Database,
  Model = Plugin.Model;


var test = utils.createTest(module);



test['connect/disconnect'] = {
  beforeEach: function*() {
    this.db = new Database();
  },

  afterEach: function*() {
    yield this.db.disconnect();
  },

  'connects to new db': function*() {
    yield this.db.connect(this.dbConfig)

    const db1 = this.db.connection.db('test2')

    var collections = yield db1.listCollections().toArray()

    collections.length.should.eql(0)
  }
};


test['model'] = {
  beforeEach: function*() {
    this.db = new Database();

    yield this.db.connect(this.dbConfig)
  },

  afterEach: function*() {
    yield this.db.disconnect();
  },

  'will create table': function*() {
    let m = yield this.db.model('test_table');

    let cols = yield this._db.listCollections({ name: 'test_table' }).toArray()

    cols.length.should.eql(1)
  },

  'will create indexes': function*() {
    let m = yield this.db.model('test_table', {
      indexes: [
        {
          keys: { age: 1 },
          options: {
            name: 'age_up'
          }
        },
        {
          keys: { name: 1 },
          options: {
            unique: true
          }
        },
      ],
    });

    let indexes = yield this._db.indexInformation('test_table')
  },
}
