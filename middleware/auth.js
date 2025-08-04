const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Server error in authentication' 
    });
  }
};

module.exports = { authenticateToken };