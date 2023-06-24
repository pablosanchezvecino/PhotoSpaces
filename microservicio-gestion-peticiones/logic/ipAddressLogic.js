
const processIpAddress = (ipAddress) => {
  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (ipAddress.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    ipAddress = ipAddress.toString().slice(7);
  }

  return ipAddress;
};

export { processIpAddress };