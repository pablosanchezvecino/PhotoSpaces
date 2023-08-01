/* Obtener los parámetros configurables, que habrán sido establecidos por el 
servidor express a través de las variables de entorno antes de servir la carpeta public */

let requestHandlingMicroserviceUrl;

try {
  const response = await fetch("./parameters.json");
  const parameters = await response.json();
  
  requestHandlingMicroserviceUrl = parameters.requestHandlingMicroserviceUrl;
} catch (error) {
  console.error(error);
}

export {
  requestHandlingMicroserviceUrl
};
