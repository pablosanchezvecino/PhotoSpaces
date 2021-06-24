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
RUN curl https://www.dropbox.com/s/7ce0lcj1qjmh6pp/blender.zip?dl=1 -o /usr/local/blender.zip -J -L
RUN unzip /usr/local/blender.zip -d /usr/local
RUN rm /usr/local/blender.zip

RUN chmod +x /usr/local/blender/blender

# Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs  

# Setup Backend
WORKDIR /usr/src/app
ENV BLENDER_SCRIPT /usr/src/app/src/logic/blender/renderScript.py
ENV BLENDER_CMD /usr/local/blender/blender

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3030
CMD [ "node", "app.js" ]

