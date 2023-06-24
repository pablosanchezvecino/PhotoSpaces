/* Obtener los distintos parámetros configurables, que habrán sido establecidos por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let administrationMicroserviceIp;
let administrationMicroservicePort;
let refreshPeriodMs;

try {
  const response = await fetch("./parameters.json");
  const parameters = await response.json();

  administrationMicroserviceIp = parameters.administrationMicroserviceIp;
  administrationMicroservicePort = parameters.administrationMicroservicePort;
  refreshPeriodMs = parameters.refreshPeriodMs;
} catch (error) {
  console.error(`Error al intentar leer los parámetros del archivo parameters.json. ${error}`.red);
}

export {
  administrationMicroserviceIp,
  administrationMicroservicePort,
  refreshPeriodMs
};
