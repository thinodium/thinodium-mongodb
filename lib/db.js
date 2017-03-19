"use strict";

const _ = require('lodash')
const MongoClient = require('mongodb').MongoClient
const Thinodium = require('thinodium')

const Model = require('./model')



/**
 * Represents a db model/collection.
 */
class MongoDb extends Thinodium.Database {
  /**
   * Create a database connection.
   *
   * @param {Object} options connection options (as supported by mongodb native module)
   * @param {String} options.url Mongo single host or replicaset URL
   * @param {String} options Additional options, see http://mongodb.github.io/node-mongodb-native/2.2/tutorials/connect/
   *
   * @return {Promise} resolves to db connection.
   */
  _connect (options) {
    return MongoClient.connect(options.url, _.omit(options, 'url'))
  }


  _disconnect (connection) {
    return connection.close(true)
  }


  _model (connection, name, config) {
    return new Model(connection, name, config)
  }

}


module.exports = MongoDb;
