const data = require('@begin/data');

exports.handler = async () => {
  await data.destroy([
    { table: 'regime', key: '1YqkRmZrUB' },
    { table: 'regime', key: '7nzxB2KyTQ' },
    { table: 'regime', key: '8oAyDPPPsB' },
    { table: 'regime', key: '9pBmWzmNfz' },
    { table: 'regime', key: 'B8pyqK9JcP' },
    { table: 'regime', key: 'MEg668NYUq' },
    { table: 'regime', key: 'QNmxzLNrH4' },
    { table: 'regime', key: 'WwvR5gN8SD' },
    { table: 'regime', key: 'lastFallAsleep.-503512180' },
    { table: 'regime', key: 'lastFallAsleep.616953564' },
    { table: 'regime', key: 'lastWakeUp.-503512180' },
    { table: 'regime', key: 'lvLywRj8uD' },
    { table: 'regime', key: 'xV504QEWtD' },
    { table: 'regime', key: 'zB5o3PBASm' },
    { table: 'todos', key: 'QNmXRrDAck' },
    { table: 'babies', key: -503512180 },
    { table: 'babies', key: 616953564 },
  ]);
};
