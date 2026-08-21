const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

// Verifies the "Authorization: Bearer <token>" header and attaches req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await UserModel.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

module.exports = { protect };
