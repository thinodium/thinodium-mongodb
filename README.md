# Thinodium MongoDB adapter

[![Build Status](https://travis-ci.org/thinodium/thinodium-mongodb.svg?branch=master)](http://travis-ci.org/thinodium/thinodium-mongodb)
[![npm](https://img.shields.io/npm/v/thinodium-mongodb.svg?maxAge=2592000)](https://www.npmjs.com/package/thinodium-mongodb)
[![Join the chat at https://discord.gg/bYt4tWB](https://img.shields.io/badge/discord-join%20chat-738bd7.svg?style=flat-square)](https://discord.gg/bYt4tWB)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)

A MongoDB adapter for [thinodium](https://github.com/thinodium/thinodium)
which internally uses the [official MongoDB driver](http://mongodb.github.io/node-mongodb-native/2.2/api/).

Special features:

* Creates indexes if they don't already exist.

## Installation

```bash
$ npm install thinodium thinodium-mongodb mongodb@2.2
```

## Usage examples

```js
const Thinodium = require('thinodium');

const db = yield Thinodium.connect('mongodb', {
  // connection string
  url: 'mongodb://localhost:27017/test',
  /* all options get passed to native driver module */
  ...
});

/*
  This will create the "User" table and all specified indexes if they
  don't already exist.
 */
const User = yield db.model('User', {
  /* See https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#db.collection.createIndex */
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

// insert a new user
let user = yield User.insert({
  name: 'john'
});

// ... normal thinodium API methods available at this point
```

Check out the [thinodium docs](https://hiddentao.github.io/thinodium) for further usage examples and API docs.

## Building

To run the tests you will need [MongoDB](https://www.mongodb.com/) installed
and running with default host and port settings. Then on the command-line:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/thinodium/thinodium-mongodb/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/thinodium/thinodium-mongodb/blob/master/LICENSE.md)
