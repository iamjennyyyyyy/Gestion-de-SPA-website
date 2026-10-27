const express = require('express');
const path = require('path');
const app = require('express')();
const cors = require('cors');

const areaRoutes = require('./routes/areaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const distritoRoutes = require('./routes/distritoRoutes');
const materialRoutes = require('./routes/materialRoutes');
const paqueteRoutes = require('./routes/paqueteRoutes');
const tratamientoRoutes = require('./routes/tratamientoRoutes');
const paqueteVendidoRoutes = require('./routes/paqueteVendidoRoutes');
const citaRoutes = require('./routes/citaRoutes');
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

// En app.js - cambiar a:
const { verificarToken, esAdministrador, soloAdminEscritura } = require('./middlewares/authMiddleware');

require('./jobs/refreshMaterializedViews');

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`📢 ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/auth', authRoutes);

app.use('/api/areas',        verificarToken, soloAdminEscritura, areaRoutes);
app.use('/api/categorias',   verificarToken, soloAdminEscritura, categoriaRoutes);
app.use('/api/distritos',    verificarToken, soloAdminEscritura, distritoRoutes);
app.use('/api/empleados',    verificarToken, soloAdminEscritura, empleadoRoutes);
app.use('/api/materiales',   verificarToken, soloAdminEscritura, materialRoutes);
app.use('/api/paquetes',     verificarToken, soloAdminEscritura, paqueteRoutes);
app.use('/api/tratamientos', verificarToken, soloAdminEscritura, tratamientoRoutes);
app.use('/api/clientes', verificarToken, clienteRoutes);
app.use('/api/paquetes-vendidos', verificarToken, paqueteVendidoRoutes);
app.use('/api/citas', verificarToken, citaRoutes);
app.use('/api/reportes', verificarToken, reporteRoutes);

app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});