const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

const adminOrStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Admin or staff access required' });
  }
  
  next();
};

const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user is the owner of the resource
  if (req.params.userId && req.user.id !== parseInt(req.params.userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

module.exports = { authorize, adminOnly, adminOrStaff, ownerOrAdmin };