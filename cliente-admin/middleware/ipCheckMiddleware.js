import { allowedIps } from "../env.js";

const ipCheckMiddleware = (req, res, next) => {
  let requestIp = req.ip;
  
  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (requestIp.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    requestIp = requestIp.toString().slice(7);
  }
  
  if (!allowedIps.includes("0.0.0.0") && !allowedIps.includes(requestIp)) {
    // Envía una respuesta de acceso denegado si la dirección IP no coincide con ninguna de las permitidas
    return res.status(403).send("Acceso denegado"); 
  }
  
  next();
};

export { ipCheckMiddleware };