let allowedIps = process.env.ALLOWED_IPS;

// Extraer diecciones IP
if (process.env.ALLOWED_IPS) {
  allowedIps = allowedIps.split(",");
} else { // Si no se especifican, no se realizará ningún filtrado
  allowedIps = ["0.0.0.0"];
}

const ipCheckMiddleware = (req, res, next) => {
  let requestIp = req.ip;
  
  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (requestIp.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    requestIp = requestIp.toString().slice(7);
  }
  console.log(allowedIps)
  if (!allowedIps.includes("0.0.0.0") && !allowedIps.includes(requestIp)) {
    // Envía una respuesta de acceso denegado si la dirección IP no coincide con ninguna de las permitidas
    return res.status(403).send("Acceso denegado"); 
  }
  
  next();
};

export { ipCheckMiddleware };