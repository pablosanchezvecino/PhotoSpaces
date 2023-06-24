/* Obtener lod parámetros configurables, que habrán sido establecidos por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let requestHandlingMicroserviceIp;
let requestHandlingMicroservicePort;

try {
  const response = await fetch("./parameters.json");
  const parameters = await response.json();
  
  requestHandlingMicroserviceIp = parameters.requestHandlingMicroserviceIp;
  requestHandlingMicroservicePort = parameters.requestHandlingMicroservicePort;
} catch (error) {
  console.error(error);
}

export {
  requestHandlingMicroserviceIp,
  requestHandlingMicroservicePort,
};
