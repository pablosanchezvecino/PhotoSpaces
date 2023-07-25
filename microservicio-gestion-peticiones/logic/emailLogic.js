import { emailUser, emailPassword, emailSendingBackupIntervalMs } from "../env.js";
import PendingEmail from "../models/PendingEmail.js";
import { writeFileSync, unlinkSync } from "fs";
import { wait } from "./timeLogic.js";
import nodemailer from "nodemailer";


// Funciones relacionadas con el envío de emails

// Envía email con el archivo indicado a la dirección especificada
const sendMail = async (filename, recipientMailAddress) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword
      },
    });
    
    const mailOptions = {
      from: `PhotoSpaces <${emailUser}>`,
      to: recipientMailAddress,
      subject: "Renderizado finalizado",
      text: "¡Tu escena ha sido renderizada con éxito! Aquí tienes la imagen resultante.",
      attachments: [
        {
          filename: filename,
          path: `./temp/${filename}`,
        },
      ],
    };
    
    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        reject(error);
        
      } else {
        resolve();
      }
    });
  });
};

const setUpEmailSendingBackupInterval = async () =>  {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await wait(emailSendingBackupIntervalMs);
    await performEmailSendingBackup();
  }
};

const performEmailSendingBackup = async () => {
  console.log("Iniciando ronda de reenvíos de emails pendientes...".bold.blue);

  // Obtener la colección entera de emails pendientes en MongoDB
  let pendingEmails = null;
  try {
    pendingEmails = await PendingEmail.find({});
  } catch (error) {
    console.error(`Error al consultar los emails pendientes en la base de datos. ${error}`.red);
    return;
  }

  await Promise.all(pendingEmails.map(async (pendingEmail) => {
    try {
      writeFileSync(`./temp/${pendingEmail._id}.png`, pendingEmail.pngFileContent);
      await sendMail(`${pendingEmail._id}.png`, pendingEmail.email);
      try {
        unlinkSync(`./temp/${pendingEmail._id}.png`);
      } catch (error) {
        console.error(`Error al eliminar el archivo temporal ${pendingEmail._id}.png. ${error}`.red);
      }
      await PendingEmail.findByIdAndRemove(pendingEmail._id);
      console.log(`Email pendiente correspondiente a la petición con id ${pendingEmail._id} enviado exitosamente`.blue);
    } catch (error) {
      console.error(`Error en el envío del email pendiente correspondiente a la petición con id ${pendingEmail._id}. ${error}`.red);
    }
  }));
  
  console.log("Ronda de reenvíos de emails pendientes finalizada".bold.blue);
};




export { sendMail, setUpEmailSendingBackupInterval };
