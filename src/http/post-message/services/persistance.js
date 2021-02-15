module.exports = process.env.NODE_ENV === 'testing'
? require('./inmemory-data')
: require('@begin/data');
