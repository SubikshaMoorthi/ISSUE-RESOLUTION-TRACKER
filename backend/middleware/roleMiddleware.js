const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user was set by the protect middleware
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied: ${req.user.role} is not authorized to perform this action.` 
            });
        }
        next();
    };
};

module.exports = allowRoles;