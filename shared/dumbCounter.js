let moos = 0;

module.exports = {
  moo: () => ++moos,
  count: () => moos
};
