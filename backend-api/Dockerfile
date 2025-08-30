# Use an official Node.js runtime as the base image
FROM node:22.18.0

# Set working directory
WORKDIR /usr/src/app

# Bundle app source
COPY package*.json .
COPY . .

# Install dependencies
RUN npm i
RUN npm run generate
RUN node ./scripts/build.prod.js

# Expose the port on which the application will run
EXPOSE ${API_SERVER_PORT} 

# Define the command to run the application.
# Use node directly with the compiled JavaScript file
CMD ["npm", "run", "start"]
