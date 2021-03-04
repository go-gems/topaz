FROM node:lts as frontBuild

ADD . /app
WORKDIR /app
RUN yarn && yarn build


FROM golang:1.16 as backBuild
ADD . /app
WORKDIR /app
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o topaz .
RUN ls

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=backBuild /app/topaz /root/topaz
COPY --from=backBuild /app/templates /root/templates
COPY --from=frontBuild /app/public /root/public
EXPOSE 3000
CMD ["./topaz"]