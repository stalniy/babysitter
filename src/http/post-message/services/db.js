process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.BS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.BS_SECRET_ACCESS_KEY;

const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const db = new DynamoDB({
  region: 'eu-central-1',

});

module.exports = {
  db,
  marshall,
  unmarshall,
};
