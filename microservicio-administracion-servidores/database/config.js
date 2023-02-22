const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        mongoose.set('strictQuery', true);
        
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

        console.log("Conexión establecida con la base de datos");

    } catch (error) {
        console.log(error);
        throw new Error("No se pudo establecer la conexión con la base de datos");
    }
}

module.exports = {
    dbConnection
}