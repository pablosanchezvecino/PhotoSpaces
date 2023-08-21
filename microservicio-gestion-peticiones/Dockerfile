FROM node:18-alpine

ARG MONGODB_CONNECTION_STRING
ARG EMAIL_USER
ARG EMAIL_PASSWORD

ENV MONGODB_CONNECTION_STRING=${MONGODB_CONNECTION_STRING}
ENV PORT=9001
ENV RENDER_SERVER_PORT=3000
ENV ADMINISTRATION_MICROSERVICE_URL=http://localhost:9000
ENV CORS_ALLOWED_ORIGINS=http://localhost:8081
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV DB_CHECK_PERIOD_MS=60000
ENV CLEANUP_INTERVAL_MS=36000000
ENV EMAIL_SENDING_BACKUP_INTERVAL_MS=60000
ENV RENDERING_SERVER_POLLING_INTERVAL_MS=1000

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install
# RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 9001

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]