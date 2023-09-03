import { allowedIps } from "../env.js";

const ipCheckMiddleware = (req, res, next) => {
  let requestIp = req.ip;
  
  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (requestIp.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    requestIp = requestIp.toString().slice(7);
  }
    
  // Se solicita la carpeta public, solo puppeteer tiene acceso a esta
  if (req.path === "/" && !["127.0.0.1", "::1"].includes(requestIp)) {
    console.error(`Carpeta public solicitada desde dirección IP no permitida (${requestIp})`.red);
    return res.status(403).send("Acceso denegado"); 
  } else if (!allowedIps.includes("0.0.0.0") && !allowedIps.includes(requestIp)) {
    // Envía una respuesta de acceso denegado si la dirección IP no coincide con ninguna de las permitidas
    console.error(`Recibida petición de dirección IP no permitida (${requestIp})`.red);
    return res.status(403).send("Acceso denegado"); 
  }
  
  next();
};

export { ipCheckMiddleware };