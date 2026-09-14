const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d', // long-lived, but stored more carefully (see below)
  });
};

module.exports = { generateAccessToken, generateRefreshToken };