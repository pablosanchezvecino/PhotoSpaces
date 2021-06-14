FROM ubuntu:bionic

RUN apt-get update && \
	apt-get install -y \
	curl \
	libxi6 \
	libxrender1 \
	xvfb \
	xz-utils && \
	apt-get -y autoremove && \
	rm -rf /var/lib/apt/lists/*

# Install Blender
ENV BLENDER_MAJOR 3.0

RUN apt-get update
RUN apt-get install unzip -y
ADD https://download936.mediafire.com/433vse65l0mg/n03p2hvnavt5xjt/blender.zip /usr/local
RUN unzip /usr/local/blender.zip -d /usr/local
RUN rm /usr/local/blender.zip

# Install packages for the dummy display
RUN chmod +x -R /usr/local/blender/${BLENDER_MAJOR}/python/bin
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/python3.9 -m ensurepip
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/pip3.9 install pyvirtualdisplay
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/pip3.9 install piglet

# Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs  

# Setup Backend
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3030
CMD [ "node", "app.js" ]

