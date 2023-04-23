/* Obtener las direcciones de los microservicios, que habrán sido establecidas por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let serverAdministrationMicroserviceIp;
let serverAdministrationMicroservicePort;

try {
  const response = await fetch("./addresses.json");
  const addresses = await response.json();
  serverAdministrationMicroserviceIp =
    addresses.serverAdministrationMicroserviceIp;
  serverAdministrationMicroservicePort =
    addresses.serverAdministrationMicroservicePort;
} catch (error) {
  console.error(error);
}

export {
  serverAdministrationMicroserviceIp,
  serverAdministrationMicroservicePort,
};
