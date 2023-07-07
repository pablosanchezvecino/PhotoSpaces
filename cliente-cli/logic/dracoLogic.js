import readline from "readline";

const getDracoCompressionLevel = async () => {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
      
  let dracoCompressionLevel = null;
  let valid = false;
      
  while (!valid) {
    
    try {
          
      dracoCompressionLevel = await new Promise((resolve, reject) => {
        rl.question(
          `\nSi desea utilizar la compresión con Draco, introduzca el nivel de compresión a aplicar (0-10).
Si no desea aplicar compresión, no introduzca nada y pulse Enter.
`
            .bold.magenta,
          (input) => {
            if (input === "") {
              valid = true;
              resolve(null);
            } else {
              const inputAsNumber = parseInt(input);
              if (!isNaN(inputAsNumber) && inputAsNumber >= 0 && inputAsNumber <= 10) {
                valid = true;
                resolve(inputAsNumber);
              } else {
                console.error("Nivel de compresión con Draco no válido".red);
                reject();
              }
            }
               
          }
        );
      });
          
    } catch (error) {
      valid = false;
    }
    
  }

  rl.close();
  return dracoCompressionLevel;
};

export { getDracoCompressionLevel };