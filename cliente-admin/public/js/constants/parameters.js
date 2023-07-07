/* Obtener los distintos parámetros configurables, que habrán sido establecidos por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let administrationMicroserviceIp = null;
let administrationMicroservicePort = null;
let refreshPeriodMs = null;
let maxCardsPerContainer = null;

try {
  const response = await fetch("./parameters.json");
  const parameters = await response.json();

  administrationMicroserviceIp = parameters.administrationMicroserviceIp;
  administrationMicroservicePort = parameters.administrationMicroservicePort;
  refreshPeriodMs = parameters.refreshPeriodMs;
  maxCardsPerContainer = parameters.maxCardsPerContainer;
} catch (error) {
  console.error(`Error al intentar leer los parámetros del archivo parameters.json. ${error}`.red);
}

export {
  administrationMicroserviceIp,
  administrationMicroservicePort,
  refreshPeriodMs,
  maxCardsPerContainer
};
