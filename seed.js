const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postNicky',
  database: 'SPA_Services',
  port: 5432
});

async function seed() {
  console.log('Sembrando datos de prueba...\n');

  try {
    // 1. Limpiar datos existentes
    console.log('  Limpiando datos existentes...');
    await pool.query('DELETE FROM materialesporcita');
    await pool.query('DELETE FROM citas');
    await pool.query('DELETE FROM paquetevendido');
    await pool.query('DELETE FROM contenidopaquete');
    await pool.query('DELETE FROM empleadosfijosportratamiento');
    await pool.query('DELETE FROM materialesportratamiento');
    await pool.query('DELETE FROM empleadosporarea');
    await pool.query('DELETE FROM tratamientos');
    await pool.query('DELETE FROM paquetes');
    await pool.query('DELETE FROM materiales');
    await pool.query('DELETE FROM empleados');
    await pool.query('DELETE FROM clientes');
    await pool.query('DELETE FROM categorias');
    await pool.query('DELETE FROM areas');
    await pool.query('DELETE FROM distritos');
   
    console.log('  Datos limpiados');

    // 2. Distritos
    const distritos = [
      'Miraflores', 'San Isidro', 'Barranco', 'La Molina', 'San Borja',
      'Santiago de Surco', 'Jesus Maria', 'Lince', 'Magdalena', 'San Miguel'
    ];
    const distritoRows = [];
    for (const nombre of distritos) {
      const r = await pool.query(
        `INSERT INTO distritos (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING RETURNING iddistrito`,
        [nombre]
      );
      if (r.rows.length) distritoRows.push(r.rows[0].iddistrito);
    }
    console.log(`  ${distritoRows.length} distritos creados`);

    // 3. Areas
    const areas = ['Masajes', 'Faciales', 'Corporales', 'Estetica', 'Bienestar'];
    const areaRows = [];
    for (const nombre of areas) {
      const r = await pool.query(
        `INSERT INTO areas (nombre, cantidadpersonalfijo) VALUES ($1, 0) ON CONFLICT (nombre) DO NOTHING RETURNING idarea`,
        [nombre]
      );
      if (r.rows.length) areaRows.push(r.rows[0].idarea);
    }
    console.log(`  ${areaRows.length} areas creadas`);

    // 4. Categorias
    const catsData = [
      ['Masajes Relajantes', areaRows[0]],
      ['Masajes Terapeuticos', areaRows[0]],
      ['Limpieza Facial', areaRows[1]],
      ['Tratamiento Antiaging', areaRows[1]],
      ['Envolturas Corporales', areaRows[2]],
      ['Exfoliaciones', areaRows[2]],
      ['Manicure y Pedicure', areaRows[3]],
      ['Depilacion', areaRows[3]],
      ['Yoga y Meditacion', areaRows[4]],
      ['Aromaterapia', areaRows[4]],
    ];
    const catRows = [];
    for (const [nombre, idarea] of catsData) {
      if (!idarea) continue;
      const r = await pool.query(
        `INSERT INTO categorias (nombre, idarea) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING RETURNING idcategoria`,
        [nombre, idarea]
      );
      if (r.rows.length) catRows.push(r.rows[0].idcategoria);
    }
    console.log(`  ${catRows.length} categorias creadas`);

    // 5. Función para generar DNI
    function makeDni(yy, mm, dd, extra) {
      const siglo = yy > 25 ? '0' : '7';
      return String(yy).padStart(2, '0') + 
             String(mm).padStart(2, '0') + 
             String(dd).padStart(2, '0') + 
             siglo + 
             String(extra).padStart(4, '0');
    }

    // 6. Empleados - SIN ON CONFLICT porque no hay restricción UNIQUE en dni
    const empleadosData = [
      ['Carlos Martinez', 'Masoterapeuta', 8, 'Av. Principal 123', makeDni(95,1,1,2345), '999111001', distritoRows[0], true],
      ['Maria Garcia', 'Esteticista', 6, 'Jr. Las Flores 456', makeDni(88,5,12,6789), '999111002', distritoRows[1], true],
      ['Ana Lopez', 'Terapeuta Corporal', 8, 'Calle Los Olivos 789', makeDni(92,12,3,3456), '999111003', distritoRows[2], false],
      ['Luis Torres', 'Masajista Deportivo', 6, 'Av. Del Parque 321', makeDni(90,8,15,2345), '999111004', distritoRows[0], true],
      ['Sofia Ramirez', 'Cosmetologa', 7, 'Jr. Union 654', makeDni(97,7,28,5678), '999111005', distritoRows[3], false],
      ['Diego Herrera', 'Instructor Yoga', 5, 'Av. La Paz 987', makeDni(85,3,10,6789), '999111006', distritoRows[1], false],
      ['Valentina Rios', 'Aromaterapeuta', 6, 'Calle Bonita 147', makeDni(99,11,22,7890), '999111007', distritoRows[4], true],
      ['Jorge Castillo', 'Masajista', 8, 'Av. Los Alamos 258', makeDni(88,6,5,4567), '999111008', distritoRows[2], false],
      ['Camila Nuñez', 'Esteticista Integral', 7, 'Jr. Las Orquideas 369', makeDni(95,9,18,5678), '999111009', distritoRows[3], true],
      ['Andres Vega', 'Terapeuta', 6, 'Calle Sol 159', makeDni(93,2,1,8901), '999111010', distritoRows[0], false],
    ];
    
    const empRows = [];
    for (const emp of empleadosData) {
      const [nombre, especialidad, horastrabajo, direccion, dni, telefono, iddistrito, esfijo] = emp;
      if (!iddistrito) continue;
      try {
        // Verificar si ya existe (por nombre o dni)
        const existe = await pool.query(
          `SELECT idempleado FROM empleados WHERE nombre = $1 OR dni = $2`,
          [nombre, dni]
        );
        
        let idempleado;
        if (existe.rows.length === 0) {
          const r = await pool.query(
            `INSERT INTO empleados (nombre, especialidad, horastrabajo, direccion, dni, telefono, iddistrito, esfijo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idempleado`,
            [nombre, especialidad, horastrabajo, direccion, dni, telefono, iddistrito, esfijo]
          );
          idempleado = r.rows[0].idempleado;
        } else {
          idempleado = existe.rows[0].idempleado;
        }
        empRows.push(idempleado);
      } catch (e) { 
        console.log(`    ⚠ ${nombre}: ${e.message}`); 
      }
    }
    console.log(`  ${empRows.length} empleados creados`);

    // 7. Empleados por Area
    if (empRows.length && areaRows.length) {
      const empAreaPairs = [
        [empRows[0], areaRows[0]], [empRows[1], areaRows[1]], [empRows[2], areaRows[2]],
        [empRows[3], areaRows[0]], [empRows[4], areaRows[3]], [empRows[5], areaRows[4]],
        [empRows[6], areaRows[4]], [empRows[7], areaRows[2]], [empRows[8], areaRows[3]],
        [empRows[9], areaRows[0]],
      ];
      let empAreaCount = 0;
      for (const [idempleado, idarea] of empAreaPairs) {
        if (!idempleado || !idarea) continue;
        try {
          await pool.query(
            `INSERT INTO empleadosporarea (idempleado, idarea) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [idempleado, idarea]
          );
          empAreaCount++;
        } catch (e) { 
          console.log(`    ⚠ empleado ${idempleado} area ${idarea}: ${e.message}`);
        }
      }
      console.log(`  ${empAreaCount} empleados x area creados`);
    }

    // 8. Materiales
    const matsData = [
      ['Aceite de Almendras', 50],
      ['Crema Facial Hidratante', 30],
      ['Arcilla Blanca', 25],
      ['Aceite Esencial de Lavanda', 40],
      ['Exfoliante Corporal Natural', 20],
      ['Mascarilla Facial Purificante', 15],
      ['Gel de Aloe Vera', 35],
      ['Aceite de Coco Virgen', 45],
      ['Sales de Baño Aromaticas', 28],
      ['Crema Antiaging', 18],
      ['Incienso Natural', 60],
      ['Toallas Desechables', 100],
    ];
    const matRows = [];
    for (const [nombre, cantidad] of matsData) {
      const r = await pool.query(
        `INSERT INTO materiales (nombre, cantidad) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING RETURNING idmaterial`,
        [nombre, cantidad]
      );
      if (r.rows.length) matRows.push(r.rows[0].idmaterial);
    }
    console.log(`  ${matRows.length} materiales creados`);

    // 9. Tratamientos
    const tratData = [
      ['Masaje Relajante Full Body', 120.00, 'Masaje relajante de cuerpo completo con aceites esenciales', 60, catRows[0]],
      ['Masaje Descontracturante', 150.00, 'Masaje profundo para aliviar tensiones musculares', 45, catRows[1]],
      ['Limpieza Facial Profunda', 80.00, 'Limpieza facial con extraccion de puntos negros', 45, catRows[2]],
      ['Tratamiento Antiaging Premium', 200.00, 'Tratamiento facial rejuvenecedor con radiofrecuencia', 75, catRows[3]],
      ['Envoltura de Arcilla', 130.00, 'Envoltura corporal con arcilla blanca y aceites esenciales', 60, catRows[4]],
      ['Exfoliacion Corporal con Cafe', 90.00, 'Exfoliacion corporal con cafe y aceite de coco', 40, catRows[5]],
      ['Manicure Spa', 55.00, 'Manicure con tratamiento hidratante y esmalte', 35, catRows[6]],
      ['Pedicure Spa', 65.00, 'Pedicure completo con exfoliacion y masaje', 40, catRows[6]],
      ['Depilacion con Cera Natural', 45.00, 'Depilacion con cera natural hipoalergenica', 30, catRows[7]],
      ['Clase de Yoga Grupal', 35.00, 'Clase grupal de yoga para principiantes', 60, catRows[8]],
      ['Masaje con Aromaterapia', 140.00, 'Masaje relajante con aceites esenciales aromaticos', 55, catRows[9]],
      ['Sesion de Meditacion Guiada', 40.00, 'Sesion de meditacion guiada con tecnicas de respiracion', 45, catRows[9]],
    ];
    
    const tratRows = [];
    for (const [nombre, precio, descripcion, duracion, idcategoria] of tratData) {
      if (!idcategoria) {
        console.log(`    ⚠ ${nombre}: categoría no existe`);
        continue;
      }
      try {
        const r = await pool.query(
          `INSERT INTO tratamientos (nombre, precio, descripcion, duracion, idcategoria)
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (nombre) DO NOTHING 
           RETURNING idtratamiento`,
          [nombre, precio, descripcion, duracion, idcategoria]
        );
        if (r.rows.length) tratRows.push(r.rows[0].idtratamiento);
      } catch (e) { 
        console.log(`    ⚠ ${nombre}: ${e.message}`); 
      }
    }
    console.log(`  ${tratRows.length} tratamientos creados`);

    // 10. Materiales por Tratamiento
    if (tratRows.length && matRows.length) {
      const matTratPairs = [
        [tratRows[0], matRows[0], 3], [tratRows[0], matRows[6], 2],
        [tratRows[1], matRows[0], 2], [tratRows[1], matRows[3], 1],
        [tratRows[2], matRows[1], 2], [tratRows[2], matRows[5], 1], [tratRows[2], matRows[11], 2],
        [tratRows[3], matRows[3], 1], [tratRows[3], matRows[9], 2],
        [tratRows[4], matRows[2], 4], [tratRows[4], matRows[3], 2],
        [tratRows[5], matRows[4], 2], [tratRows[5], matRows[7], 1],
        [tratRows[6], matRows[1], 1],
        [tratRows[7], matRows[4], 2],
        [tratRows[10], matRows[0], 2], [tratRows[10], matRows[3], 2], [tratRows[10], matRows[8], 1],
      ];
      let matTratCount = 0;
      for (const [idtratamiento, idmaterial, cantidad] of matTratPairs) {
        if (!idtratamiento || !idmaterial) continue;
        try {
          await pool.query(
            `INSERT INTO materialesportratamiento (idtratamiento, idmaterial, cantidad) 
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [idtratamiento, idmaterial, cantidad]
          );
          matTratCount++;
        } catch (e) { 
          console.log(`    ⚠ material ${idmaterial} trat ${idtratamiento}: ${e.message}`);
        }
      }
      console.log(`  ${matTratCount} materiales x tratamiento creados`);
    }

    // 11. Empleados Fijos por Tratamiento
    const empleadosFijos = empRows.filter((_, i) => empleadosData[i][7] === true);
    if (empleadosFijos.length && tratRows.length) {
      const empTratPairs = [
        [empleadosFijos[0], tratRows[0]], [empleadosFijos[0], tratRows[1]],
        [empleadosFijos[1], tratRows[2]], [empleadosFijos[1], tratRows[3]], 
        [empleadosFijos[1], tratRows[6]], [empleadosFijos[1], tratRows[7]],
        [empleadosFijos[3], tratRows[4]], [empleadosFijos[3], tratRows[5]],
        [empleadosFijos[6], tratRows[10]],
        [empleadosFijos[8], tratRows[8]],
        [empleadosFijos[2], tratRows[9]],
      ];
      let empTratCount = 0;
      for (const [idempleadofijo, idtratamiento] of empTratPairs) {
        if (!idempleadofijo || !idtratamiento) continue;
        try {
          await pool.query(
            `INSERT INTO empleadosfijosportratamiento (idempleadofijo, idtratamiento) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [idempleadofijo, idtratamiento]
          );
          empTratCount++;
        } catch (e) { 
          console.log(`    ⚠ empleado ${idempleadofijo} trat ${idtratamiento}: ${e.message}`);
        }
      }
      console.log(`  ${empTratCount} empleados fijos x tratamiento creados`);
    }

    // 12. Paquetes
    const paqData = [
      ['Spa Express', 150.00, 80],
      ['Spa Completo', 280.00, 140],
      ['Pareja Relax', 350.00, 120],
      ['Bienestar Total', 220.00, 105],
    ];
    const paqRows = [];
    for (const [nombre, precio, duraciontotal] of paqData) {
      try {
        const r = await pool.query(
          `INSERT INTO paquetes (nombre, precio, duraciontotal)
           VALUES ($1, $2, $3) 
           ON CONFLICT (nombre) DO NOTHING 
           RETURNING idpaquete`,
          [nombre, precio, duraciontotal]
        );
        if (r.rows.length) paqRows.push(r.rows[0].idpaquete);
      } catch (e) { 
        console.log(`    ⚠ ${nombre}: ${e.message}`); 
      }
    }
    console.log(`  ${paqRows.length} paquetes creados`);

    // 13. Contenido de Paquetes
    if (paqRows.length && tratRows.length) {
      const contentData = [
        [paqRows[0], tratRows[0]], [paqRows[0], tratRows[6]],
        [paqRows[1], tratRows[0]], [paqRows[1], tratRows[2]], [paqRows[1], tratRows[4]], [paqRows[1], tratRows[7]],
        [paqRows[2], tratRows[0]], [paqRows[2], tratRows[2]],
        [paqRows[3], tratRows[9]], [paqRows[3], tratRows[10]], [paqRows[3], tratRows[5]],
      ];
      let contentCount = 0;
      for (const [idpaquete, idtratamiento] of contentData) {
        if (!idpaquete || !idtratamiento) continue;
        try {
          await pool.query(
            `INSERT INTO contenidopaquete (idpaquete, idtratamiento) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [idpaquete, idtratamiento]
          );
          contentCount++;
        } catch (e) { 
          console.log(`    ⚠ paquete ${idpaquete} trat ${idtratamiento}: ${e.message}`);
        }
      }
      console.log(`  ${contentCount} contenidos de paquete creados`);
    }

    // 14. Clientes
    const clientesData = [
      ['Elena Torres', makeDni(93,4,15,2345), '999888001', 'elena@email.com'],
      ['Roberto Sanchez', makeDni(89,11,20,6789), '999888002', 'roberto@email.com'],
      ['Carmen Flores', makeDni(97,8,3,3456), '999888003', 'carmen@email.com'],
      ['Miguel Angel Ruiz', makeDni(86,5,12,2345), '999888004', 'miguel@email.com'],
      ['Patricia Mendoza', makeDni(95,12,31,5678), '999888005', 'patricia@email.com'],
      ['Fernando Castro', makeDni(88,7,18,8901), '999888006', 'fernando@email.com'],
      ['Gabriela Vargas', makeDni(99,2,26,9012), '999888007', 'gabriela@email.com'],
      ['Alberto Morales', makeDni(91,6,9,4567), '999888008', 'alberto@email.com'],
    ];
    const clienteRows = [];
    for (const [nombre, ci, telefono, email] of clientesData) {
      try {
        const r = await pool.query(
          `INSERT INTO clientes (nombre, ci, telefono, email)
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (ci) DO NOTHING 
           RETURNING idcliente`,
          [nombre, ci, telefono, email]
        );
        if (r.rows.length) clienteRows.push(r.rows[0].idcliente);
      } catch (e) { 
        console.log(`    ⚠ ${nombre}: ${e.message}`); 
      }
    }
    console.log(`  ${clienteRows.length} clientes creados`);

    // 15. Citas
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = today.getDate();
    
    if (clienteRows.length && tratRows.length && empRows.length) {
      const citasData = [
        [clienteRows[0], tratRows[0], `${y}-${m}-${d}`, '10:00', 'Primera visita', empRows[0], 'realizada', null],
        [clienteRows[1], tratRows[2], `${y}-${m}-${d+1}`, '15:30', '', empRows[1], 'realizada', null],
        [clienteRows[2], tratRows[1], `${y}-${m}-${d+2}`, '09:00', 'Dolor de espalda', empRows[2], 'realizada', null],
        [clienteRows[3], tratRows[4], `${y}-${m}-${d+3}`, '14:00', '', empRows[3], 'pendiente', null],
        [clienteRows[4], tratRows[6], `${y}-${m}-${d+4}`, '11:00', '', empRows[4], 'pendiente', null],
        [clienteRows[0], tratRows[3], `${y}-${m}-${d+5}`, '16:00', 'Sesion de seguimiento', empRows[5], 'cancelada', null],
        [clienteRows[5], tratRows[5], `${y}-${m}-${d+6}`, '10:30', '', empRows[6], 'pendiente', null],
        [clienteRows[6], tratRows[10], `${y}-${m}-${d+7}`, '12:00', 'Alergica a lavanda', empRows[0], 'pendiente', null],
        [clienteRows[7], tratRows[9], `${y}-${m}-${d+8}`, '08:30', '', empRows[7], 'pendiente', null],
        [clienteRows[2], tratRows[7], `${y}-${m}-${d+9}`, '17:00', '', empRows[8], 'pendiente', null],
      ];

      const citaRows = [];
      for (const [idcliente, idtratamiento, fecha, hora, observaciones, idempleado, estado, idpaquetevendido] of citasData) {
        if (!idcliente || !idtratamiento || !idempleado) continue;
        try {
          const r = await pool.query(
            `INSERT INTO citas (idcliente, idtratamiento, fecha, hora, observaciones, idempleado, estado, idpaquetevendido)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idcita`,
            [idcliente, idtratamiento, fecha, hora, observaciones, idempleado, estado, idpaquetevendido]
          );
          citaRows.push(r.rows[0].idcita);
          
          // Para citas realizadas, agregar materiales
          if (estado === 'realizada' && r.rows[0].idcita && matRows.length) {
            const matCitaMap = {
              0: [[matRows[0], 1], [matRows[6], 1]],
              1: [[matRows[1], 2], [matRows[11], 1]],
              2: [[matRows[0], 2], [matRows[3], 1]]
            };
            const materials = matCitaMap[citaRows.length - 1] || [];
            for (const [idmaterial, cantidad] of materials) {
              if (idmaterial) {
                await pool.query(
                  `INSERT INTO materialesporcita (idcita, idmaterial, cantidadmaterialutilizado) 
                   VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                  [r.rows[0].idcita, idmaterial, cantidad]
                );
              }
            }
          }
        } catch (e) { 
          console.log(`    ⚠ Cita ${fecha} ${hora}: ${e.message}`); 
        }
      }
      console.log(`  ${citaRows.length} citas creadas`);
    } else {
      console.log(`  ⚠ No se pudieron crear citas: faltan datos`);
    }

    // 16. Usuarios
    const usuariosData = [
      ['admin', 'administrador', '$2b$10$YKqG9qZcYqZyqZcYqZyqZu', 'random_salt_1'],
      ['dependiente', 'dependiente', '$2b$10$YKqG9qZcYqZyqZcYqZyqZu', 'random_salt_2'],
    ];
    let userCount = 0;
    for (const [username, rol, contrasena, salt] of usuariosData) {
      try {
        await pool.query(
          `INSERT INTO usuarios (username, rol, contrasena, salt)
           VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`,
          [username, rol, contrasena, salt]
        );
        userCount++;
      } catch (e) { 
        console.log(`    ⚠ ${username}: ${e.message}`);
      }
    }
    console.log(`  ${userCount} usuarios creados`);

    console.log('\n✅ Seed completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await pool.end();
  }
}

seed();