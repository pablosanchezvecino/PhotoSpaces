import validator from "validator";

// El nombre del servidor no puede ser vacío y
// su longitud será a lo sumo de 20 caracteres
const isValidServerName = (serverName) => {
  return serverName && serverName.length <= 20;
};

// Dirección IP debe seguir el formato de IPv4
const isValidIpv4 = (ipv4) => {
  return ipv4 && validator.isIP(ipv4, 4);
};

export { isValidServerName, isValidIpv4};