import nodemailer from "nodemailer";

const sendMail = async (filename, recipientMailAddress) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "photospacesapp@gmail.com",
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "PhotoSpaces <photospacesapp@gmail.com>",
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

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject();
      } else {
        console.log("Correo electrónico enviado: " + info.response);
        resolve();
      }
    });
  });
};

export { sendMail };
