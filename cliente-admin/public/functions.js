const msToTime = (duration) => {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
};

// Declaraciones de elementos del DOM

// COntenedores de las tarjetas de servidores
const idleServerContainer = document.getElementById("idle-server-container");
const busyServerContainer = document.getElementById("busy-server-container");
const disabledServerContainer = document.getElementById(
  "disabled-server-container"
);

// COntenedores de las tarjetas de peticiones
const processingRequestContainer = document.getElementById(
  "processing-request-container"
);
const enqueuedRequestContainer = document.getElementById(
  "enqueued-request-container"
);
const fulfilledRequestContainer = document.getElementById(
  "fulfilled-request-container"
);

// Estadísticas
const totalServerCountElement = document.getElementById("total-server-count");
const idleServerCountElement = document.getElementById("idle-server-count");
const busyServerCountElement = document.getElementById("busy-server-count");
const disabledServerCountElement = document.getElementById(
  "disabled-server-count"
);

const totalRequestCountElement = document.getElementById("total-request-count");
const processingRequestCountElement = document.getElementById(
  "processing-request-count"
);
const enqueuedRequestCountElement = document.getElementById(
  "enqueued-request-count"
);
const fulfilledRequestCountElement = document.getElementById(
  "fulfilled-request-count"
);

// Inputs formulario
const ipInput = document.getElementById("ipInput");
const nameInput = document.getElementById("nameInput");

const periodicUpdate = () => {
  setInterval(() => {
    // Borrar todas las tarjetas y textos informativos que se muestran si algún contenedor está vacío
    document.querySelectorAll(".server").forEach((e) => e.remove());
    document.querySelectorAll(".request").forEach((e) => e.remove());
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
        const disabledServerCount = disabledServerContainer.childElementCount;

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
      .catch(() => {
        alert("Error al consultar el estado del sistema");
      });

    fetch(`http://127.0.0.1:9000/requests`)
      .then((response) => response.json())
      .then((requests) => {
        requests.forEach((request) => addRequestCard(request));

        // Obtener número total de peticiones y cuántas hay de cada tipo
        const totalRequestCount = requests.length;
        const processingRequestCount =
          processingRequestContainer.childElementCount;
        const enqueuedRequestCount = enqueuedRequestContainer.childElementCount;
        const fulfilledRequestCount =
          fulfilledRequestContainer.childElementCount;

        // Mostrar información en la interfaz de usuario
        totalRequestCountElement.innerText =
          totalRequestCountElement.innerText.replace(/\d+$/, totalRequestCount);

        processingRequestCountElement.innerText =
          processingRequestCountElement.innerText.replace(
            /\d+$/,
            processingRequestCount
          );

        enqueuedRequestCountElement.innerText =
          enqueuedRequestCountElement.innerText.replace(
            /\d+$/,
            enqueuedRequestCount
          );

        fulfilledRequestCountElement.innerText =
          fulfilledRequestCountElement.innerText.replace(
            /\d+$/,
            fulfilledRequestCount
          );

        // Mostrar texto informativo si no hay ninguna petición en algún estado
        if (processingRequestCount === 0) {
          const emptyProcessingRequestContainerInfo =
            document.createElement("h4");
          emptyProcessingRequestContainerInfo.className =
            "text-secondary empty-info";
          emptyProcessingRequestContainerInfo.innerText =
            "No se encontraron peticiones en proceso";
          processingRequestContainer.appendChild(
            emptyProcessingRequestContainerInfo
          );
        }
        if (enqueuedRequestCount === 0) {
          const emptyEnqueuedRequestContainerInfo =
            document.createElement("h4");
          emptyEnqueuedRequestContainerInfo.className =
            "text-secondary empty-info";
          emptyEnqueuedRequestContainerInfo.innerText =
            "No se encontraron peticiones encoladas";
          enqueuedRequestContainer.appendChild(
            emptyEnqueuedRequestContainerInfo
          );
        }
        if (fulfilledRequestCount === 0) {
          const emptyFulfilledRequestContainerInfo =
            document.createElement("h4");
          emptyFulfilledRequestContainerInfo.className =
            "text-secondary empty-info";
          emptyFulfilledRequestContainerInfo.innerText =
            "No se encontraron peticiones finalizadas";
          fulfilledRequestContainer.appendChild(
            emptyFulfilledRequestContainerInfo
          );
        }
      })
      .catch((error) => {
        alert("Error al consultar el estado del sistema");
      });
  }, 5000);
};

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = (event) => {
  event.preventDefault();

  // Obtener dirección IP y nombre introducidos en el formulario
  const serverIP = ipInput.value;
  const serverName = nameInput.value;

  // Contactar con el microservicio de administración de servidores para que se encargue de añadir el nuevo servidor al sistema
  fetch(`http://127.0.0.1:9000/servers`, {
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
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

// Añade tarjeta correspondiente al servidor cuya información recibe como parámetro
const addServerCard = (serverData) => {
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
  card.style = `height: 355px; width: 20rem; background-color: ${color}`;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = serverData.name;

  const cardTextIP = document.createElement("p");
  cardTextIP.className = "card-text";
  const ipImage = document.createElement("img");
  ipImage.src = "./res/svg/ip.svg";
  ipImage.width = "24";
  ipImage.title = "Dirección IP";
  cardTextIP.appendChild(ipImage);
  ipImage.after(document.createTextNode(" " + serverData.ip));

  const cardTextOS = document.createElement("p");
  cardTextOS.className = "card-text";
  const osImage = document.createElement("img");
  osImage.src = "./res/svg/os.svg";
  osImage.width = "24";
  osImage.title = "Sistema Operativo";
  cardTextOS.appendChild(osImage);
  osImage.after(document.createTextNode(" " + serverData.os));

  const cardTextCPU = document.createElement("p");
  cardTextCPU.className = "card-text";
  const cpuImage = document.createElement("img");
  cpuImage.src = "./res/svg/cpu.svg";
  cpuImage.width = "24";
  cpuImage.title = "Procesador";
  cardTextCPU.appendChild(cpuImage);
  cpuImage.after(document.createTextNode(" " + serverData.cpu));

  const cardTextGPU = document.createElement("p");
  cardTextGPU.className = "card-text";
  const gpuImage = document.createElement("img");
  gpuImage.src = "./res/svg/gpu.svg";
  gpuImage.width = "24";
  gpuImage.title = "Tarjeta Gráfica";
  cardTextGPU.appendChild(gpuImage);
  gpuImage.after(document.createTextNode(" " + serverData.gpu));

  const cardTextBlenderVersion = document.createElement("p");
  cardTextBlenderVersion.className = "card-text";
  const blenderVersionImage = document.createElement("img");
  blenderVersionImage.src = "./res/svg/blender.svg";
  blenderVersionImage.width = "24";
  blenderVersionImage.title = "Versión de Blender";
  cardTextBlenderVersion.appendChild(blenderVersionImage);
  blenderVersionImage.after(
    document.createTextNode(" " + serverData.blenderVersion)
  );

  const cardTextRegistrationDate = document.createElement("p");
  cardTextRegistrationDate.className = "card-text";
  const registrationDateImage = document.createElement("img");
  registrationDateImage.src = "./res/svg/date.svg";
  registrationDateImage.width = "24";
  registrationDateImage.title = "Fecha y hora de registro en el sistema";
  cardTextRegistrationDate.appendChild(registrationDateImage);
  registrationDateImage.after(
    document.createTextNode(
      " " + new Date(serverData.registrationDate).toLocaleString()
    )
  );

  const button1 = document.createElement("button");
  button1.className =
    serverData.status === "disabled" ? "btn btn-success" : "btn btn-danger";

  button1.innerText =
    serverData.status === "idle"
      ? "Deshabilitar"
      : serverData.status === "busy"
      ? "Abortar procesamiento"
      : "Habilitar";

  button1.onclick =
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
  cardBody.appendChild(button1);

  if (serverData.status !== "busy") {
    const button2 = document.createElement("button");
    button2.className = "btn btn-danger ms-4";
    button2.innerText = "Eliminar";
    button2.onclick = () => eliminar(serverData._id);
    cardBody.appendChild(button2);
  }
  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};

// Añade tarjeta correspondiente a la petición cuya información recibe como parámetro
addRequestCard = (requestData) => {
  const containerId =
    requestData.status === "processing"
      ? "processing-request-container"
      : requestData.status === "enqueued"
      ? "enqueued-request-container"
      : "fulfilled-request-container";

  const color =
    requestData.status === "processing"
      ? "#71f9d5"
      : requestData.status === "enqueued"
      ? "#c580f9"
      : "#ffa825";

  const container = document.getElementById(containerId);

  const col = document.createElement("div");
  col.className = "col request";
  col.id = requestData._id;

  const card = document.createElement("div");
  card.className = "card mb-2";
  card.style = `height: 355px; width: 20rem; background-color: ${color}`;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = requestData._id;
  cardBody.appendChild(cardTitle);

  if (requestData.status === "enqueued") {
    const cardTextPosition = document.createElement("p");
    cardTextPosition.className = "card-text";
    const positionImage = document.createElement("img");
    positionImage.src = "./res/svg/position.svg";
    positionImage.width = "24";
    positionImage.title = "Posición en la cola";
    cardTextPosition.appendChild(positionImage);
    positionImage.after(
      document.createTextNode(" " + requestData.queuePosition)
    );
    cardBody.appendChild(cardTextPosition);
  }

  const cardTextClientIP = document.createElement("p");
  cardTextClientIP.className = "card-text";
  const clientIPImage = document.createElement("img");
  clientIPImage.src = "./res/svg/user-ip.svg";
  clientIPImage.width = "24";
  clientIPImage.title = "Dirección IP del cliente";
  cardTextClientIP.appendChild(clientIPImage);
  clientIPImage.after(document.createTextNode(" " + requestData.clientIp));
  cardBody.appendChild(cardTextClientIP);

  if (requestData.status !== "enqueued") {
    const cardTextServer = document.createElement("p");
    cardTextServer.className = "card-text";
    const serverImage = document.createElement("img");
    serverImage.src = "./res/svg/server.svg";
    serverImage.width = "24";
    serverImage.title = "Servidor asignado";
    cardTextServer.appendChild(serverImage);
    serverImage.after(
      document.createTextNode(" " + requestData.assignedServer)
    );
    cardBody.appendChild(cardTextServer);

    const cardTextProcessingTime = document.createElement("p");
    cardTextProcessingTime.className = "card-text";
    const processingTimeImage = document.createElement("img");
    processingTimeImage.src = "./res/svg/processing-time.svg";
    processingTimeImage.width = "24";
    processingTimeImage.title =
      requestData.status === "processing"
        ? "Tiempo procesando"
        : "Tiempo total de procesamiento";
    cardTextProcessingTime.appendChild(processingTimeImage);
    processingTimeImage.after(
      document.createTextNode(" " + msToTime(new Date().getTime() - Date.parse(requestData.processingStartTime)))
    );
    cardBody.appendChild(cardTextProcessingTime);
  }

  if (requestData.status === "processing") {
    const cardTextTimeEstimation = document.createElement("p");
    cardTextTimeEstimation.className = "card-text";
    const timeEstimationImage = document.createElement("img");
    timeEstimationImage.src = "./res/svg/estimation.svg";
    timeEstimationImage.width = "24";
    timeEstimationImage.title = "Tiempo de espera estimado";
    cardTextTimeEstimation.appendChild(timeEstimationImage);
    timeEstimationImage.after(
      document.createTextNode(
        " " + msToTime(requestData.estimatedRemainingProcessingTime)
      )
    );
    cardBody.appendChild(cardTextTimeEstimation);
  } else {
    const cardTextQueueTime = document.createElement("p");
    cardTextQueueTime.className = "card-text";
    const queueTimeImage = document.createElement("img");
    queueTimeImage.src = "./res/svg/queue-wait.svg";
    queueTimeImage.width = "24";
    queueTimeImage.title =
      requestData.status === "enqueued"
        ? "Tiempo esperando en cola"
        : "Tiempo total esperado en cola";
    cardTextQueueTime.appendChild(queueTimeImage);

    

   
    queueTimeImage.after(
      document.createTextNode(" " + msToTime(new Date().getTime() - Date.parse(requestData.queueStartTime)))
    );
    cardBody.appendChild(cardTextQueueTime);
  }

  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};

addRequestCard({
  _id: "222uh65",
  status: "processing",
  clientIp: "222.222.222.222",
  position: 4,
  server: "Portátil",
  processingTime: 80808080,
  estimatedRemainingTime: 78543,
  queueTime: 1000000,
});
addRequestCard({
  _id: "222uh65",
  status: "enqueued",
  clientIp: "222.222.222.222",
  position: 4,
  server: "Portátil",
  processingTime: 80808080,
  estimatedRemainingTime: 78543,
  queueTime: 1000000,
});
addRequestCard({
  _id: "222uh65",
  status: "fulfilled",
  clientIp: "222.222.222.222",
  position: 4,
  server: "Portátil",
  processingTime: 80808080,
  estimatedRemainingTime: 78543,
  queueTime: 1000000,
});

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
      console.error(error);
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
      console.error(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

const abortar = (serverId) => alert("Abortar " + serverId);

const eliminar = (serverId) => {
  fetch(`http://127.0.0.1:9000/servers/${serverId}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (response.status === 200) {
        alert((await response.json()).message);
      } else {
        alert((await response.json()).error);
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};
