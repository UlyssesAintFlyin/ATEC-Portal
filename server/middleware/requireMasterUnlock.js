const jwt = require("jsonwebtoken");

module.exports = function requireMasterUnlock(req, res, next) {
    const token = req.headers['x-master-token'];
    if (!token) return res.status(403).json({ message: 'Main admin verification required.' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.master && String(payload.sub) === String(req.user.id)) return next();
    } catch { }

    res.status(403).json({ message: 'Main admin verification required.' });
};