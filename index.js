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



app.listen(3000,() => {
    console.log("servidor puerto http://localhost:3000");
})