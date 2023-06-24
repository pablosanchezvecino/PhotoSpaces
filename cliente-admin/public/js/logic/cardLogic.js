import { msToTime } from "./timeLogic.js";
import {
  showDisableModal,
  showEnableModal,
  showDeleteModal,
  showDeleteRequestModal
} from "./modalLogic.js";

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
  card.style = `height: 395px; width: 20rem; background-color: ${color}`;

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

  const cardTextTimeSpentOnRenderTest = document.createElement("p");
  cardTextTimeSpentOnRenderTest.className = "card-text";
  const timeSpentOnRenderTestImage = document.createElement("img");
  timeSpentOnRenderTestImage.src = "./res/svg/test.svg";
  timeSpentOnRenderTestImage.width = "24";
  timeSpentOnRenderTestImage.title = "Tiempo empleado en renderizado de prueba";
  cardTextTimeSpentOnRenderTest.appendChild(timeSpentOnRenderTestImage);
  timeSpentOnRenderTestImage.after(
    document.createTextNode(" " + msToTime(serverData.timeSpentOnRenderTest))
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
      ? () => showDisableModal(serverData._id)
      : serverData.status === "busy"
        ? () => alert("Abortar procesamiento servidor")//abortServer(serverData._id)
        : () => showEnableModal(serverData._id);

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardTextIP);
  cardBody.appendChild(cardTextOS);
  cardBody.appendChild(cardTextCPU);
  cardBody.appendChild(cardTextGPU);
  cardBody.appendChild(cardTextBlenderVersion);
  cardBody.appendChild(cardTextRegistrationDate);
  cardBody.appendChild(cardTextTimeSpentOnRenderTest);
  cardBody.appendChild(button1);

  if (serverData.status !== "busy") {
    const button2 = document.createElement("button");
    button2.className = "btn btn-danger ms-4";
    button2.innerText = "Eliminar";
    button2.onclick = () => showDeleteModal(serverData._id);
    cardBody.appendChild(button2);
  }
  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};

const addRequestCard = (requestData, queuePosition) => {
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
  card.style = `height: 395px; width: 20rem; background-color: ${color}`;

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
      document.createTextNode(" " + queuePosition.position)
    );
    queuePosition.position++;
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

  const cardTextFileExtension = document.createElement("p");
  cardTextFileExtension.className = "card-text";
  const fileExtensionImage = document.createElement("img");
  fileExtensionImage.src = "./res/svg/file-extension.svg";
  fileExtensionImage.width = "24";
  fileExtensionImage.title = "Extensión del archivo";
  cardTextFileExtension.appendChild(fileExtensionImage);
  fileExtensionImage.after(document.createTextNode(" " + requestData.fileExtension));
  cardBody.appendChild(cardTextFileExtension);

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
      document.createTextNode(
        " " +
          msToTime(
            (Date.parse(requestData.processingEndTime) ||
              new Date().getTime()) -
              Date.parse(requestData.processingStartTime)
          )
      )
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
      document.createTextNode(
        " " + (requestData.status === "enqueued"
          ? msToTime(
            ((new Date()).getTime()) - (Date.parse(requestData.queueStartTime))
          )
          : requestData.queueStartTime
            ? msToTime(
              Date.parse(requestData.processingStartTime) -
                Date.parse(requestData.queueStartTime)
            )
            : "00:00:00"
        ))
    );
    cardBody.appendChild(cardTextQueueTime);
  }

  if (requestData.status === "fulfilled") {
    const button = document.createElement("button");
    button.className = "btn btn-danger";

    button.innerText = "Eliminar";

    button.onclick = () => showDeleteRequestModal(requestData._id);

    cardBody.appendChild(button);
    
  }

  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};

export { addServerCard, addRequestCard };
