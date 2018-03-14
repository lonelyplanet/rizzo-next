FROM node:argon
RUN mkdir -p /code
WORKDIR /code
COPY package.json /code
RUN npm install -g npm -q
RUN npm install -g npm-install-peers
RUN npm-install-peers
RUN npm install -q
COPY . /code
