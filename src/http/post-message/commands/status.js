const actions = require('../actions');

module.exports = {
  name: 'status',
  description: 'Shows the current baby state',
  exec: actions.refreshStatus.exec,
};
