const periodicUpdate = () => {
  setInterval(() => {
    // Borrar todas las tarjetas
    document.querySelectorAll(".server").forEach((e) => e.remove());

    // Consultar el estado actual del sistema y actualizar la interfaz con las tarjetas correspondientes
    fetch(`http://127.0.0.1:9000/servers`)
      .then((response) => response.json())
      .then((servers) => {
        servers.forEach((server) => addServerCard(server));
      })
      .catch((error) => {
        alert(error);
      });
  }, 2000);
};

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = (event) => {
  event.preventDefault();

  // Obtener IP introducida en el formulario
  const ipInput = document.getElementById("ipInput");
  const serverIP = ipInput.value;
  console.log(serverIP);

  // Contactar con el microservicio de administración de servidores para que se encargue de añadir el nuevo servidor al sistema
  fetch(`http://${serverIP}:9000/servers`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip: serverIP }),
  })
    .then((response) => response.json())
    .then((serverSpecs) => {
      alert("Servidor añadido correctamente");
      addServerCard(serverSpecs);
    })
    .catch((error) => {
      console.log(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

// Añade tarjeta correspondiente al servidor cuya información recibe como parámetro
addServerCard = (serverData) => {
  const containerId =
    serverData.status === "idle"
      ? "idle-server-container"
      : serverData.status === "busy"
      ? "busy-server-container"
      : "disabled-server-container";

  const color =
    serverData.status === "idle"
      ? "#90ee90"
      : serverData.status === "busy"
      ? "#ffd801"
      : "#f67280";

  const container = document.getElementById(containerId);

  const col = document.createElement("div");
  col.className = "col server";

  const card = document.createElement("div");
  card.className = "card";
  card.style = `width: 20rem; background-color: ${color}`;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = serverData.name;

  const cardTextOS = document.createElement("p");
  cardTextOS.className = "card-text";
  cardTextOS.innerHTML = "<strong>Sistema Operativo: </strong>" + serverData.os;

  const cardTextCPU = document.createElement("p");
  cardTextCPU.className = "card-text";
  cardTextCPU.innerHTML = "<strong>CPU: </strong>" + serverData.cpu;

  const cardTextGPU = document.createElement("p");
  cardTextGPU.className = "card-text";
  cardTextGPU.innerHTML = "<strong>GPU: </strong>" + serverData.gpu;

  const cardTextBlenderVersion = document.createElement("p");
  cardTextBlenderVersion.className = "card-text";
  cardTextBlenderVersion.innerHTML =
    "<strong>Versión de Blender: </strong>" + serverData.blenderVersion;

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardTextOS);
  cardBody.appendChild(cardTextCPU);
  cardBody.appendChild(cardTextGPU);
  cardBody.appendChild(cardTextBlenderVersion);

  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};
