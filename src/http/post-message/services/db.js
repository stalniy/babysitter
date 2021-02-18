const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const db = new DynamoDB({ region: 'eu-central-1' });

module.exports = {
  db,
  marshall,
  unmarshall,
};
