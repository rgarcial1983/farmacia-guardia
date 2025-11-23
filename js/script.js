let farmaciasData = {};

async function cargarDatos() {
  const response = await fetch("farmaciasGuardia.json");
  farmaciasData = await response.json();

  const hoy = new Date();
  mostrarFarmacias(hoy);
  generarCalendario(hoy.getMonth(), hoy.getFullYear());
}

function mostrarFarmacias(fecha) {
  const dia = fecha.getDate();
  const mesNombre = fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();
  const año = fecha.getFullYear();
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaSemana = diasSemana[fecha.getDay()];

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  const farmacias = farmaciasData.farmacias.filter(f =>
    f.diasGuardia.some(d => 
      d.mes.toLowerCase() === mesNombre && d.dias.includes(dia)
    )
  );

  if (farmacias.length === 0) {
    resultadoDiv.innerHTML = `
      <div class="alert">
        <i class="fas fa-exclamation-triangle"></i> No hay farmacias de guardia el ${diaSemana} ${dia} de ${mesNombre} ${año}.
      </div>`;
    return;
  }

  farmacias.forEach(f => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h5><i class="fas fa-pills"></i> ${f.nombre}</h5>
      <p><i class="fas fa-map-marker-alt"></i> <strong>Dirección:</strong> ${f.direccion}</p>
      <p>
        <a href="${f.localizacion}" target="_blank">
          <i class="fa-solid fa-map-location-dot"></i> Ver ubicación en Google Maps
        </a>
      </p>
      <p><i class="fas fa-phone"></i> <strong>Teléfono:</strong> <a href="tel:${f.telefono}">${f.telefono}</a></p>
      <div class="date-badge">
        <i class="fas fa-check-circle"></i> ${diaSemana} ${dia} de ${mesNombre} ${año}
      </div>
    `;
    resultadoDiv.appendChild(card);
  });
}

function generarCalendario(mes, año) {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const table = document.createElement("table");
  table.className = "calendar-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  diasSemana.forEach(dia => {
    const th = document.createElement("th");
    th.textContent = dia;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const primerDia = new Date(año, mes, 1);
  let diaSemana = primerDia.getDay();
  diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;

  const diasMes = new Date(año, mes + 1, 0).getDate();
  const mesNombre = primerDia.toLocaleString("es-ES", { month: "long" }).toLowerCase();

  const tbody = document.createElement("tbody");
  let tr = document.createElement("tr");

  for (let i = 0; i < diaSemana; i++) {
    tr.appendChild(document.createElement("td"));
  }

  for (let dia = 1; dia <= diasMes; dia++) {
    if ((diaSemana + dia - 1) % 7 === 0 && dia !== 1) {
      tbody.appendChild(tr);
      tr = document.createElement("tr");
    }

    const td = document.createElement("td");
    const dayCell = document.createElement("div");
    dayCell.className = "day-cell";

    let farmaciaGuardia = null;
    if (farmaciasData.farmacias) {
      for (const f of farmaciasData.farmacias) {
        if (f.diasGuardia.some(dg => dg.mes.toLowerCase() === mesNombre && dg.dias.includes(dia))) {
          farmaciaGuardia = f;
          break;
        }
      }
    }

    dayCell.innerHTML = `
      <div class="day-number">${dia}</div>
      ${farmaciaGuardia ? 
        `<div class="pharmacy-name">${farmaciaGuardia.nombre}</div>
          <div class="pharmacy-address">${farmaciaGuardia.direccion}</div>` : 
        `<div class="no-data">Sin guardia</div>`}
    `;
    td.appendChild(dayCell);
    tr.appendChild(td);
  }

  while (tr.children.length < 7) {
    tr.appendChild(document.createElement("td"));
  }
  tbody.appendChild(tr);
  table.appendChild(tbody);
  calendario.appendChild(table);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  document.getElementById("calendarioTitulo").innerHTML = 
    `<i class="fas fa-calendar-alt"></i> ${meses[mes]} ${año}`;
}

function marcarBotonSeleccionado(botonId) {
  document.getElementById("hoyBtn").classList.remove("active");
  document.getElementById("mananaBtn").classList.remove("active");
  document.getElementById("pasadoBtn").classList.remove("active");
  if (botonId) {
    document.getElementById(botonId).classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", cargarDatos);

document.getElementById("buscarBtn").addEventListener("click", () => {
  const fechaInput = document.getElementById("fechaInput").value;
  marcarBotonSeleccionado();
  if (fechaInput) {
    const fecha = new Date(fechaInput + 'T00:00:00');
    mostrarFarmacias(fecha);
    generarCalendario(fecha.getMonth(), fecha.getFullYear());
  } else {
    const hoy = new Date();
    mostrarFarmacias(hoy);
    generarCalendario(hoy.getMonth(), hoy.getFullYear());
  }
});

document.getElementById("mananaBtn").addEventListener("click", () => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  document.getElementById("fechaInput").value = hoy.toISOString().split("T")[0];
  mostrarFarmacias(hoy);
  generarCalendario(hoy.getMonth(), hoy.getFullYear());
  marcarBotonSeleccionado("mananaBtn");
});

document.getElementById("pasadoBtn").addEventListener("click", () => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 2);
  document.getElementById("fechaInput").value = hoy.toISOString().split("T")[0];
  mostrarFarmacias(hoy);
  generarCalendario(hoy.getMonth(), hoy.getFullYear());
  marcarBotonSeleccionado("pasadoBtn");
});

document.getElementById("hoyBtn").addEventListener("click", () => {
  const hoy = new Date();
  document.getElementById("fechaInput").value = hoy.toISOString().split("T")[0];
  mostrarFarmacias(hoy);
  generarCalendario(hoy.getMonth(), hoy.getFullYear());
  marcarBotonSeleccionado("hoyBtn");
});

document.getElementById("fechaInput").addEventListener("input", () => {
  marcarBotonSeleccionado();
});

// Actualizar año dinámicamente
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Configuración de PayPal
const PAYPAL_DONATE_URL = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rafa.garcia.leon@gmail.com&currency_code=EUR`;

// Aplicar URL al botón de donación
if (document.getElementById('donationBtn')) {
  document.getElementById('donationBtn').href = PAYPAL_DONATE_URL;
}

/* ===========================================================
   LÓGICA PWA (PROGRESSIVE WEB APP) - INSTALACIÓN
   =========================================================== */

// 1. Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Asegúrate de que el archivo service-worker.js esté en la raíz de tu proyecto
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registrado correctamente:', reg))
      .catch(err => console.log('Error al registrar el Service Worker:', err));
  });
}

// 2. Lógica del Botón de Instalación
let deferredPrompt; // Variable para guardar el evento de instalación
const installBtn = document.getElementById('btn-instalar');

window.addEventListener('beforeinstallprompt', (e) => {
  // A. Prevenir que Chrome muestre el mini-banner automático antiguo
  e.preventDefault();
  
  // B. Guardar el evento para dispararlo cuando el usuario pulse el botón
  deferredPrompt = e;
  
  // C. Mostrar nuestro botón personalizado
  if (installBtn) {
    installBtn.style.display = 'block'; // Hacemos visible el botón
    
    // D. Añadir el evento de click
    installBtn.addEventListener('click', () => {
      // Ocultamos el botón porque ya le han dado click
      installBtn.style.display = 'none';
      
      // Mostramos el diálogo de instalación nativo del móvil
      deferredPrompt.prompt();
      
      // Esperamos a ver qué decide el usuario
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('El usuario aceptó instalar la app');
        } else {
          console.log('El usuario rechazó la instalación');
          // Opcional: volver a mostrar el botón si quieres insistir
        }
        deferredPrompt = null;
      });
    });
  }
});

// 3. Detectar si ya se instaló (para ocultar el botón definitivamente)
window.addEventListener('appinstalled', () => {
  console.log('La aplicación ha sido instalada con éxito');
  if (installBtn) installBtn.style.display = 'none';
});