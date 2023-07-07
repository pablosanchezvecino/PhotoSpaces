import readline from "readline";

const getEmail = async () => {

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
      
  let email = null;
  let valid = false;
      
  while (!valid) {
    
    try {
          
      email = await new Promise((resolve, reject) => {
        rl.question(
          `\nIndique la dirección de correo electrónico al que enviar la imagen renderizada.
Para recepción síncrona en la carpeta output, no escriba nada y presione la tecla Enter
`
            .bold.magenta,
          (input) => {
            if (input === "") {
              valid = true;
              resolve(null);
            } else {
              if (emailRegex.test(input)) {
                valid = true;
                resolve(input);
              } else {
                console.error("Dirección de correo electrónico no válida".red);
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
  return email;
};

export { getEmail };