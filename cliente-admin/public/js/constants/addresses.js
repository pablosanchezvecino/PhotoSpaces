/* Obtener las direcciones de los microservicios, que habrán sido establecidas por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let administrationMicroserviceIp;
let administrationMicroservicePort;

try {

  const response = await fetch("./addresses.json");
  const addresses = await response.json();

  administrationMicroserviceIp = addresses.administrationMicroserviceIp;
  administrationMicroservicePort = addresses.administrationMicroservicePort;

} catch (error) {
  console.error(`Error al intentar leer las direcciones del archivo addresses.json. ${error}`);
}

export {
  administrationMicroserviceIp,
  administrationMicroservicePort
};
