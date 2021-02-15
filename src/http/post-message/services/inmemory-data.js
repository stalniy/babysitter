const STORAGE = {
  babies: new Map([
    [616953564, {
      table: 'babies',
      key: 616953564,
      name: 'Anna',
      birthDate: '2020-09-09',
    }],
  ]),
};

async function get(options) {
  STORAGE[options.table] = STORAGE[options.table] || new Map();
  const list = STORAGE[options.table];

  if (options.key) {
    return list.get(options.key);
  }

  return Array.from(list.values());
}

let ID = 1;
async function set(options) {
  STORAGE[options.table] = STORAGE[options.table] || new Map();
  const list = STORAGE[options.table];
  options.key = options.key || String(ID++);

  list.set(options.key, options);
  return options;
}

module.exports = {
  get,
  set,
};
