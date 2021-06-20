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
RUN curl -H "Authorization: Bearer ya29.a0AfH6SMC9bGUgy69nzo15XziJHgFOGPMNRXAS9rXiPT3MAoW5dQ4ObPfKmgt3A9RpbA5n-qzEeF4OUvUEjr71ChdtzlTMJuCMAps_snLj8yc3riVb0auVVq2PjzO5KzmF74_aWLtIL12JvteC3hXajZXINKaC" https://www.googleapis.com/drive/v3/files/1n0yyptaD9qjTrRt1dB6E9Q893LQvC8B1?alt=media -o /usr/local/blender.zip 
RUN unzip /usr/local/blender.zip -d /usr/local
RUN rm /usr/local/blender.zip

# Install packages for the dummy display
RUN chmod +x -R /usr/local/blender/${BLENDER_MAJOR}/python/bin
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/python3.9 -m ensurepip
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/pip3.9 install pyvirtualdisplay
RUN ./usr/local/blender/${BLENDER_MAJOR}/python/bin/pip3.9 install piglet

RUN chmod +x /usr/local/blender/blender

# Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
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

