# Ubuntu 22.04 LTS Jammy Jellyfish
FROM ubuntu:jammy

ENV DOCKER_CONTAINER_EXECUTION=true
ENV PORT=3000
ENV ALLOWED_IPS=0.0.0.0
ENV SHOW_PYTHON_LOGS=true

# Actualizar sistema
RUN apt-get update 

# Instalar dependencias
RUN	apt-get install -y \
	curl \
	libxi6 \
	libxrender1 \
	xvfb \
	xz-utils \
    unzip \
    python3-pip

# Optimizar tamaño
RUN	apt-get -y autoremove && \
	rm -rf /var/lib/apt/lists/*

# Instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs  

# Instalar Blender
RUN curl https://www.dropbox.com/s/7ce0lcj1qjmh6pp/blender.zip?dl=1 -o /usr/local/blender.zip -J -L
RUN unzip /usr/local/blender.zip -d /usr/local
RUN rm /usr/local/blender.zip

RUN chmod +x /usr/local/blender/blender


WORKDIR /usr/src/app

# Variables de entorno auxiliares para el servidor de renderizado
ENV BLENDER_MAJOR 3.0
ENV RES_PATH /usr/src/app/res/
ENV BLENDER_SCRIPT /usr/src/app/renderScript.py
ENV BLENDER_CMD /usr/local/blender/blender

# Instalar módulos npm
COPY package*.json ./
RUN npm install

# Copiar directorio
COPY . .

# Configuraciones Python
RUN pip3 install pyvirtualdisplay

ENV PATH="/usr/local/lib/python3.10/dist-packages:${PATH}"
ENV PYTHONPATH /usr/local/lib/python3.10/dist-packages

# Exponer puerto 3000
EXPOSE 3000

# Ejecutar programa
CMD [ "npm", "run", "start" ]