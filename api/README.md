# BlockTrace API

This is a simple API built with **Express.js** and **Hyperledger Fabric Gateway SDK** to retrieve Digital Product Passports (DPPs) from a blockchain network and allow interacts with web applications.

## 📦 Requirements

- Node.js (v18+ recommended)
- Hyperledger Fabric running network (with chaincode `dpps-management-chaincode` installed and committed)
- A valid identity (`User1` or `Admin`) enrolled and available locally
- `.env` file with proper configuration

## 🛠️ Installation

Assuming you've downloaded the entire project and are currently in the `blocktrace` folder, run the following commands from the project root directory.

```bash
cd api
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory and configure the following variables (There is a .env.example that you can update):

```env
CHANNEL_NAME=main
CHAINCODE_NAME=dpps_management_chaincode
MSP_ID=Org1MSP
KEY_DIRECTORY_PATH=../../blockchain/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore
CERT_DIRECTORY_PATH=../../blockchain/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts
TLS_CERT_PATH=../../blockchain/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
PEER_ENDPOINT=localhost:7051
PEER_HOST_ALIAS=peer0.org1.example.com
```

> Make sure paths are correct relative to your API directory.

## ▶️ Running the API

```bash
npm start
```

API will be available at: [http://localhost:3000](http://localhost:3000)


## ⚙️ Endpoints

All responses follow the format:

```json
{
  "success": true | false,
  "data": ... | null,
  "message": "...", // optional
  "error": "...",   // optional
}
```

---

### 📡 `GET /dpp/getAllDPPs`

Returns **all DPPs** registered on the blockchain.

#### ✅ Example:

```bash
curl http://localhost:3000/dpp/getAllDPPs
```

#### 🔁 Response:

```json
{
  "success": true,
  "data": [
    {
      "dpp_id": "uuid-1234",
      "serial_number": "SN-456789",
      "owner_did": "did:example:abcd1234",
      ...
    },
    {
      "dpp_id": "uuid-2345",
      "serial_number": "SN-123897",
      "owner_did": "did:example:abcd1234",
      ...
    }
  ]
}
```

---

### 📡 `GET /dpp/getAllDPPsByOwnerDID?owner_did=<owner_did>`

Returns all DPPs that belong to a specific owner identified by their `owner_did`.

#### ✅ Example:

```bash
curl "http://localhost:3000/dpp/getAllDPPsByOwnerDID?owner_did=did:example:abcd1234"
```

#### 🔁 Response:

```json
{
  "success": true,
  "data": [
    {
      "dpp_id": "uuid-1234",
      "serial_number": "SN-456789",
      "owner_did": "did:example:abcd1234",
      ...
    }
  ]
}
```

---

### 📡 `GET /dpp/readDPP?dpp_id=<dpp_id>`

Returns the **full data for a specific DPP** given its `dpp_id`.

#### ✅ Example:

```bash
curl "http://localhost:3000/dpp/readDPP?dpp_id=uuid-1234"
```

#### 🔁 Response:

```json
{
  "success": true,
  "data": {
    "dpp_id": "uuid-1234",
    "serial_number": "SN-456789",
    "owner_did": "did:example:abcd1234",
    ...
  }
}
```

---

## 🧾 License

This project is licensed under the [Apache 2.0 License](LICENSE).

---

**Author:** Arthur de Lara Machado