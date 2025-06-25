# BlockTrace — Digital Product Passport Ecosystem

This repository contains **BlockTrace**, a complete ecosystem developed for the **ProTalent Challenge**, aiming to provide a digital solution for product traceability within the European Union, in compliance with the upcoming **Digital Product Passport (DPP)** requirements under the **ESPR (Ecodesign for Sustainable Products Regulation)**.

## 🎯 Project Purpose

Traceability of industrial products, such as electric motors, is essential to ensure:
- Compliance with new EU sustainability regulations (starting in 2026).
- Transparency throughout the product lifecycle.
- Controlled updates by trusted entities.
- Public access to key data through QR Codes.

**BlockTrace** proposes a secure, auditable, and modular system based on a **permissioned blockchain** (Hyperledger Fabric), integrating lifecycle data in a reliable and accessible way.

## 🧩 Project Structure

The repository is organized into three main directories that together form the core of the DPP ecosystem:

```
blocktrace/
├── api/          → Node.js API for blockchain interaction
├── blockchain/   → Hyperledger Fabric network + chaincodes
├── web-app/      → Public-facing web application for DPP access
└── README.md     → This file
```

Each folder contains its **own README** with specific setup and execution instructions.

## 👨‍💻 Author

This project was designed and developed by **Arthur de Lara Machado** as part of the ProTalent Challenge.  
All implementations — unless otherwise stated — were written from scratch.  
Files or scripts derived from official Hyperledger Fabric samples retain their original author headers and attributions.

## 🚫 Copyright Notice

All rights reserved.  
This project and its contents are the exclusive intellectual property of the author.  
Reproduction, distribution, or any form of usage without explicit permission is strictly prohibited.

---

**Note:** This project is under active development and serves as a functional foundation for implementing blockchain-based Digital Product Passports for industrial products.

