// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
};

const esAdministrador = (req, res, next) => {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

const esDependiente = (req, res, next) => {
    if (req.usuario.rol !== 'dependiente') {
        return res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol de dependiente' });
    }
    next();
    

};

const soloAdminEscritura = (req, res, next) =>
    req.method === 'GET' ? next() : esAdministrador(req, res, next);


module.exports = { verificarToken, esAdministrador, esDependiente, soloAdminEscritura };