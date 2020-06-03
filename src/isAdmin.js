const admins = require('../config').admins

function isAdmin (author) {
  return admins.includes(author.id)
}

module.exports = isAdmin
