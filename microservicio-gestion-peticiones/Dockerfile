FROM node:18-alpine

# ENV MONGODB_CONNECTION_STRING=${MONGODB_CONNECTION_STRING}
# ENV PORT=9001
# ENV RENDER_SERVER_PORT=3000
# ENV MAIL_PASSWORD=${MAIL_PASSWORD}
# ENV DB_CHECK_PERIOD_MS=60000

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm ci --only=production

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que la aplicación escucha
EXPOSE 9001

# Comando para ejecutar la aplicación
CMD [ "npm", "run", "start" ]