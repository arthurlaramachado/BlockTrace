FROM golang:1.22-alpine as builder

WORKDIR /app
COPY . .

RUN go mod tidy

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o chaincode

# Runtime stage
FROM alpine:latest

WORKDIR /chaincode
COPY --from=builder /app/chaincode .
COPY --from=builder /app/dpp_mocked.json .

LABEL org.hyperledger.fabric.chaincode.id.name="atcc" \
      org.hyperledger.fabric.chaincode.id.version="1.0" \
      org.hyperledger.fabric.chaincode.type="golang"

ENTRYPOINT ["./chaincode"]