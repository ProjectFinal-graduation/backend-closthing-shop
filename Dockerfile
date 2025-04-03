FROM node:18.16.0-slim

# Create api directory
WORKDIR /usr/src/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./


RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .


EXPOSE 8092
EXPOSE 8093

CMD [ "npm", "run", "start" ]