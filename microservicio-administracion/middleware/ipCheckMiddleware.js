import dotenv from "dotenv";

dotenv.config();

let allowedIps = process.env.ALLOWED_IPS.split(",");

const ipCheckMiddleware = (req, res, next) => {
  // console.log(allowedIps)
  // console.log(req.ip)
  // console.log(req.connection.remoteAddress)
  // console.log(req.headers["x-forwarded-for"])

  let requestIp = req.ip;

  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (req.ip.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    requestIp = requestIp.toString().slice(7);
  }

  console.log(requestIp);

  if (!allowedIps.includes(requestIp)) {
    // Envía una respuesta de acceso denegado si la dirección IP no coincide con ninguna de las permitidas
    return res.status(403).send("Acceso denegado"); 
  }

  next();
};

export { ipCheckMiddleware };