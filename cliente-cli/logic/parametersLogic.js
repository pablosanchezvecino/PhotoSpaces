import readline from "readline";

const validParameters = (parameters) => {
  // lens
  if (
    !parameters.lens || 
    typeof parameters.lens !== "number" ||
    parameters.lens < 0
  ) {
    console.error("Parámetro \"lens\" no válido".red);
    return false;
  }

  // clip_start
  if (
    !parameters.clip_start || 
    typeof parameters.clip_start !== "number" ||
    parameters.clip_start < 0
  ) {
    console.error("Parámetro \"clip_start\" no válido".red);
    return false;
  }

  // clip_end
  if (
    !parameters.clip_end || 
    typeof parameters.clip_end !== "number" ||
    parameters.clip_end < parameters.clip_start
  ) {
    console.error("Parámetro \"clip_end\" no válido".red);
    return false;
  }

  // location
  if (
    !parameters.location || 
    typeof parameters.location.x !== "number" || 
    typeof parameters.location.y !== "number" || 
    typeof parameters.location.z !== "number"
  ) {
    console.error("Parámetro \"location\" no válido".red);
    return false;
  }

  // qua
  if (
    !parameters.qua || 
    typeof parameters.qua._x !== "number" || 
    typeof parameters.qua._y !== "number" || 
    typeof parameters.qua._z !== "number" || 
    typeof parameters.qua._w !== "number"
  ) {
    console.error("Parámetro \"qua\" no válido".red);
    return false;
  }

  // engine
  const possibleEngines = ["CYCLES", "BLENDER_EEVEE"];
  if (!parameters.engine || typeof parameters.engine !== "string" || !possibleEngines.includes(parameters.engine)) {
    console.error("Parámetro \"engine\" no válido".red);
    return false;
  }

  // gtao
  if (typeof parameters.gtao !== "boolean") {
    console.error("Parámetro \"gtao\" no válido".red);
    return false;
  }

  // bloom
  if (typeof parameters.bloom !== "boolean") {
    console.error("Parámetro \"bloom\" no válido".red);
    return false;
  }

  // ssr
  if (typeof parameters.ssr !== "boolean") {
    console.error("Parámetro \"ssr\" no válido".red);
    return false;
  }

  return true;
};

async function getParameters() {
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  let parameters = null;
  let valid = false;
  
  while (!valid) {

    try {

      parameters = await new Promise((resolve, reject) => {
        rl.question("\nIntroduzca los parámetros a utilizar en el renderizado en formato JSON:\n".bold.magenta,
          (input) => {
            try {
              parameters = JSON.parse(input);
              console.log("Parametros leídos:".bold.magenta, parameters);
              valid = validParameters(parameters);
              if (valid) {
                resolve(parameters);
              } else {
                reject();
              }
            } catch (error) {
              console.error("Entrada no válida debido a que esta no se encuentra en formato JSON.".red);
              reject();
            }
          }
        );
      });
      
    } catch (error) {
      valid = false;
    }

  }

  rl.close();
  return parameters;
}

export { getParameters };