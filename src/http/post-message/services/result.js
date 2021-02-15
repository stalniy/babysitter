function error(message) {
  return {
    type: 'error',
    message,
  };
}

function value(rawValue) {
  return {
    type: 'value',
    value: rawValue,
  };
}

module.exports = {
  error,
  value,
};
