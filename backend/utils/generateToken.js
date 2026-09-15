const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, authTokenVersion = 0) => {
  return jwt.sign({ id: userId, authTokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '15d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };