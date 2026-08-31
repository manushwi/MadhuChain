FROM golang:1.23-alpine AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -mod=vendor -o /honeychain .

FROM alpine:3.21
COPY --from=build /honeychain /usr/local/bin/honeychain
USER 65532:65532
ENTRYPOINT ["honeychain"]
