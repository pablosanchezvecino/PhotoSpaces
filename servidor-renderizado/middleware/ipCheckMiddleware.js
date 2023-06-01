import dotenv from "dotenv";

dotenv.config();

let allowedIps = process.env.ALLOWED_IPS.split(",");

const ipCheckMiddleware = (req, res, next) => {

  if (!allowedIps.some(allowedIp => req.ip.includes(allowedIp))) {
    // Envía una respuesta de acceso denegado si la IP no coincide con ninguna de las permitidas
    return res.status(403).send("Acceso denegado"); 
  }

  next();
};

export { ipCheckMiddleware };
