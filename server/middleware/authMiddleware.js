import jwt from 'jsonwebtoken';
import config from '../config.js';

console.log(config.JWT_TOKEN_SECRET);
export const authenticateUserMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_TOKEN_SECRET);
    console.log({ decoded });
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAsAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    if (decoded.role === 'ADMIN') {
      next();
    } else {
      return res.sendStatus(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const auditTrailMiddleware = async ({ employeeId, name, action }) => {
  console.log({ employeeId, action });
  // if (!employeeId || !name || !action) {
  //   return res.status(400).json({ error: 'Missing required fields' });
  // }
  const query = `INSERT INTO audit_trail (employeeId, action, dateTime) 
    VALUES (?, ?, NOW())`;
  await config.mySqlDriver.query(query, [employeeId, action]);
};
