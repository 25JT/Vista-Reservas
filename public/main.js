document.getElementById("title").innerHTML = "Reserva GO! - Lista de clientes "

document.addEventListener("DOMContentLoaded", () => {
  cargarReservas();

  document.getElementById("formReserva").addEventListener("submit", manejarEnvioFormulario);

   

});

async function manejarEnvioFormulario(event) {
  event.preventDefault();

  const idReserva = document.getElementById("idReserva").value;

  const formData = {
    nombre: document.getElementById("nombre").value,
    personas: document.getElementById("personas").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    telefono: document.getElementById("telefono").value,
    mesa: document.getElementById("mesa").value,
  };

  if (!validarFormulario(formData)) return;

  const url = idReserva ? `/api/reservas/${idReserva}` : "/validar";
  const method = idReserva ? "PUT" : "POST";
  const btnEnviar = document.getElementById("enviar");

  btnEnviar.disabled = true;
  btnEnviar.value = idReserva ? "Actualizando..." : "Enviando...";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    Swal.fire({
      title: data.success ? "¡Éxito!" : "Error",
      text: data.message  ,
      icon: data.success ? "success" : "error",
      confirmButtonText: "Aceptar"
    }).then(() => {
      if (data.success) {
        resetearFormulario();
        cargarReservas();
      }
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.value = idReserva ? "Actualizar" : "Enviar";
  }
}

function validarFormulario(data) {
  if (!data.nombre || !data.fecha || !data.hora || !data.telefono || !data.mesa || !data.personas) {
    Swal.fire("Campos incompletos", "Por favor completa todos los campos", "warning");
    return false;
  }

  if (!/^\d{10}$/.test(data.telefono)) {
    Swal.fire("Teléfono inválido", "Debe contener 10 dígitos numéricos", "error");
    return false;
  }

  if (data.personas <= 0) {
    Swal.fire("Número de personas inválido", "Debe ser al menos 1", "error");
    return false;
  }

  return true;
}

async function cargarReservas() {
  try {
    const response = await fetch('/api/reservas');
    const reservas = await response.json();
    renderizarReservas(reservas);
  } catch (error) {
    console.error("Error cargando reservas:", error);
  }
}

function renderizarReservas(reservas) {
  const lista = document.getElementById("listaReservas");
  lista.innerHTML = `

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
              <th>Hora</th>
              <th>Teléfono</th>
              <th>N° Mesa</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            ${reservas.map(reserva => `
              <tr>
                <td>${reserva.Id}</td>
                <td>${reserva.nombre}</td>
                <td>${reserva.n_personas}</td>
                <td>${formatearFecha(reserva.fecha)}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.telefono}</td>
                <td>${reserva.n_mesa}</td>
                <td><button class="btn btn-primary btn-sm" onclick="editar(${reserva.Id})">Editar</button></td>
                <td><button class="btn btn-danger btn-sm" onclick="eliminar(${reserva.Id})">Eliminar</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}


async function editar(id) {
  try {
    const response = await fetch(`/api/reservas/${id}`);
    const reserva = await response.json();

    document.getElementById("idReserva").value = id;
    document.getElementById("nombre").value = reserva.nombre;
    document.getElementById("personas").value = reserva.n_personas;
    document.getElementById("fecha").value = formatearFecha(reserva.fecha);
    document.getElementById("hora").value = formatearHora(reserva.hora);
    document.getElementById("telefono").value = reserva.telefono;
    document.getElementById("mesa").value = reserva.n_mesa;

    document.getElementById("enviar").value = "Actualizar";
    document.getElementById("nombre").focus();
    document.getElementById("formReserva").scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("Error obteniendo reserva:", error);
  }
}

function eliminar(id) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });

  swalWithBootstrapButtons.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/reservas/${id}`, { method: "DELETE" });
        const data = await response.json();

        swalWithBootstrapButtons.fire("¡Eliminado!", data.message, "success");

        if (data.success) cargarReservas();

      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar la reserva", "error");
      }

    } else if (result.dismiss === Swal.DismissReason.cancel) {
      swalWithBootstrapButtons.fire("Cancelado", "Tu reserva está segura", "error");
    }
  });
}

function resetearFormulario() {
  document.getElementById("formReserva").reset();
  document.getElementById("idReserva").value = "";
  document.getElementById("enviar").value = "Enviar";
  document.getElementById("enviar").style.display = "inline-block";
  document.getElementById("actualizar").style.display = "none";
}

function formatearFecha(fechaISO) {
  return fechaISO.split("T")[0];
}

function formatearHora(hora) {
  return hora.slice(0, 5);
}



//limpiar datos
function limpiarFormularioConsulta() {
  console.log("Limpiando formulario...");
  const input = document.getElementById("nregistro");
  const resultado = document.getElementById("resultadoConsulta");

  if (input) input.value = "";
  if (resultado) resultado.innerText = "";
}
