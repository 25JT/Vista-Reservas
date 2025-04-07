import conexion from './public/Conexion.js';
import express from "express";

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', function (req, res) {
    res.render('index', { message: 'Datos insertados correctamente.' });
});



//Mostrar contenido de la tabla

app.get('/api/reservas', function (req, res) {
    let consulta = "SELECT * FROM datos";

    conexion.query(consulta, function (error, resultados) {
        if (error) {
            console.error("Error al obtener datos:", error);
            return res.status(500).json({ error: "Error al obtener las reservas." });
        }

        res.json(resultados); // Enviar datos como JSON
    });
});



//Eliminar usuario
app.delete('/api/reservas/:id', (req, res) => {
    const reservaId = req.params.id;
    const sql = "DELETE FROM datos WHERE Id = ?";

    conexion.query(sql, [reservaId], (err, result) => {
        if (err) {
            console.error("Error eliminando reserva:", err);
            res.status(500).json({ success: false, message: "Error eliminando reserva" });
        } else {
            if (result.affectedRows > 0) {
                res.json({ success: true, message: "Reserva eliminada exitosamente" });
            } else {
                res.status(404).json({ success: false, message: "Reserva no encontrada" });
            }
        }
    });
});

// Obtener una reserva específica
app.get('/api/reservas/:id', function (req, res) {
    const reservaId = req.params.id;
    let consulta = "SELECT * FROM datos WHERE Id = ?";

    conexion.query(consulta, [reservaId], function (error, resultado) {
        if (error) {
            console.error("Error obteniendo la reserva:", error);
            return res.status(500).json({ error: "Error al obtener la reserva." });
        }
        if (resultado.length === 0) {
            return res.status(404).json({ error: "Reserva no encontrada." });
        }
        res.json(resultado[0]); // Enviar la reserva encontrada
    });
});

// Actualizar una reserva
app.put('/api/reservas/:id', function (req, res) {
    const reservaId = req.params.id;
    const { nombre, personas, fecha, telefono, mesa } = req.body;


    // Validar número de mesa
    if (mesa < 1 || mesa > mesasD) {
        return res.json({ success: false, message: "Por favor, escoja una mesa entre 1 y 8." });
    }

    // Validar número de personas
    if (personas > 8) {
        return res.json({ success: false, message: "No disponemos de mesas para más de 8 personas." });
    }

    // Validar fecha
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let fechaReserva = new Date(fecha);

    if (fechaReserva < hoy) {
        return res.status(400).json({ success: false, message: "No puedes reservar en una fecha pasada ni para el día de hoy." });
    }

    // **Obtener la mesa actual de la reserva**
    let consultaMesaActual = "SELECT fecha, n_mesa FROM datos WHERE Id=?";

    conexion.query(consultaMesaActual, [reservaId], function (error, resultado) {
        if (error) {
            console.error("Error verificando reserva actual:", error);
            return res.status(500).json({ success: false, message: "Error al verificar la reserva actual." });
        }
    
        if (resultado.length === 0) {
            return res.status(404).json({ success: false, message: "Reserva no encontrada." });
        }
    
        let fechaActual = resultado[0].fecha;
        let mesaActual = resultado[0].n_mesa;
    
        // **Si la fecha y la mesa no cambian, actualizamos directamente**
        if (fecha === fechaActual && parseInt(mesa) === mesaActual) {
            return actualizarReserva();
        }
    
        // **Verificar si la mesa ya está reservada en la nueva fecha**
        let consultaMesaReservada = `SELECT COUNT(*) AS count FROM datos WHERE fecha = ? AND n_mesa = ? AND Id <> ?`;
    
        conexion.query(consultaMesaReservada, [fecha, mesa, reservaId], function (error, resultado) {
            if (error) {
                console.error("Error verificando disponibilidad de la mesa:", error);
                return res.status(500).json({ success: false, message: "Error al verificar disponibilidad de la mesa." });
            }
    
            let mesaOcupada = resultado[0].count > 0;
    
            if (mesaOcupada) {
                // **Obtener mesas disponibles**
                let consultaMesasDisponibles = `
                    SELECT n FROM (
                        SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
                        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
                    ) AS all_mesas
                    WHERE n NOT IN (SELECT n_mesa FROM datos WHERE fecha = ?)`;
    
                conexion.query(consultaMesasDisponibles, [fecha], function (error, resultadoMesas) {
                    if (error) {
                        console.error("Error obteniendo mesas disponibles:", error);
                        return res.status(500).json({ success: false, message: "Error al verificar mesas disponibles." });
                    }
    
                    let mesasDisponibles = resultadoMesas.map(row => row.n);
    
                    return res.status(400).json({
                        success: false,
                        message: `La mesa ${mesa} ya está reservada en la fecha ${fecha}. Mesas disponibles: ${mesasDisponibles.join(", ")}`,
                        mesasDisponibles: mesasDisponibles
                    });
                });
            } else {
                // **Si la mesa está disponible, proceder con la actualización**
                actualizarReserva();
            }
        });
    });
    
    function actualizarReserva() {
        let consultaActualizar = "UPDATE datos SET nombre=?, n_personas=?, fecha=?, telefono=?, n_mesa=? WHERE Id=?";
        let valores = [nombre, personas, fecha, telefono, mesa, reservaId];
    
        conexion.query(consultaActualizar, valores, function (error, resultado) {
            if (error) {
                console.error("Error actualizando la reserva:", error);
                return res.status(500).json({ success: false, message: "Error al actualizar la reserva." });
            }
            if (resultado.affectedRows > 0) {
                res.json({ success: true, message: "Reserva actualizada correctamente." });
            } else {
                res.status(404).json({ success: false, message: "Reserva no encontrada." });
            }
        });
    }
    

})    


// Iniciar el servidor

app.listen(3000,() => {
    console.log("servidor puerto http://localhost:3000");
})