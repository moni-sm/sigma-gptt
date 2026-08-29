import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sigmagpt_super_secret_jwt_key_2026";

// Require valid JWT token
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, email, name }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

// Optional auth (attaches user if token provided, but doesn't block guests)
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Token invalid or expired, continue as guest
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};
