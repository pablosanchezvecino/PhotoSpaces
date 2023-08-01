FROM node:18-alpine

ARG MONGODB_CONNECTION_STRING

ENV DOCKER_CONTAINER_EXECUTION=true
ENV MONGODB_CONNECTION_STRING=${MONGODB_CONNECTION_STRING}
ENV PORT=9000
ENV RENDER_SERVER_PORT=3000
ENV REQUEST_HANDLING_MICROSERVICE_URL=http://localhost:9001
ENV ALLOWED_IPS=0.0.0.0

WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install
# RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 9000


# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]