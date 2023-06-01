FROM node:18-alpine

# ENV PORT=8081
# ENV REQUEST_HANDLING_MICROSERVICE_IP="127.0.0.1"
# ENV REQUEST_HANDLING_MICROSERVICE_PORT="9001"

# Crea el directorio de la aplicacion
WORKDIR /usr/src/app
ENV BLENDER_MAJOR 3.0

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 8081

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]