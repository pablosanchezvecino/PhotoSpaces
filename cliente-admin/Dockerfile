FROM node:18-alpine

ENV PORT=8080
ENV ADMINISTRATION_MICROSERVICE_URL=http://localhost:9000
ENV REFRESH_PERIOD_MS=4000
ENV ALLOWED_IPS=0.0.0.0

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
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]