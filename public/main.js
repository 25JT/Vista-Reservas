document.addEventListener("DOMContentLoaded", cargarReservas);
document.getElementById("title").innerHTML = "Reservas Go! Vista"



function cargarReservas() {
    fetch('/api/reservas')
        .then(response => response.json())
        .then(reservas => {
            let lista = document.getElementById("listaReservas");
            lista.innerHTML = "";  // 🔹 Limpiar contenido antes de agregar nuevos datos

            let contenido = `
           
            <br>
            <div class="container">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped text-center">
                        <thead class="table-danger">
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>N° Personas</th>
                                <th>Fecha</th>
                                <th>Teléfono</th>
                                <th>N° Mesa</th>
                                <th>Editar</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>`;

            reservas.forEach(reserva => {
                contenido += `
                    <tr>
                        <td>${reserva.Id}</td>
                        <td>${reserva.nombre}</td>
                        <td>${reserva.n_personas}</td>
                        <td>${new Date(reserva.fecha).toLocaleDateString()}</td>
                        <td>${reserva.telefono}</td>
                        <td>${reserva.n_mesa}</td>
                        <td><button class="btn btn-primary btn-sm" onclick="editar(${reserva.Id})">Editar</button></td>
                        <td><button class="btn btn-danger btn-sm" onclick="eliminar(${reserva.Id})">Eliminar</button></td>
                    </tr>`;
            });

            contenido += `</tbody></table></div></div>`;
            lista.innerHTML = contenido;
        })
        .catch(error => console.error("Error cargando reservas:", error));
}

cargarReservas();