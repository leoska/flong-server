# Import container with nodejs v14
FROM node:14

# Create app directory
WORKDIR /app

# Bundle app source
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 25565
EXPOSE 25569
CMD [ "npm", "run", "start" ]