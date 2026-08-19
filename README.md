# Axis Protocol — Open Standard of Trust Between the Physical and Digital Worlds

**Axis Protocol** is not a blockchain project or a cryptocurrency.  
It is an **open, implementation-agnostic protocol** for cryptographically verifiable physical infrastructure.

We are not building an energy application.  
We are building a **standard** by which physical events (energy production, cargo movement, equipment operation) can be cryptographically proven and verified in any digital system.

**ENRG** is the first reference implementation of Axis Protocol.  
**Solana** is the blockchain on which ENRG is deployed — not the protocol itself.

---

## 🌍 What Does Axis Protocol Do?

The protocol defines how:

- physical events are transformed into cryptographic proofs;
- these proofs are verified without trust in intermediaries;
- verified events become the basis for economic calculations (tokens, smart contracts, DAOs).

**The SRC (Source) token** is the **economic consequence** of successful proof verification in the ENRG implementation. It is not the goal of the protocol. It is merely one possible implementation.

---

## 🧱 Protocol Architecture

The protocol consists of independent layers:

1. **Physical Layer** (devices, sensors, meters)
2. **Network Layer** (oracles, aggregators, verifiers)
3. **Protocol Layer** (verification logic and token issuance)
4. **Economic Layer** (tokenomics, markets, incentives)

Each layer can be implemented independently.  
The protocol defines **behavior**, not a specific implementation.

---

## ⚡ First Reference Implementation: ENRG

**ENRG** is the first implementation of Axis Protocol for the energy sector.

- **Blockchain**: Solana (Agave 3.1.14)
- **Smart Contracts**: Rust / Anchor
- **Hardware**: ESP32 + PZEM-004T, Ed25519, ATECC608
- **Oracle**: Node.js (MVP), plans for Switchboard
- **Application**: Axis-connect (PWA for device management and tokens)

ENRG is a **proof of concept**, demonstrating how Axis Protocol works in the real world.

---

## 💰 SRC Token (Source) — in the ENRG Implementation

- **Ticker**: `SRC`
- **Emission**: asymptotic (difficulty increases with each issuance)
- **Maximum Supply**: 1,000,000,000 SRC
- **Scale**: 1 SRC = 1 MWh of verified energy (at launch)
- **Protocol Fee**: 15% (→ 20% Buyback, 40% Staking, 30% DAO, 10% Emergency)

---

## 📌 Important

**Axis Protocol** is the standard.  
**ENRG** is the first implementation of this standard.

Axis Protocol can be deployed on any blockchain, with any devices, with any oracles.  
ENRG is proof that the standard works.

---

## 🔗 Links

- **Website**: [enrg.network](https://enrg.network)
- **Whitepaper**: [link]
- **Technical Documentation**: [link]
- **ENRG Repository**: [github.com/AntonGrid/ENRG](https://github.com/AntonGrid/ENRG)
- **Axis Protocol Repository**: [github.com/AntonGrid/Axis-protocol](https://github.com/AntonGrid/Axis-protocol)
- **Axis-connect Repository**: [github.com/AntonGrid/Axis-connect](https://github.com/AntonGrid/Axis-connect)
- **Contacts**: anton@enrg.network

---

**© 2026 Anton Grid. All rights reserved.**
