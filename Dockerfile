FROM node:latest 

#RUN mkdir -p /var/www
#WORKDIR /var/www
 
#ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib NODE_ENV=production 

#COPY dist/package.json /var/www
#RUN npm install
 
#COPY dist /var/www
 
#EXPOSE 8080
#CMD [ "npm", "start" ]





RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

EXPOSE 9000

CMD [ "npm", "start" ]