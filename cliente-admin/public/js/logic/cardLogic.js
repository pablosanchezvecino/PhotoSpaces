import { downloadRenderedImage } from "./downloadLogic.js";
import { msToTime, bytesToSize } from "./conversionsLogic.js";
import {
  showDisableModal,
  showEnableModal,
  showDeleteModal,
  showDeleteRequestModal,
  showAbortModal,
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
  col.style = "min-width: 1100px;";
  col.id = serverData._id;

  const card = document.createElement("div");
  card.className = "card mb-2";
  card.style = `height: 350; width: 65rem; background-color: ${color}`; //395px

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  // Nombre
  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = serverData.name;

  // Row
  const row = document.createElement("div");
  row.className = "row";

  // Cols
  const col1 = document.createElement("div");
  col1.className = "col";
  const col2 = document.createElement("div");
  col2.className = "col";
  const col3 = document.createElement("div");
  col3.className = "col";
  const col4 = document.createElement("div");
  col4.className = "col";



  // Dirección IP
  const ipCardText = document.createElement("p");
  ipCardText.className = "card-text";
  const ipImage = document.createElement("img");
  ipImage.src = "./res/img/svg/ip.svg";
  ipImage.width = "24";
  ipImage.title = "Dirección IP";
  ipCardText.appendChild(ipImage);
  ipImage.after(document.createTextNode(" " + serverData.ip));

  // Sistema Operativo
  const osCardText = document.createElement("p");
  osCardText.className = "card-text";
  const osImage = document.createElement("img");
  osImage.src = "./res/img/svg/os.svg";
  osImage.width = "24";
  osImage.title = "Sistema Operativo";
  osCardText.appendChild(osImage);
  osImage.after(document.createTextNode(" " + serverData.os));

  // CPU
  const cpuCardText = document.createElement("p");
  cpuCardText.className = "card-text";
  const cpuImage = document.createElement("img");
  cpuImage.src = "./res/img/svg/cpu.svg";
  cpuImage.width = "24";
  cpuImage.title = "Procesador";
  cpuCardText.appendChild(cpuImage);
  cpuImage.after(document.createTextNode(" " + serverData.cpu));

  // GPU
  const gpuCardText = document.createElement("p");
  gpuCardText.className = "card-text";
  const gpuImage = document.createElement("img");
  gpuImage.src = "./res/img/svg/gpu.svg";
  gpuImage.width = "24";
  gpuImage.title = "Tarjeta Gráfica";
  gpuCardText.appendChild(gpuImage);
  gpuImage.after(document.createTextNode(" " + serverData.gpu));

  // Versión de Blender
  const blenderVersionCardText = document.createElement("p");
  blenderVersionCardText.className = "card-text";
  const blenderVersionImage = document.createElement("img");
  blenderVersionImage.src = "./res/img/svg/blender.svg";
  blenderVersionImage.width = "24";
  blenderVersionImage.title = "Versión de Blender";
  blenderVersionCardText.appendChild(blenderVersionImage);
  blenderVersionImage.after(
    document.createTextNode(" " + serverData.blenderVersion)
  );

  // Fecha de registro
  const registrationDateCardText = document.createElement("p");
  registrationDateCardText.className = "card-text";
  const registrationDateImage = document.createElement("img");
  registrationDateImage.src = "./res/img/svg/date.svg";
  registrationDateImage.width = "24";
  registrationDateImage.title = "Fecha y hora de registro en el sistema";
  registrationDateCardText.appendChild(registrationDateImage);
  registrationDateImage.after(
    document.createTextNode(
      " " + new Date(serverData.registrationDate).toLocaleString()
    )
  );

  // Tiempo en renderizado de prueba
  const timeSpentOnRenderTestCardText = document.createElement("p");
  timeSpentOnRenderTestCardText.className = "card-text";
  const timeSpentOnRenderTestImage = document.createElement("img");
  timeSpentOnRenderTestImage.src = "./res/img/svg/test.svg";
  timeSpentOnRenderTestImage.width = "24";
  timeSpentOnRenderTestImage.title = "Tiempo empleado en renderizado de prueba";
  timeSpentOnRenderTestCardText.appendChild(timeSpentOnRenderTestImage);
  timeSpentOnRenderTestImage.after(
    document.createTextNode(" " + msToTime(serverData.timeSpentOnRenderTest))
  );

  // Peticiones satisfechas
  const fulfilledRequestsCountCardText = document.createElement("p");
  fulfilledRequestsCountCardText.className = "card-text";
  const fulfilledRequestsCountImage = document.createElement("img");
  fulfilledRequestsCountImage.src = "./res/img/svg/fulfilled.svg";
  fulfilledRequestsCountImage.width = "24";
  fulfilledRequestsCountImage.title = "Número de peticiones satisfechas";
  fulfilledRequestsCountCardText.appendChild(fulfilledRequestsCountImage);
  fulfilledRequestsCountImage.after(
    document.createTextNode(" " + serverData.fulfilledRequestsCount.toLocaleString())
  );

  // Peticiones encoladas
  const enqueuedRequestsCountCardText = document.createElement("p");
  enqueuedRequestsCountCardText.className = "card-text";
  const enqueuedRequestsCountImage = document.createElement("img");
  enqueuedRequestsCountImage.src = "./res/img/svg/queue.svg";
  enqueuedRequestsCountImage.width = "24";
  enqueuedRequestsCountImage.title = "Número de peticiones encoladas";
  enqueuedRequestsCountCardText.appendChild(enqueuedRequestsCountImage);
  enqueuedRequestsCountImage.after(
    document.createTextNode(" " + serverData.enqueuedRequestsCount.toLocaleString())
  );

  let boldElement = null;
  let auxText = null;

  // Tamaño total procesado Cycles
  const totalSizeProcessedCyclesCardText = document.createElement("p");
  totalSizeProcessedCyclesCardText.className = "card-text";
  const totalSizeProcessedSumCyclesImage = document.createElement("img");
  totalSizeProcessedSumCyclesImage.src = "./res/img/svg/sum.svg";
  totalSizeProcessedSumCyclesImage.width = "24";
  totalSizeProcessedSumCyclesImage.title = "Tamaño de la información total procesada con Cycles";
  totalSizeProcessedCyclesCardText.appendChild(totalSizeProcessedSumCyclesImage);
  const totalSizeProcessedCyclesImage = document.createElement("img");
  totalSizeProcessedCyclesImage.src = "./res/img/svg/total-size-processed.svg";
  totalSizeProcessedCyclesImage.width = "24";
  totalSizeProcessedCyclesImage.title = "Tamaño de la información total procesada con Cycles";
  totalSizeProcessedCyclesCardText.appendChild(totalSizeProcessedCyclesImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  totalSizeProcessedCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(bytesToSize(serverData.totalCyclesProcessedBytes)));

  // Píxeles totales renderizados Cycles
  const totalPixelsProcessedCyclesCardText = document.createElement("p");
  totalPixelsProcessedCyclesCardText.className = "card-text";
  const totalPixelsProcessedSumCyclesImage = document.createElement("img");
  totalPixelsProcessedSumCyclesImage.src = "./res/img/svg/sum.svg";
  totalPixelsProcessedSumCyclesImage.width = "24";
  totalSizeProcessedSumCyclesImage.title = "Número total de píxeles renderizados con Cycles";
  totalPixelsProcessedCyclesCardText.appendChild(totalPixelsProcessedSumCyclesImage);
  const totalPixelsProcessedCyclesImage = document.createElement("img");
  totalPixelsProcessedCyclesImage.src = "./res/img/svg/pixels.svg";
  totalPixelsProcessedCyclesImage.width = "24";
  totalPixelsProcessedCyclesImage.title = "Número total de píxeles renderizados con Cycles";
  totalPixelsProcessedCyclesCardText.appendChild(totalPixelsProcessedCyclesImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  totalPixelsProcessedCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalCyclesProcessedPixels.toLocaleString()));

  // Tiempo total requerido Cycles
  const totalNeededTimeCyclesCardText = document.createElement("p");
  totalNeededTimeCyclesCardText.className = "card-text";
  const totalNeededTimeSumCyclesImage = document.createElement("img");
  totalNeededTimeSumCyclesImage.src = "./res/img/svg/sum.svg";
  totalNeededTimeSumCyclesImage.width = "24";
  totalNeededTimeSumCyclesImage.title = "Tiempo total requerido para satisfacer todas las peticiones de Cycles recibidas";
  totalNeededTimeCyclesCardText.appendChild(totalNeededTimeSumCyclesImage);
  const totalNeededTimeCyclesImage = document.createElement("img");
  totalNeededTimeCyclesImage.src = "./res/img/svg/processing-time.svg";
  totalNeededTimeCyclesImage.width = "24";
  totalNeededTimeCyclesImage.title = "Tiempo total requerido para satisfacer todas las peticiones de Cycles recibidas";
  totalNeededTimeCyclesCardText.appendChild(totalNeededTimeCyclesImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  totalNeededTimeCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(msToTime(serverData.totalCyclesNeededTime)));

  // Bytes/ms de tiempo requerido Cycles
  const bytesPerNeededMsCyclesCardText = document.createElement("p");
  bytesPerNeededMsCyclesCardText.className = "card-text";
  const bytesPerNeededMsFirstCyclesImage = document.createElement("img");
  bytesPerNeededMsFirstCyclesImage.src = "./res/img/svg/total-size-processed.svg";
  bytesPerNeededMsFirstCyclesImage.width = "24";
  bytesPerNeededMsFirstCyclesImage.title = "Bytes procesados con Cycles por milisegundo requerido por el sistema";
  bytesPerNeededMsCyclesCardText.appendChild(bytesPerNeededMsFirstCyclesImage);
  const bytesPerNeededMsSlashCyclesImage = document.createElement("img");
  bytesPerNeededMsSlashCyclesImage.src = "./res/img/svg/slash.svg";
  bytesPerNeededMsSlashCyclesImage.height = "24";
  bytesPerNeededMsSlashCyclesImage.title = "Bytes procesados con Cycles por milisegundo requerido por el sistema";
  bytesPerNeededMsCyclesCardText.appendChild(bytesPerNeededMsSlashCyclesImage);
  const bytesPerNeededMsSecondCyclesImage = document.createElement("img");
  bytesPerNeededMsSecondCyclesImage.src = "./res/img/svg/processing-time.svg";
  bytesPerNeededMsSecondCyclesImage.width = "24";
  bytesPerNeededMsSecondCyclesImage.title = "Bytes procesados con Cycles por milisegundo requerido por el sistema";
  bytesPerNeededMsCyclesCardText.appendChild(bytesPerNeededMsSecondCyclesImage);
  boldElement =document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  bytesPerNeededMsSecondCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalCyclesProcessedBytes ? bytesToSize(serverData.totalCyclesProcessedBytes / serverData.totalCyclesNeededTime) + "/ms" : "N/A"));

  // Tiempo total de ejecución de Blender Cycles
  const totalBlenderTimeCyclesCardText = document.createElement("p");
  totalSizeProcessedCyclesCardText.className = "card-text";
  const totalBlenderTimeSumCyclesImage = document.createElement("img");
  totalBlenderTimeSumCyclesImage.src = "./res/img/svg/sum.svg";
  totalBlenderTimeSumCyclesImage.width = "24";
  totalBlenderTimeSumCyclesImage.title = "Tiempo total de procesamiento con Blender usando Cycles";
  totalBlenderTimeCyclesCardText.appendChild(totalBlenderTimeSumCyclesImage);
  const totalBlenderTimeCyclesImage = document.createElement("img");
  totalBlenderTimeCyclesImage.src = "./res/img/svg/blender.svg";
  totalBlenderTimeCyclesImage.width = "24";
  totalBlenderTimeCyclesImage.title = "Tiempo total de procesamiento con Blender usando Cycles";
  totalBlenderTimeCyclesCardText.appendChild(totalBlenderTimeCyclesImage);
  boldElement =document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  totalBlenderTimeCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(msToTime(serverData.totalCyclesBlenderTime)));
 
  // Bytes/ms de tiempo de ejecución en Blender Cycles
  const bytesPerBlenderMsCyclesCardText = document.createElement("p");
  bytesPerBlenderMsCyclesCardText.className = "card-text";
  const bytesPerBlenderMsFirstCyclesImage = document.createElement("img");
  bytesPerBlenderMsFirstCyclesImage.src = "./res/img/svg/total-size-processed.svg";
  bytesPerBlenderMsFirstCyclesImage.width = "24";
  bytesPerBlenderMsFirstCyclesImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsCyclesCardText.appendChild(bytesPerBlenderMsFirstCyclesImage);
  const bytesPerBlenderMsSlashCyclesImage = document.createElement("img");
  bytesPerBlenderMsSlashCyclesImage.src = "./res/img/svg/slash.svg";
  bytesPerBlenderMsSlashCyclesImage.height = "24";
  bytesPerBlenderMsSlashCyclesImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsCyclesCardText.appendChild(bytesPerBlenderMsSlashCyclesImage);
  const bytesPerBlenderMsSecondCyclesImage = document.createElement("img");
  bytesPerBlenderMsSecondCyclesImage.src = "./res/img/svg/blender.svg";
  bytesPerBlenderMsSecondCyclesImage.width = "24";
  bytesPerBlenderMsSecondCyclesImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsCyclesCardText.appendChild(bytesPerBlenderMsSecondCyclesImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  bytesPerBlenderMsSecondCyclesImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalCyclesProcessedBytes ? bytesToSize(serverData.totalCyclesProcessedBytes / serverData.totalCyclesBlenderTime) + "/ms" : "N/A"));

  // Puntuación Cycles
  const cyclesScoreCardText = document.createElement("p");
  cyclesScoreCardText.className = "card-text";
  const cyclesScoreImage = document.createElement("img");
  cyclesScoreImage.src = "./res/img/svg/score.svg";
  cyclesScoreImage.width = "24";
  cyclesScoreImage.title = "Puntuación";
  cyclesScoreCardText.appendChild(cyclesScoreImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (CYCLES) ");
  boldElement.appendChild(auxText);
  cyclesScoreImage.after(boldElement);
  boldElement.after(document.createTextNode(" " + (serverData.cyclesScore !== null ? (parseFloat(serverData.cyclesScore.toFixed(2)).toLocaleString() + " puntos") : "N/A" )));

  // Tamaño total procesado Eevee
  const totalSizeProcessedEeveeCardText = document.createElement("p");
  totalSizeProcessedEeveeCardText.className = "card-text";
  const totalSizeProcessedSumEeveeImage = document.createElement("img");
  totalSizeProcessedSumEeveeImage.src = "./res/img/svg/sum.svg";
  totalSizeProcessedSumEeveeImage.width = "24";
  totalSizeProcessedSumEeveeImage.title = "Tamaño de la información total procesada con Eevee";
  totalSizeProcessedEeveeCardText.appendChild(totalSizeProcessedSumEeveeImage);
  const totalSizeProcessedEeveeImage = document.createElement("img");
  totalSizeProcessedEeveeImage.src = "./res/img/svg/total-size-processed.svg";
  totalSizeProcessedEeveeImage.width = "24";
  totalSizeProcessedEeveeImage.title = "Tamaño de la información total procesada con Eevee";
  totalSizeProcessedEeveeCardText.appendChild(totalSizeProcessedEeveeImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  totalSizeProcessedEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(bytesToSize(serverData.totalEeveeProcessedBytes)));

  // Píxeles totales renderizados Eevee
  const totalPixelsProcessedEeveeCardText = document.createElement("p");
  totalPixelsProcessedEeveeCardText.className = "card-text";
  const totalPixelsProcessedSumEeveeImage = document.createElement("img");
  totalPixelsProcessedSumEeveeImage.src = "./res/img/svg/sum.svg";
  totalPixelsProcessedSumEeveeImage.width = "24";
  totalSizeProcessedSumEeveeImage.title = "Número total de píxeles renderizados con Eevee";
  totalPixelsProcessedEeveeCardText.appendChild(totalPixelsProcessedSumEeveeImage);
  const totalPixelsProcessedEeveeImage = document.createElement("img");
  totalPixelsProcessedEeveeImage.src = "./res/img/svg/pixels.svg";
  totalPixelsProcessedEeveeImage.width = "24";
  totalPixelsProcessedEeveeImage.title = "Número total de píxeles renderizados con Eevee";
  totalPixelsProcessedEeveeCardText.appendChild(totalPixelsProcessedEeveeImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  totalPixelsProcessedEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalEeveeProcessedPixels.toLocaleString()));

  // Tiempo total requerido Eevee
  const totalNeededTimeEeveeCardText = document.createElement("p");
  totalNeededTimeEeveeCardText.className = "card-text";
  const totalNeededTimeSumEeveeImage = document.createElement("img");
  totalNeededTimeSumEeveeImage.src = "./res/img/svg/sum.svg";
  totalNeededTimeSumEeveeImage.width = "24";
  totalNeededTimeSumEeveeImage.title = "Tiempo total requerido para satisfacer todas las peticiones de Eevee recibidas";
  totalNeededTimeEeveeCardText.appendChild(totalNeededTimeSumEeveeImage);
  const totalNeededTimeEeveeImage = document.createElement("img");
  totalNeededTimeEeveeImage.src = "./res/img/svg/processing-time.svg";
  totalNeededTimeEeveeImage.width = "24";
  totalNeededTimeEeveeImage.title = "Tiempo total requerido para satisfacer todas las peticiones de Eevee recibidas";
  totalNeededTimeEeveeCardText.appendChild(totalNeededTimeEeveeImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  totalNeededTimeEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(msToTime(serverData.totalEeveeNeededTime)));

  // Bytes/ms de tiempo requerido Eevee
  const bytesPerNeededMsEeveeCardText = document.createElement("p");
  bytesPerNeededMsEeveeCardText.className = "card-text";
  const bytesPerNeededMsFirstEeveeImage = document.createElement("img");
  bytesPerNeededMsFirstEeveeImage.src = "./res/img/svg/total-size-processed.svg";
  bytesPerNeededMsFirstEeveeImage.width = "24";
  bytesPerNeededMsFirstEeveeImage.title = "Bytes procesados con Eevee por milisegundo requerido por el sistema";
  bytesPerNeededMsEeveeCardText.appendChild(bytesPerNeededMsFirstEeveeImage);
  const bytesPerNeededMsSlashEeveeImage = document.createElement("img");
  bytesPerNeededMsSlashEeveeImage.src = "./res/img/svg/slash.svg";
  bytesPerNeededMsSlashEeveeImage.height = "24";
  bytesPerNeededMsSlashEeveeImage.title = "Bytes procesados con Eevee por milisegundo requerido por el sistema";
  bytesPerNeededMsEeveeCardText.appendChild(bytesPerNeededMsSlashEeveeImage);
  const bytesPerNeededMsSecondEeveeImage = document.createElement("img");
  bytesPerNeededMsSecondEeveeImage.src = "./res/img/svg/processing-time.svg";
  bytesPerNeededMsSecondEeveeImage.width = "24";
  bytesPerNeededMsSecondEeveeImage.title = "Bytes procesados con Eevee por milisegundo requerido por el sistema";
  bytesPerNeededMsEeveeCardText.appendChild(bytesPerNeededMsSecondEeveeImage);
  boldElement =document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  bytesPerNeededMsSecondEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalEeveeProcessedBytes ? bytesToSize(serverData.eeveeProcessedBytesPerMillisecondOfNeededTime) + "/ms" : "N/A"));

  // Tiempo total de ejecución de Blender Eevee
  const totalBlenderTimeEeveeCardText = document.createElement("p");
  totalSizeProcessedEeveeCardText.className = "card-text";
  const totalBlenderTimeSumEeveeImage = document.createElement("img");
  totalBlenderTimeSumEeveeImage.src = "./res/img/svg/sum.svg";
  totalBlenderTimeSumEeveeImage.width = "24";
  totalBlenderTimeSumEeveeImage.title = "Tiempo total de procesamiento con Blender usando Eevee";
  totalBlenderTimeEeveeCardText.appendChild(totalBlenderTimeSumEeveeImage);
  const totalBlenderTimeEeveeImage = document.createElement("img");
  totalBlenderTimeEeveeImage.src = "./res/img/svg/blender.svg";
  totalBlenderTimeEeveeImage.width = "24";
  totalBlenderTimeEeveeImage.title = "Tiempo total de procesamiento con Blender usando Eevee";
  totalBlenderTimeEeveeCardText.appendChild(totalBlenderTimeEeveeImage);
  boldElement =document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  totalBlenderTimeEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(msToTime(serverData.totalEeveeBlenderTime)));
 
  // Bytes/ms de tiempo de ejecución en Blender Eevee
  const bytesPerBlenderMsEeveeCardText = document.createElement("p");
  bytesPerBlenderMsEeveeCardText.className = "card-text";
  const bytesPerBlenderMsFirstEeveeImage = document.createElement("img");
  bytesPerBlenderMsFirstEeveeImage.src = "./res/img/svg/total-size-processed.svg";
  bytesPerBlenderMsFirstEeveeImage.width = "24";
  bytesPerBlenderMsFirstEeveeImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsEeveeCardText.appendChild(bytesPerBlenderMsFirstEeveeImage);
  const bytesPerBlenderMsSlashEeveeImage = document.createElement("img");
  bytesPerBlenderMsSlashEeveeImage.src = "./res/img/svg/slash.svg";
  bytesPerBlenderMsSlashEeveeImage.height = "24";
  bytesPerBlenderMsSlashEeveeImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsEeveeCardText.appendChild(bytesPerBlenderMsSlashEeveeImage);
  const bytesPerBlenderMsSecondEeveeImage = document.createElement("img");
  bytesPerBlenderMsSecondEeveeImage.src = "./res/img/svg/blender.svg";
  bytesPerBlenderMsSecondEeveeImage.width = "24";
  bytesPerBlenderMsSecondEeveeImage.title = "Bytes procesados por milisegundo de ejecución en Blender";
  bytesPerBlenderMsEeveeCardText.appendChild(bytesPerBlenderMsSecondEeveeImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  bytesPerBlenderMsSecondEeveeImage.after(boldElement);
  boldElement.after(document.createTextNode(serverData.totalEeveeProcessedBytes ? bytesToSize(serverData.totalEeveeProcessedBytes / serverData.totalEeveeBlenderTime) + "/ms" : "N/A"));

  // Puntuación Eevee
  const eeveeScoreCardText = document.createElement("p");
  eeveeScoreCardText.className = "card-text";
  const eeveeScoreImage = document.createElement("img");
  eeveeScoreImage.src = "./res/img/svg/score.svg";
  eeveeScoreImage.width = "24";
  eeveeScoreImage.title = "Puntuación";
  eeveeScoreCardText.appendChild(eeveeScoreImage);
  boldElement = document.createElement("b");
  auxText = document.createTextNode(" (EEVEE) ");
  boldElement.appendChild(auxText);
  eeveeScoreImage.after(boldElement);
  boldElement.after(document.createTextNode(" " + (serverData.eeveeScore !== null ? (parseFloat(serverData.eeveeScore.toFixed(2)).toLocaleString() + " puntos") : "N/A" )));



  const button1 = document.createElement("button");
  button1.className = (serverData.status === "disabled" ? "btn btn-success" : "btn btn-danger") + " mt-3";

  button1.title = 
    serverData.status === "idle"
      ? "Deshabilitar servidor"
      : serverData.status === "busy"
        ? "Abortar procesamiento en servidor"
        : "Habilitar servidor";

  button1.onclick =
    serverData.status === "idle"
      ? () => showDisableModal(serverData._id)
      : serverData.status === "busy"
        ? () => showAbortModal(serverData._id)
        : () => showEnableModal(serverData._id);

  const button1svgResourceName =
   serverData.status === "idle"
     ? "locked"
     : serverData.status === "busy"
       ? "abort"
       : "unlocked";

  const button1Image = document.createElement("img");
  button1Image.src = `./res/img/svg/${button1svgResourceName}.svg`;
  button1Image.width = "24";
  button1Image.title = 
    serverData.status === "idle"
      ? "Deshabilitar servidor"
      : serverData.status === "busy"
        ? "Abortar procesamiento en el servidor"
        : "Habilitar servidor";

  button1.appendChild(button1Image);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "d-flex justify-content-end";
 
  buttonsContainer.appendChild(button1);

  col1.appendChild(ipCardText);  
  col1.appendChild(osCardText);  
  col1.appendChild(cpuCardText);  
  col1.appendChild(gpuCardText);  
  col1.appendChild(blenderVersionCardText);  
  col1.appendChild(registrationDateCardText);  

  col2.appendChild(totalSizeProcessedCyclesCardText);  
  col2.appendChild(totalPixelsProcessedCyclesCardText);  
  col2.appendChild(totalNeededTimeCyclesCardText);  
  col2.appendChild(bytesPerNeededMsCyclesCardText);  
  col2.appendChild(totalBlenderTimeCyclesCardText);  
  col2.appendChild(bytesPerBlenderMsCyclesCardText); 
  col2.appendChild(cyclesScoreCardText); 
   
  col3.appendChild(totalSizeProcessedEeveeCardText);  
  col3.appendChild(totalPixelsProcessedEeveeCardText);  
  col3.appendChild(totalNeededTimeEeveeCardText);  
  col3.appendChild(bytesPerNeededMsEeveeCardText);  
  col3.appendChild(totalBlenderTimeEeveeCardText);  
  col3.appendChild(bytesPerBlenderMsEeveeCardText);
  col3.appendChild(eeveeScoreCardText);  
  
  col4.appendChild(timeSpentOnRenderTestCardText);  
  col4.appendChild(fulfilledRequestsCountCardText);  
  col4.appendChild(enqueuedRequestsCountCardText);  
  
  row.appendChild(col1);  
  row.appendChild(col2);  
  row.appendChild(col3);  
  row.appendChild(col4);  

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(row);

  const button2 = document.createElement("button");
  button2.className = "btn btn-danger mt-3 ms-4";
  button2.title = "Eliminar servidor";
  button2.onclick = () => showDeleteModal(serverData._id);
  const deleteImage = document.createElement("img");
  deleteImage.src = "./res/img/svg/trash.svg";
  deleteImage.width = "24";
  deleteImage.title = "Eliminar servidor";
  button2.appendChild(deleteImage);
  buttonsContainer.appendChild(button2);

  cardBody.appendChild(buttonsContainer);
  card.appendChild(cardBody);

  col.appendChild(card);

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
  card.style = `height: 520px; width: 20rem; background-color: ${color}`;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = requestData._id;
  cardBody.appendChild(cardTitle);



  if (requestData.status === "enqueued") {
    // Orden de llegada
    const positionCardText = document.createElement("p");
    positionCardText.className = "card-text";
    const positionImage = document.createElement("img");
    positionImage.src = "./res/img/svg/position.svg";
    positionImage.width = "24";
    positionImage.title = "Orden de llegada";
    positionCardText.appendChild(positionImage);
    positionImage.after(
      document.createTextNode(" " + queuePosition.position)
    );
    queuePosition.position++;
    cardBody.appendChild(positionCardText);
  }

  // Información del usuario
  const userIpCardText = document.createElement("p");
  userIpCardText.className = "card-text";
  const userIpImage = document.createElement("img");
  userIpImage.src = "./res/img/svg/user-ip.svg";
  userIpImage.width = "24";
  userIpImage.title = "Información del usuario (etiqueta opcional y dirección IP)";
  userIpCardText.appendChild(userIpImage);
  userIpImage.after(document.createTextNode(" " + (requestData.requestLabel ? (requestData.requestLabel + " ") : "No especificada ") + `(${requestData.clientIp})`));
  cardBody.appendChild(userIpCardText);
  
  // Servidor asignado
  const assignedServerCardText = document.createElement("p");
  assignedServerCardText.className = "card-text";
  const assignedServerImage = document.createElement("img");
  assignedServerImage.src = "./res/img/svg/server.svg";
  assignedServerImage.width = "24";
  assignedServerImage.title = "Servidor asignado";
  assignedServerCardText.appendChild(assignedServerImage);
  assignedServerImage.after(
    document.createTextNode(" " + (requestData.assignedServer !== null ? requestData.assignedServer : "Sin servidor asignado aún"))
  );
  cardBody.appendChild(assignedServerCardText);
  
  // Método de recepción solicitado
  const receiveMethodCardText = document.createElement("p");
  receiveMethodCardText.className = "card-text";
  const receiveMethodImage = document.createElement("img");
  receiveMethodImage.src = "./res/img/svg/send.svg";
  receiveMethodImage.width = "24";
  receiveMethodImage.title = "Dirección IP del usuario";
  receiveMethodCardText.appendChild(receiveMethodImage);
  receiveMethodImage.after(document.createTextNode(" " + ( requestData.email ? `${requestData.email}` : "Descarga en el navegador")));
  cardBody.appendChild(receiveMethodCardText);

  // Motor de renderizado
  const renderEngineCardText = document.createElement("p");
  renderEngineCardText.className = "card-text";
  const renderEngineImage = document.createElement("img");
  renderEngineImage.src = "./res/img/svg/engine.svg";
  renderEngineImage.width = "24";
  renderEngineImage.title = "Motor de renderizado";
  renderEngineCardText.appendChild(renderEngineImage);
  renderEngineImage.after(document.createTextNode(requestData.parameters.engine === "CYCLES" ? " Cycles" : " Eevee"));
  cardBody.appendChild(renderEngineCardText);

  // Resolución
  const resolutionCardText = document.createElement("p");
  resolutionCardText.className = "card-text";
  const resolutionImage = document.createElement("img");
  resolutionImage.src = "./res/img/svg/resolution.svg";
  resolutionImage.width = "24";
  resolutionImage.title = "Resolución de la imagen renderizada";
  resolutionCardText.appendChild(resolutionImage);
  resolutionImage.after(document.createTextNode(" " + requestData.parameters.resolution));
  cardBody.appendChild(resolutionCardText);

  // Detalles del fichero
  const fileDetailsCardText = document.createElement("p");
  fileDetailsCardText.className = "card-text";
  const fileDetailsImage = document.createElement("img");
  fileDetailsImage.src = "./res/img/svg/file-details.svg";
  fileDetailsImage.width = "24";
  fileDetailsImage.title = "Detalles del archivo";
  fileDetailsCardText.appendChild(fileDetailsImage);
  fileDetailsImage.after(document.createTextNode(" " + requestData.fileExtension + ` (${bytesToSize(requestData.fileSize)})`));
  cardBody.appendChild(fileDetailsCardText);

  if (requestData.status !== "enqueued") {

    // Tiempo de procesamiento de la petición
    const neededTimeCardText = document.createElement("p");
    neededTimeCardText.className = "card-text";
    const neededTimeImage = document.createElement("img");
    neededTimeImage.src = "./res/img/svg/processing-time.svg";
    neededTimeImage.width = "24";
    neededTimeImage.title =
      requestData.status === "processing"
        ? "Tiempo procesando"
        : "Tiempo total de procesamiento";
    neededTimeCardText.appendChild(neededTimeImage);
    neededTimeImage.after(
      document.createTextNode(
        " " +
          msToTime(
            (Date.parse(requestData.processingEndTime) ||
              new Date().getTime()) -
              Date.parse(requestData.processingStartTime)
          )
      )
    );
    cardBody.appendChild(neededTimeCardText);
  }

  if (requestData.status === "processing") {
    // Estimación del tiempo restante
    const timeEstimationCardText = document.createElement("p");
    timeEstimationCardText.className = "card-text";
    const timeEstimationImage = document.createElement("img");
    timeEstimationImage.src = "./res/img/svg/estimation.svg";
    timeEstimationImage.width = "24";
    timeEstimationImage.title = "Tiempo de espera estimado";
    timeEstimationCardText.appendChild(timeEstimationImage);
    timeEstimationImage.after(
      document.createTextNode(
        " " + msToTime(requestData.estimatedRemainingProcessingTime)
      )
    );
    cardBody.appendChild(timeEstimationCardText);
  } else {
    // Tiempo en la cola
    const queueTimeCardText = document.createElement("p");
    queueTimeCardText.className = "card-text";
    const queueTimeImage = document.createElement("img");
    queueTimeImage.src = "./res/img/svg/queue-wait.svg";
    queueTimeImage.width = "24";
    queueTimeImage.title =
      requestData.status === "enqueued"
        ? "Tiempo esperando en cola"
        : "Tiempo total esperado en cola";
    queueTimeCardText.appendChild(queueTimeImage);

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
    cardBody.appendChild(queueTimeCardText);
  }

  // Tiempo de transferencia previa del archivo
  const transferTimeCardText = document.createElement("p");
  transferTimeCardText.className = "card-text";
  const transferTimeImage = document.createElement("img");
  transferTimeImage.src = "./res/img/svg/file-transfer.svg";
  transferTimeImage.width = "24";
  transferTimeImage.title = "Transferencia de fichero con escena 3D";
  transferTimeCardText.appendChild(transferTimeImage);

  transferTimeImage.after(

    document.createTextNode(
      " " + (requestData.transferTime ? `Transferencia previa (${requestData.transferTime} ms)` :
        (requestData.status === "enqueued" ? "Transferencia pendiente" : "Transferencia junto a petición")))

  );
  cardBody.appendChild(transferTimeCardText);

  if (requestData.status === "fulfilled") {
    // Tiempo total de procesamiento en Blender
    const totalBlenderTimeCardText = document.createElement("p");
    totalBlenderTimeCardText.className = "card-text";
    const totalBlenderTimeImage = document.createElement("img");
    totalBlenderTimeImage.src = "./res/img/svg/blender.svg";
    totalBlenderTimeImage.width = "24";
    totalBlenderTimeImage.title = "Tiempo de procesamiento en Blender";
    totalBlenderTimeCardText.appendChild(totalBlenderTimeImage);
    totalBlenderTimeImage.after(
      document.createTextNode(
        " " + msToTime(requestData.totalBlenderTime)
      )
    );
    cardBody.appendChild(totalBlenderTimeCardText);
  }


  
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex justify-content-end";
  
  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger";
  deleteButton.title = "Eliminar petición";
  deleteButton.onclick = () => showDeleteRequestModal(requestData._id);
  cardBody.appendChild(deleteButton);
  const deleteImage = document.createElement("img");
  deleteImage.src = "./res/img/svg/trash.svg";
  deleteImage.width = "24";
  deleteImage.title = "Eliminar petición";
  deleteButton.appendChild(deleteImage);
  buttonContainer.appendChild(deleteButton);
    
  if (requestData.status === "fulfilled") {
    const downloadButton = document.createElement("button");
    downloadButton.className = "btn btn-primary ms-3";
    downloadButton.title = "Descargar imagen renderizada";
    downloadButton.onclick = () => downloadRenderedImage(requestData._id);
    const downloadImage = document.createElement("img");
    downloadImage.src = "./res/img/svg/download.svg";
    downloadImage.width = "24";
    downloadImage.title = "Descargar imagen renderizada";
    downloadButton.appendChild(downloadImage);
    buttonContainer.appendChild(downloadButton);
  }

  cardBody.appendChild(buttonContainer);
  card.appendChild(cardBody);

  col.appendChild(card);

  document.body.appendChild(col);

  container.appendChild(col);
};

export { addServerCard, addRequestCard };
