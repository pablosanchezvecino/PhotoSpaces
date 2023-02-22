// Declaraciones de elementos del DOM
const idleServerContainer = document.getElementById("idle-server-container");
const busyServerContainer = document.getElementById("busy-server-container");
const disabledServerContainer = document.getElementById(
  "disabled-server-container"
);

const totalServerCountElement = document.getElementById("total-server-count");
const idleServerCountElement = document.getElementById("idle-server-count");
const busyServerCountElement = document.getElementById("busy-server-count");
const disabledServerCountElement = document.getElementById(
  "disabled-server-count"
);

const ipInput = document.getElementById("ipInput");
const nameInput = document.getElementById("nameInput");

const periodicUpdate = () => {
  setInterval(() => {
    // Borrar todas las tarjetas y textos informativos que se muestran si algún contenedor está vacío
    document.querySelectorAll(".server").forEach((e) => e.remove());
    document.querySelectorAll(".empty-info").forEach((e) => e.remove());

    // Consultar el estado actual del sistema y actualizar la interfaz con las tarjetas correspondientes
    fetch(`http://127.0.0.1:9000/servers`)
      .then((response) => response.json())
      .then((servers) => {
        servers.forEach((server) => addServerCard(server));

        // Obtener número total de servidores y cuántos hay de cada tipo
        const totalServerCount = servers.length;
        const idleServerCount = idleServerContainer.childElementCount;
        const busyServerCount = busyServerContainer.childElementCount;
        const disabledServerCount =
          disabledServerContainer.childElementCount;

        // Mostrar información en la interfaz de usuario
        totalServerCountElement.innerText =
          totalServerCountElement.innerText.replace(/\d+$/, totalServerCount);
        idleServerCountElement.innerText =
          idleServerCountElement.innerText.replace(/\d+$/, idleServerCount);
        busyServerCountElement.innerText =
          busyServerCountElement.innerText.replace(/\d+$/, busyServerCount);
        disabledServerCountElement.innerText =
          disabledServerCountElement.innerText.replace(
            /\d+$/,
            disabledServerCount
          );

        // Mostrar texto informativo si no hay ningún servidor en algún estado
        if (idleServerCount === 0) {
          const emptyIdleServerContainerInfo = document.createElement("h4");
          emptyIdleServerContainerInfo.className = "text-secondary empty-info";
          emptyIdleServerContainerInfo.innerText =
            "No se encontraron servidores disponibles";
          idleServerContainer.appendChild(emptyIdleServerContainerInfo);
        }
        if (busyServerCount === 0) {
          const emptyBusyServerContainerInfo = document.createElement("h4");
          emptyBusyServerContainerInfo.className = "text-secondary empty-info";
          emptyBusyServerContainerInfo.innerText =
            "No se encontraron servidores ocupados";
          busyServerContainer.appendChild(emptyBusyServerContainerInfo);
        }
        if (disabledServerCount === 0) {
          const emptyDisabledServerContainerInfo = document.createElement("h4");
          emptyDisabledServerContainerInfo.className =
            "text-secondary empty-info";
          emptyDisabledServerContainerInfo.innerText =
            "No se encontraron servidores deshabilitados";
          disabledServerContainer.appendChild(emptyDisabledServerContainerInfo);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }, 2000);
};

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = (event) => {
  event.preventDefault();

  // Obtener dirección IP y nombre introducidos en el formulario
  const serverIP = ipInput.value;
  const serverName = nameInput.value;

  // Contactar con el microservicio de administración de servidores para que se encargue de añadir el nuevo servidor al sistema
  fetch(`http://${serverIP}:9000/servers`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip: serverIP, name: serverName }),
  })
    .then((response) => response.json())
    .then((jsonContent) => {
      if (jsonContent.error !== undefined) {
        alert(jsonContent.error);
      } else {
        alert("Servidor añadido correctamente");
        // addServerCard(jsonContent);
      }
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
      ? "#faf884"
      : "#f67280";

  const container = document.getElementById(containerId);

  const col = document.createElement("div");
  col.className = "col server";
  col.id = serverData._id;

  const card = document.createElement("div");
  card.className = "card mb-2";
  card.style = `width: 20rem; background-color: ${color}`;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = serverData.name;

  // TODO: Posible vulnerabilidad con innerHTML
  const cardTextIP = document.createElement("p");
  cardTextIP.className = "card-text";
  cardTextIP.innerHTML = "<strong>Dirección IP: </strong>" + serverData.ip;

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

  const cardTextRegistrationDate = document.createElement("p");
  cardTextRegistrationDate.className = "card-text";
  cardTextRegistrationDate.innerHTML =
    "<strong>Fecha de registro: </strong>" +
    new Date(serverData.registrationDate).toLocaleString();

  const button = document.createElement("button");
  button.className =
    serverData.status === "disabled" ? "btn btn-success" : "btn btn-danger";

  button.innerText =
    serverData.status === "idle"
      ? "Deshabilitar"
      : serverData.status === "busy"
      ? "Abortar procesamiento"
      : "Habilitar";

  button.onclick =
    serverData.status === "idle"
      ? () => deshabilitar(serverData._id)
      : serverData.status === "busy"
      ? () => abortar(serverData._id)
      : () => habilitar(serverData._id);

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardTextIP);
  cardBody.appendChild(cardTextOS);
  cardBody.appendChild(cardTextCPU);
  cardBody.appendChild(cardTextGPU);
  cardBody.appendChild(cardTextBlenderVersion);
  cardBody.appendChild(cardTextRegistrationDate);
  cardBody.appendChild(button);

  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
  console.log(serverData);
};

const habilitar = (serverId) => {
  fetch(`http://127.0.0.1:9000/servers/${serverId}/enable`, {
    method: "POST",
  })
    .then(async (response) => {
      if (response.status === 200) {
        alert((await response.json()).message);
      } else {
        alert((await response.json()).error);
      }
    })
    .catch((error) => {
      console.log(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

const deshabilitar = (serverId) => {
  fetch(`http://127.0.0.1:9000/servers/${serverId}/disable`, {
    method: "POST",
  })
    .then(async (response) => {
      if (response.status === 200) {
        alert((await response.json()).message);
      } else {
        alert((await response.json()).error);
      }
    })
    .catch((error) => {
      console.log(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

const abortar = (serverId) => alert("Abortar " + serverId);
