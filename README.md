
# BlockTrace – Hyperledger Fabric for Digital Product Passports

BlockTrace is a Hyperledger Fabric-based solution for managing **Digital Product Passports (DPPs)** in a secure and transparent blockchain environment.

---

## 📦 Requirements

Before getting started, make sure the following dependencies are installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [`jq`](https://stedolan.github.io/jq/)

---

## ⚙️ Installation

To install only the **necessary components** (Docker images and binaries) from Fabric, navigate to the blockchain folder and run the following script located in `/scripts`:

```bash
./install-fabric.sh docker binary
# or shorthand
./install-fabric.sh d b
```

---

## 🚀 Running the Network

> All commands below are to be executed inside the `/scripts` folder. Preferably run them with `sudo`.

### ✅ Starting the Network

```bash
sudo ./networkUp.sh
```

**Optional flags:**

- `--restart` → First stops any running network by calling `./networkDown.sh` internally, then starts from a clean state.

```bash
sudo ./networkUp.sh --restart
```

---

### ⛔ Stopping the Network

```bash
sudo ./networkDown.sh
```

---

### 🧼 Cleaning Docker Environment (Optional)

If you encounter persistent issues or want to completely clean Docker (⚠️ this removes **all** containers, images, volumes):

```bash
sudo docker system prune -a --volumes
```

---

## 📡 Deploying Chaincode (CCaaS)

To deploy the DPPs management chaincode (located in `../chaincodes/dpps`) using the main channel:

```bash
sudo ./deployCCAAS.sh -c main -ccn dpps-management-chaincode -ccp ../chaincodes/dpps
```

---

## 🧪 Usage Example

Here’s a suggested step-by-step flow to bring up the project:

1. Install required Fabric components:
   ```bash
   ./install-fabric.sh docker binary
   ```

2. Restart the network cleanly:
   ```bash
   sudo ./networkUp.sh --restart
   ```

   > If `--restart` was used, you do **not** need to run the next step.

3. (Optional if not restarted) Start the network:
   ```bash
   sudo ./networkUp.sh
   ```

4. Deploy the chaincode:
   ```bash
   sudo ./deployCCAAS.sh -c main -ccn dpps-management-chaincode -ccp ../chaincodes/dpps
   ```

---

## 🧠 Network Configuration

- **Channel name**: `main`
- **Organizations**: `org1`, `org2`
- **Peers**: `peer0` for each org
- **Ordering service**: 1 orderer node using **RAFT** consensus protocol
- **Database**: CouchDB (for world state)

### CouchDB Credentials:

```
Username: admin
Password: admin
```

---

## 🧩 Concept Notes

- **Anchor Peers**: Special peers that enable communication across organizations.
- **CCaaS**: Chaincode is deployed as an external service rather than packaged into the peer container.
- **RAFT**: Crash fault-tolerant consensus protocol used in Fabric for ordering blocks.

---

## 🛠️ Troubleshooting & Common Errors

### ❌ MSP Certificate Not Found

If you see an error like:

```
Cannot run peer because error when setting up MSP... KeyMaterial not found
```

This usually happens when:

- 🔍 **Wrong path**: Check and correct the `CORE_PEER_MSPCONFIGPATH` environment variable.
- 🔐 **Lack of permissions**: Fix using:

```bash
sudo chmod 644 organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk
```

#### 🔑 File Permission Explanation (`chmod 644`):

| Who       | Permission | Meaning       |
|-----------|------------|---------------|
| Owner     | `6`        | Read + Write  |
| Group     | `4`        | Read-only     |
| Others    | `4`        | Read-only     |

No execution permission is granted (which is correct for private keys).

---
## 📜 Copyright and Authorship

This project was created and adapted by **Arthur de Lara Machado**.

Several functions and files in this repository are modified versions or direct copies of scripts originally found in the [Hyperledger Fabric Samples](https://github.com/hyperledger/fabric-samples) repository. Wherever applicable, the original headers and attributions have been maintained to indicate the source and authorship.

If a file was significantly changed or extended, the original license and reference are preserved in the header, along with any new authorship information.

