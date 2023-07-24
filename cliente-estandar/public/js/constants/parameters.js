/* Obtener los parámetros configurables, que habrán sido establecidos por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let requestHandlingMicroserviceHost;
let requestHandlingMicroservicePort;

try {
  const response = await fetch("./parameters.json");
  const parameters = await response.json();
  
  requestHandlingMicroserviceHost = parameters.requestHandlingMicroserviceHost;
  requestHandlingMicroservicePort = parameters.requestHandlingMicroservicePort;
} catch (error) {
  console.error(error);
}

export {
  requestHandlingMicroserviceHost,
  requestHandlingMicroservicePort,
};
