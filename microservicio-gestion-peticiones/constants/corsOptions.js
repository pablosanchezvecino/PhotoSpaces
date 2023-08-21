import { corsAllowedOrigins } from "../env.js";

// Configuración para evitar problemas 
// relacionados con CORS en el navegador

// Orígenes permitidos: cliente estándar

// Si se desplegaran más instancias de servidores que sirvan este cliente 
// con las que se contacte directamente desde el navegador, 
// sería necesario incluir en origin la URL correspondiente a cada una.

const corsOptions = {
  origin: corsAllowedOrigins, 
  methods: "GET, POST"
};
  
export default corsOptions;