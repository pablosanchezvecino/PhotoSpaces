FROM node:18-alpine

# ENV MONGODB_CONNECTION_STRING=${MONGODB_CONNECTION_STRING}
# ENV PORT=9000
# ENV RENDER_SERVER_PORT=3000
# ENV REQUEST_MANAGEMENT_MICROSERVICE_IP="127.0.0.1"
# ENV REQUEST_MANAGEMENT_MICROSERVICE_PORT=9001
# ENV ALLOWED_IPS="::1,127.0.0.1,192.168.1.36,172.17.0.1"

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 9000

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]