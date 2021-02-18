const {
  db, marshall, unmarshall, tableName,
} = require('./db');

const babies = new Map();
const TableName = tableName('babysitter_baby');

async function get(id) {
  let baby = babies.get(id);

  if (!baby) {
    const response = await db.getItem({
      TableName,
      Key: marshall({ id }),
    });
    baby = response.Item ? unmarshall(response.Item) : null;
    babies.set(id, baby);
  }

  return baby;
}

async function create(baby) {
  await db.putItem({
    TableName,
    Item: marshall(baby),
  });
  babies.set(baby.id, baby);
}

module.exports = {
  get,
  create,
};
