FROM golang:1.23-alpine AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -mod=vendor -o /madhuchain .

FROM alpine:3.21
COPY --from=build /madhuchain /usr/local/bin/madhuchain
USER 65532:65532
ENTRYPOINT ["madhuchain"]
