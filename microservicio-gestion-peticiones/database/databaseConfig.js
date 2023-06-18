import mongoose from "mongoose";

// Conexión con la base de datos MongoDB

const dbConnection = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

    console.log("Conexión establecida con la base de datos".bold.magenta);
  } catch (error) {
    console.error(`Error al intentar conectar con la base de datos: ${error}`.red);
    throw new Error("No se pudo establecer la conexión con la base de datos");
  }
};

export default dbConnection;
