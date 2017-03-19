"use strict";

const _ = require('lodash')
const Q = require('bluebird')
const ObjectID = require('mongodb').ObjectID
const Thinodium = require('thinodium')


class MongoModel extends Thinodium.Model {
  /**
   * Construct this model instance.
   *
   * @param  {Object} db  Database connection object.
   * @param  {String} name Table name.
   * @param  {Object} [cfg] Configuration
   * @param  {Object} [cfg.indexes] Indexes to setup.
   */
  constructor (db, name, cfg) {
    cfg = cfg || {};

    if (!cfg.pk) {
      cfg.pk = '_id';
    }

    super(db, name, cfg);
  }


  /**
   * @override
   */
  init () {
    const db = this.db

    return new Q((resolve, reject) => {
      db.collection(this.name, { strict: true }, (err, collection) => {
        if (err) {
          db.createCollection(this.name, _.get(this._cfg, 'collectionOptions', {}))
          .then(resolve, reject)
        } else {
          resolve(collection)
        }
      })
    })
    .then(collection => {
      this.collection = collection

      return Q.map(_.get(this._cfg, 'indexes', []), index => (
        this.collection.createIndex(index.keys, index.options)
      ))
    })
  }


  /**
   * @override
   */
  rawQry () {
    return this.collection
  }


  /**
   * @override
   */
  rawGet (id) {
    return Q.try(() => {
      if (undefined === id || null === id) {
        return null
      }

      return this.rawQry().findOne({ [this.pk]: id })
    })
  }

  /**
   * @override
   */
  rawGetAll () {
    return this.rawQry().find().toArray()
  }


  /**
   * @override
   */
  rawInsert (rawDoc) {
    return Q.try(() => {
      if (this.schema) {
        return this.schema.validate(rawDoc);
      }
    })
      .then(() => this.rawQry().insertOne(rawDoc, _.get(this._cfg, 'defaultInsertOptions', { w: 1 })))
      .then(ret => {
        let newDoc = _.extend({}, rawDoc);

        if (!newDoc[this.pk] && _.get(ret.insertedIds, 'length')) {
          newDoc[this.pk] = ret.insertedId.toHexString();
        }

        return newDoc;
      });
  }

  /**
   * @override
   */
  rawUpdate (id, changes) {
    return Q.try(() => {
      if (this.schema) {
        return this.schema.validate(changes, {
          ignoreMissing: true,
        });
      }
    })
      .then(() => this.rawQry().updateOne({
        _id: new ObjectID(id)
      }, {
        $set: changes
      }, _.get(this._cfg, 'defaultUpdateOptions', { w: 1 })))
  }

  /**
   * @override
   */
  rawRemove (id) {
    return this.rawQry().deleteOne({
      _id: new ObjectID(id)
    }, _.get(this._cfg, 'defaultDeleteOptions', { w: 1 }))
  }

};


module.exports = MongoModel;
