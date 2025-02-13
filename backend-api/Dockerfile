# Use an official Node.js runtime as the base image
FROM node:22.14.0

# Set working directory
WORKDIR /usr/src/app

# Bundle app source
COPY package*.json .
COPY . .

# Install dependencies
RUN npm install
RUN npm run generate
RUN node ./scripts/build.prod.mjs

# Expose the port on which the application will run
EXPOSE ${API_SERVER_PORT} 

# Define the command to run the application.
CMD [ "npm", "run", "start" ]
