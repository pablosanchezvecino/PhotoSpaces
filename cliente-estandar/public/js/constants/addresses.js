/* Obtener las direcciones de los microservicios, que habrán sido establecidas por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let requestHandlingMicroserviceIp;
let requestHandlingMicroservicePort;

try {
  const response = await fetch("./addresses.json");
  const addresses = await response.json();
  requestHandlingMicroserviceIp =
    addresses.requestHandlingMicroserviceIp;
    requestHandlingMicroservicePort =
    addresses.requestHandlingMicroservicePort;
} catch (error) {
  console.error(error);
}

export {
  requestHandlingMicroserviceIp,
  requestHandlingMicroservicePort,
};
