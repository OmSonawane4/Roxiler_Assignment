const jwt = require('jsonwebtoken');

const auth = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No authentication token, access denied'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // If no specific roles are required, just verify authentication
            if (allowedRoles.length === 0) {
                return next();
            }

            // Check if user has required role
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You do not have permission to access this resource'
                });
            }

            next();
        } catch (error) {
            res.status(401).json({
                status: 'error',
                message: 'Token is invalid or expired'
            });
        }
    };
};

const isStoreOwner = (req, res, next) => {
    if (req.user.role !== 'store_owner' && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Store owner access required.'
        });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin access required.'
        });
    }
    next();
};

module.exports = {
    auth,
    isStoreOwner,
    isAdmin
};