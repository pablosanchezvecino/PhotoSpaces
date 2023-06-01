import dotenv from "dotenv";

dotenv.config();

let allowedIps = process.env.ALLOWED_IPS.split(",");

const ipCheckMiddleware = (req, res, next) => {

  if (!allowedIps.some(allowedIp => req.ip.endsWith(allowedIp))) {
    // Envía una respuesta de acceso denegado si la IP no coincide con ninguna de las permitidas
    console.log(allowedIps)
    console.log(req.ip)
    console.log(req.connection.remoteAddress)
    console.log(req.headers["x-forwarded-for"])
    return res.status(403).send("Acceso denegado"); 
  }

  next();
};

export { ipCheckMiddleware };