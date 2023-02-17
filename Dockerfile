FROM alpine

# setup environment
RUN apk add --no-cache git
RUN mkdir butterDAWg
WORKDIR ./butterDAWg
COPY . .
RUN apk add npm

# install required node modules
RUN npm i

# install the http-server
RUN npm i http-server -g
EXPOSE 8080
CMD http-server

