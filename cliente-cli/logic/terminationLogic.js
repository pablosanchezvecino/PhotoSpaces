import readline from "readline";

const getTerminationInput = async () => {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
      
  let terminate = null;
          
  terminate = await new Promise((resolve) => {
    rl.question("\nIntroduzca TERMINAR para finalizar la ejecución del programa o cualquier otra entrada para generar una nueva petición\n".bold.magenta,
      (input) => {
        if (input.trim().toUpperCase() === "TERMINAR") {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
          
  rl.close();
  return terminate;
};

export { getTerminationInput };