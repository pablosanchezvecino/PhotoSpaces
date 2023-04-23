# Ubuntu 22.04 LTS Jammy Jellyfish
FROM ubuntu:jammy

# Update
RUN apt-get update 

# Install dependencies
RUN	apt-get install -y \
	curl \
	libxi6 \
	libxrender1 \
	xvfb \
	xz-utils \
    unzip \
    python3-pip

# Optimize size
RUN	apt-get -y autoremove && \
	rm -rf /var/lib/apt/lists/*

# NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs  

# Blender
RUN curl https://www.dropbox.com/s/7ce0lcj1qjmh6pp/blender.zip?dl=1 -o /usr/local/blender.zip -J -L
RUN unzip /usr/local/blender.zip -d /usr/local
RUN rm /usr/local/blender.zip

RUN chmod +x /usr/local/blender/blender


# Set up rendering server
WORKDIR /usr/src/app
ENV BLENDER_MAJOR 3.0
ENV RES_PATH /usr/src/app/res/
ENV BLENDER_SCRIPT /usr/src/app/renderScript.py
ENV BLENDER_CMD /usr/local/blender/blender

# Install npm dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

RUN pip3 install pyvirtualdisplay

ENV PATH="/usr/local/lib/python3.10/dist-packages:${PATH}"
ENV PYTHONPATH /usr/local/lib/python3.10/dist-packages
# --no-cache-dir -r requirements.txt

EXPOSE 3000
CMD [ "npm", "run", "dev" ]