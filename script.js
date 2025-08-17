let farmaciasData = {};

async function cargarDatos() {
  const response = await fetch("farmaciasGuardia.json");
  farmaciasData = await response.json();

  // Rellenar select de farmacias
  const select = document.getElementById("farmaciaSelect");
  farmaciasData.farmacias.forEach(f => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.nombre;
    select.appendChild(option);
  });

  // Mostrar resultados
  const hoy = new Date();
  mostrarFarmacias(hoy);
  generarCalendario(hoy.getMonth(), hoy.getFullYear());
}

function mostrarFarmacias(fecha, filtroFarmaciaId = "") {
  const dia = fecha.getDate();
  const mesNombre = fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  const farmacias = farmaciasData.farmacias.filter(f => {
    if (filtroFarmaciaId && f.id != filtroFarmaciaId) return false;

    return f.diasGuardia.some(d => 
      d.mes.toLowerCase() === mesNombre && d.dias.includes(dia)
    );
  });

  if (farmacias.length === 0) {
    resultadoDiv.innerHTML = `<div class="alert alert-warning">No hay farmacias de guardia el ${dia} de ${mesNombre}.</div>`;
    return;
  }

  farmacias.forEach(f => {
    const card = document.createElement("div");
    card.className = "card card-result shadow-sm p-3";
    card.innerHTML = `
      <h5 class="card-title">${f.nombre}</h5>
      <p class="mb-1"><strong>Dirección:</strong> ${f.direccion}</p>
      <p class="mb-1"><strong>Teléfono:</strong> <a href="tel:${f.telefono}">${f.telefono}</a></p>
      <p class="text-muted">Guardia el ${dia} de ${mesNombre}</p>
    `;
    resultadoDiv.appendChild(card);
  });
}

// Generar calendario del mes
function generarCalendario(mes, anio) {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";

  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const offset = primerDia === 0 ? 6 : primerDia - 1;

  for (let i = 0; i < offset; i++) {
    calendario.innerHTML += `<div></div>`;
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(anio, mes, dia);
    const mesNombre = fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();

    const guardias = farmaciasData.farmacias.filter(f =>
      f.diasGuardia.some(d => d.mes === mesNombre && d.dias.includes(dia))
    );

    let guardiasHtml = "";
    guardias.forEach(f => {
      guardiasHtml += `<span>${f.nombre}</span>`;
    });

    calendario.innerHTML += `
      <div class="day">
        <div class="day-number">${dia}</div>
        <div class="guardias">${guardiasHtml}</div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", cargarDatos);
document.getElementById("buscarBtn").addEventListener("click", () => {
  const fechaInput = document.getElementById("fechaInput").value;
  const farmaciaId = document.getElementById("farmaciaSelect").value;

  if (fechaInput) {
    const fecha = new Date(fechaInput);
    mostrarFarmacias(fecha, farmaciaId);
    generarCalendario(fecha.getMonth(), fecha.getFullYear());
  } else {
    const hoy = new Date();
    mostrarFarmacias(hoy, farmaciaId);
    generarCalendario(hoy.getMonth(), hoy.getFullYear());
  }
});