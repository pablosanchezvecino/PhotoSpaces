FROM node:16-alpine

# Crea el directorio de la aplicacion
WORKDIR /usr/src/app
ENV BLENDER_MAJOR 3.0

# Instala las dependencias de la aplicacion que estan en el archivo
COPY package*.json ./
RUN npm install

# Copia toda la informacion al contenedor
COPY . .

# Abre el puerto 8080
EXPOSE 8080

# Ejecuta el comando al inicio
CMD [ "node", "app.js" ]