FROM node:lts as frontBuild

ADD . /app
WORKDIR /app
RUN yarn && yarn build


FROM golang:1.16 as backBuild
