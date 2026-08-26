# CipherGuard - Sentinel of Secrets
### Aptech TechWiz 6 Global AI-Based Tech Competition
**Category:** Ethical Codebreaking  
**Software Requirements Specification (SRS):** Version 1.0  
**Project Theme:** Sentinel of Secrets  

---

## 🛡️ Project Overview

**CipherGuard** is an interactive, educational cybersecurity simulation and cryptographic analysis platform. It demonstrates the practical applications, mathematical foundations, and security guarantees of **Public Key Encryption (PKE)** in securing digital communications.

The platform simulates three core real-world cybersecurity scenarios:
1. **Secure Email Communication (Asymmetric PKE)**: RSA-2048 message encryption using recipient public keys and private key decryption with step-by-step mathematical breakdown ($p, q, n, e, d$).
2. **VPN Handshake & Secure Tunnel Establishment**: TLS 1.3 / IPsec simulation utilizing PKE during the handshake phase to negotiate a high-speed symmetric session key (`AES-256-GCM`), complete with a live **Wireshark Packet Stream Inspector**.
3. **Digital Signatures & Non-Repudiation**: SHA-256 message hashing, RSA-PSS signature generation, public key verification, and an **Interactive Mid-Transit Tampering Demo** to illustrate Man-in-the-Middle (MITM) attack detection.

Additionally, CipherGuard includes:
- **CLI Tool Studio**: Embedded terminal simulator demonstrating OpenSSL, GnuPG (PGP), and Wireshark (`tshark`) command sequences.
- **Comparison & Analysis Engine**: Side-by-side architectural comparison matrix and an interactive **Security Goal Recommendation Advisor**.
- **Key Vault**: Centralized management for RSA 2048-bit key pairs and PEM certificate inspection.
- **Security Event Audit Log**: Real-time event logging with session report export (TXT/Markdown format).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run Instructions

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5175/` (or port specified in your console).

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📋 SRS Deliverables & Checklist

As per SRS Section 1.9, the final project submission package requires:

- [x] **Working Source Code**: React + TypeScript + Vite + Tailwind CSS v4 + Web Crypto API.
- [x] **Project Documentation**: Included in `PROJECT_REPORT_AND_SUBMISSION_GUIDE.md`.
- [x] **List of Commands**: Detailed OpenSSL, GnuPG, and Wireshark commands list.
- [x] **Assumptions & Scope**: Documented in the submission guide.
- [ ] **Recorded Demo Video (`.mp4`)**: *Mandatory requirement for student recording.*
- [ ] **Presentation Slides (`.pptx` / `.pdf`)**: Presentation outline provided in guide.

---

## 🛠️ Cryptographic Commands List & Execution Order

### 1. OpenSSL Commands
```bash
# Step 1: Generate 2048-bit RSA Private Key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Step 2: Extract Public Key PEM
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Step 3: Encrypt Email Message using RSA-OAEP
openssl pkeyutl -encrypt -in message.txt -out ciphertext.bin -pubin -inkey public_key.pem -pkeyopt rsa_padding_mode:oaep

# Step 4: Sign Message Digest with Private Key (RSA-PSS)
openssl dgst -sha256 -sign private_key.pem -out signature.bin message.txt
```

### 2. GnuPG Commands
```bash
# Step 1: Generate Keypair
gpg --full-generate-key

# Step 2: Encrypt Email Message for Recipient
gpg --encrypt --recipient bob@cipherguard.io --armor message.txt

# Step 3: Decrypt Message with Private Key
gpg --decrypt message.txt.asc
```

### 3. Wireshark Commands
```bash
# Step 1: Filter TLS 1.3 ClientHello Packets
tshark -i eth0 -f "tcp port 443" -Y "tls.handshake.type == 1"

# Step 2: Inspect Server Certificate & Key Exchange in PCAP file
tshark -r vpn_session.pcap -Y "tls.handshake.type == 11" -V
```

---

## 📜 Assumptions Made

1. **Browser Cryptographic Primitives**: Uses native W3C Web Crypto API (`window.crypto.subtle`) for production-grade RSA-OAEP, RSA-PSS, AES-256-GCM, and SHA-256 execution.
2. **Educational Math Engine**: Mathematical values ($p, q, n, e, d$) utilize clean prime factor pairs for readable step-by-step UI visualization.
3. **Simulated Tool Environment**: Command Line Interface Studio provides realistic terminal feedback without requiring external binaries installed on the client machine.

---

## 🎓 Accreditation
Developed for **TechWiz 6** by **Aptech Limited**.  
Theme: *Sentinel of Secrets* | Project: *CipherGuard* | SRS Version: 1.0
