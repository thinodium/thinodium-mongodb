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

var Document = utils.Thinodium.Document;


var test = utils.createTest(module);


test['model'] = {
  beforeEach: function*() {
    this.db = new Database();

    yield this.db.connect(this.dbConfig)

    this.model = yield this.db.model('test');

    this._col = yield this._db.collectionAsync('test')
  },

  afterEach: function*() {
    yield this.db.disconnect();
  },

  'can do a raw query': function*() {
    let ret = yield this.model.rawQry().insertOne({
      name: 'john'
    })

    ret.insertedCount.should.eql(1)

    let items = yield this._col.find().toArray()

    items[0].name.should.eql('john')
  },

  'can raw insert': function*() {
    let doc = yield this.model.rawInsert({
      name: 'john'
    });

    doc.should.not.be.instanceof(Document);

    doc._id.should.be.defined;

    const item = yield this._col.findOne({ _id: doc._id })

    item.name.should.eql('john')
  },

  'can insert': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    doc.should.be.instanceof(Document);

    doc.id.should.be.defined;

    doc.name.should.eql('john')
  },

  'can raw get by id': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    let newdoc = yield this.model.rawGet(doc.id);

    newdoc._id.should.be.defined;

    newdoc.name.should.eql('john');
  },

  'can get by id': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    let newdoc = yield this.model.get(doc.id);

    newdoc.should.be.instanceOf(Document)
    newdoc.id.should.be.defined;
  },

  'can get all': function*() {
    let docs = yield [
      this.model.insert({
        name: 'john'
      }),
      this.model.insert({
        name: 'david'
      }),
    ];

    let newdocs = yield this.model.getAll();

    newdocs.length.should.be.eql(2);

    newdocs[0].should.be.instanceof(Document);

    let names = _.map(newdocs, (d) => d.name);
    names.sort();

    names.should.eql(['david', 'john']);
  },

  'can raw update': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    yield this.model.rawUpdate(doc.id, {
      name: 'mark'
    });

    let newdoc = yield this.model.get(doc.id);

    expect(newdoc.name).to.eql('mark');
  },

  'can raw remove': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    yield this.model.rawRemove(doc.id);

    let newdoc = yield this.model.get(doc.id);

    expect(newdoc).to.be.null;
  },

};



test['model with schema'] = {
  beforeEach: function*() {
    this.db = new Database();

    yield this.db.connect(this.dbConfig)

    this.model = yield this.db.model('test', {
      schema: {
        title: {
          type: String,
          enum: ['mr', 'mrs'],
        },
        age: {
          type: Number,
          required: true,
        },
      },
    });

    let col = yield this._db.collectionAsync('test')

    let ret = yield col.insertOne({ name: 'tom' })

    this._id = ret.insertedId.toHexString()
  },

  afterEach: function*() {
    yield this.db.disconnect();
  },

  'bad insert': function*() {
    try {
      yield this.model.insert({
        name: 'john',
        title: 'test',
      });

      throw new Error('FAIL');
    } catch (err) {
      if (0 <= err.toString().indexOf('FAIL')) {
        throw err;
      }
    }
  },

  'good insert': function*() {
    yield this.model.insert({
      name: 'john',
      age: 19,
    });
  },

  'bad update': function*() {
    try {
      yield this.model.rawUpdate(this._id, {
        age: '23'
      });

      throw new Error('FAIL');
    } catch (err) {
      if (0 <= err.toString().indexOf('FAIL')) {
        throw err;
      }
    }
  },

  'good update': function*() {
    yield this.model.rawUpdate(this._id, {
      title: 'mrs',
      age: 19,
    });
  },
};
