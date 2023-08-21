FROM node:18-alpine

ENV PORT=8081
ENV REQUEST_HANDLING_MICROSERVICE_URL=http://localhost:9001

# Crea el directorio de la aplicacion
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 8081

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]