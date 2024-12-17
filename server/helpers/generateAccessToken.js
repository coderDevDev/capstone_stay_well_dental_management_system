import jwt from 'jsonwebtoken';
import config from '../config.js';

console.log({ config: config.JWT_TOKEN_SECRET });

export const generateAccessToken = user => {
  if (!user.role) {
    user.role = 'USER';
  }
  return jwt.sign(user, config.JWT_TOKEN_SECRET, { expiresIn: '1h' });
};
