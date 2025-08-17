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
    resultadoDiv.innerHTML = `<div class="alert alert-warning"><i class="bi bi-calendar-x"></i> No hay farmacias de guardia el ${dia} de ${mesNombre}.</div>`;
    return;
  }

  farmacias.forEach(f => {
    const card = document.createElement("div");
    card.className = "card card-result shadow-sm p-3";
    card.innerHTML = `
      <h5 class="card-title"><i class="bi bi-capsule"></i> ${f.nombre}</h5>
      <p class="mb-1"><i class="bi bi-geo-alt"></i> <strong>Dirección:</strong> ${f.direccion}</p>
      <p class="mb-1"><i class="bi bi-telephone"></i> <strong>Teléfono:</strong> <a href="tel:${f.telefono}">${f.telefono}</a></p>
      <p class="text-muted"><i class="bi bi-calendar"></i> Guardia el ${dia} de ${mesNombre}</p>
    `;
    resultadoDiv.appendChild(card);
  });
}

// Generar calendario del mes
function generarCalendario(mes, año) {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const table = document.createElement("table");
  table.className = "table table-bordered text-center";

  // Cabecera
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  diasSemana.forEach(dia => {
    const th = document.createElement("th");
    th.textContent = dia;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // Días del mes
  const primerDia = new Date(año, mes, 1);
  let diaSemana = primerDia.getDay();
  diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;

  const diasMes = new Date(año, mes + 1, 0).getDate();
  const mesNombre = primerDia.toLocaleString("es-ES", { month: "long" }).toLowerCase();

  const tbody = document.createElement("tbody");
  let tr = document.createElement("tr");

  // Espacios vacíos antes del primer día
  for (let i = 0; i < diaSemana; i++) {
    tr.appendChild(document.createElement("td"));
  }

  for (let dia = 1; dia <= diasMes; dia++) {
    if ((diaSemana + dia - 1) % 7 === 0 && dia !== 1) {
      tbody.appendChild(tr);
      tr = document.createElement("tr");
    }

    const td = document.createElement("td");
    td.className = "p-0";
    const card = document.createElement("div");
    card.className = "day card border-0 m-1";
    card.style.minHeight = "90px";

    // Buscar farmacia de guardia para este día
    let farmaciaGuardia = null;
    if (farmaciasData.farmacias) {
      for (const f of farmaciasData.farmacias) {
        if (f.diasGuardia.some(dg => dg.mes.toLowerCase() === mesNombre && dg.dias.includes(dia))) {
          farmaciaGuardia = f;
          break;
        }
      }
    }

    card.innerHTML = `
      <div class="card-body p-2">
        <div class="fw-bold">${dia}</div>
        ${farmaciaGuardia ? `<div class="small text-success">${farmaciaGuardia.nombre}</div>
        <div class="small text-muted">${farmaciaGuardia.direccion}</div>` : `<div class="small text-muted">Sin datos</div>`}
      </div>
    `;
    td.appendChild(card);
    tr.appendChild(td);
  }

  // Espacios vacíos al final
  while (tr.children.length < 7) {
    tr.appendChild(document.createElement("td"));
  }
  tbody.appendChild(tr);
  table.appendChild(tbody);
  calendario.appendChild(table);
}

// Ejemplo de uso (debes adaptar farmaciasGuardia a tu JSON real)
document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date();
  const mes = hoy.getMonth();
  const año = hoy.getFullYear();

  // Simulación de datos: { "2025-08-01": {nombre: "...", direccion: "..."}, ... }
  const farmaciasGuardia = {}; // Carga aquí tu JSON real

  generarCalendario(mes, año, farmaciasGuardia);
});

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