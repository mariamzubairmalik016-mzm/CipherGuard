# CipherGuard - Complete Project Report & Submission Guide
### Aptech TechWiz 6 (Theme: Sentinel of Secrets | Category: Ethical Codebreaking)

---

## 📌 Part 1: Official Project Report Content

### 1. Problem Definition
In today's digital landscape, electronic communication is vulnerable to critical security threats:
- **Eavesdropping & Data Interception**: Unauthorized third parties inspecting sensitive data in transit over public networks.
- **Message Tampering & Alteration**: Man-in-the-Middle (MITM) attackers altering message contents mid-transit.
- **Identity Forgery & Spoofing**: Impersonators masquerading as legitimate senders to send malicious or fraud instructions.

**CipherGuard** addresses these threats by demonstrating **Public Key Encryption (PKE)** protocols across three critical scenarios:
1. **Secure Email**: Confidentiality using recipient public keys.
2. **VPN Tunnels**: Hybrid encryption (Asymmetric handshake + Symmetric AES payload transfer).
3. **Digital Signatures**: Authenticity, data integrity, and non-repudiation via SHA-256 hashing and RSA private key signing.

---

### 2. Design Specifications & System Architecture

CipherGuard uses a modular React + TypeScript architecture powered by the W3C Web Crypto API:

```
                  +-----------------------------------+
                  |      CipherGuard User Interface   |
                  +-----------------------------------+
                                    |
      +-----------------------------+-----------------------------+
      |                             |                             |
[ Secure Email ]             [ VPN Handshake ]           [ Digital Signature ]
  • RSA-OAEP 2048              • TLS 1.3 Flow              • SHA-256 Digest
  • Asymmetric Enc/Dec         • AES-256-GCM Tunnel        • RSA-PSS Sign/Verify
  • Math Breakdown             • Packet Inspector          • Tamper Alarm
      |                             |                             |
      +-----------------------------+-----------------------------+
                                    |
                  +-----------------------------------+
                  |      Web Crypto API Engine        |
                  |  (window.crypto.subtle & Vault)   |
                  +-----------------------------------+
```

---

### 3. List of Commands Used & Order of Execution

#### OpenSSL Key Generation, Encryption & Signing Sequence:
```bash
# Order 1: Generate Private Key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Order 2: Extract Public Key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Order 3: Encrypt Email Body
openssl pkeyutl -encrypt -in email_body.txt -out encrypted_email.bin -pubin -inkey public_key.pem -pkeyopt rsa_padding_mode:oaep

# Order 4: Sign Message Hash Digest
openssl dgst -sha256 -sign private_key.pem -out email_signature.bin email_body.txt
```

#### GnuPG Email Encryption Sequence:
```bash
# Order 1: Keypair creation
gpg --full-generate-key

# Order 2: Encrypt message file
gpg --encrypt --recipient bob@cipherguard.io --armor email_body.txt

# Order 3: Decrypt message file
gpg --decrypt email_body.txt.asc
```

---

## 📽️ Part 2: Mandatory Video Recording Checklist (.mp4)

SRS requires a **mandatory `.mp4` video demonstration**. Here is your step-by-step recording script:

### Video Script (Duration: 3 - 5 Minutes)
1. **Introduction (0:00 - 0:30)**:
   - Introduce yourself and state the project name: *CipherGuard - Sentinel of Secrets (TechWiz 6)*.
   - Show the app running live at `http://localhost:5175/`.

2. **Secure Email Module Demo (0:30 - 1:30)**:
   - Select Alice (Sender) and Bob (Recipient).
   - Click **"Encrypt & Send Secure Email"**.
   - Show ciphertext envelope generated and Bob decrypting it with his private key.
   - Click **"Inspect RSA Math Formula"** to show $p, q, n, e, d$ mathematical values.

3. **VPN Handshake & Tunnel Setup (1:30 - 2:30)**:
   - Switch to **"VPN Handshake & Tunnel"** tab.
   - Click **"Start VPN Handshake"**.
   - Walk through the 5 TLS 1.3 handshake steps and show the derived `AES-256-GCM` session key.
   - Click **"Push Packet Through Tunnel"** and inspect captured packets in the Wireshark stream inspector.

4. **Digital Signatures & Tamper Alarm Demo (2:30 - 3:30)**:
   - Switch to **"Digital Signatures"** tab.
   - Click **"Sign Message with Alice's Private Key"**.
   - Click **"Verify Digital Signature"** (Shows green PASSED alert).
   - Toggle **"Simulate Mid-Transit Tampering"** switch.
   - Click Verify again (Shows red **TAMPERING DETECTED** alarm!).

5. **CLI Studio & Audit Logs (3:30 - 4:30)**:
   - Show **CLI Tool Studio** tab (OpenSSL, GnuPG, Wireshark commands).
   - Open **Audit Logs** and click **"Export Report"**.
   - Conclude presentation.

---

## 📊 Part 3: Presentation Slides Blueprint (PowerPoint Outline)

Create a 10-slide PowerPoint (`.pptx`):

- **Slide 1**: Title Slide (*CipherGuard: Sentinel of Secrets - TechWiz 6*)
- **Slide 2**: Problem Statement & Security Threats (Eavesdropping, Tampering, Spoofing)
- **Slide 3**: Proposed Solution & Architecture Overview
- **Slide 4**: Module 1: Secure Email Encryption (PKE Asymmetric Model & RSA Math)
- **Slide 5**: Module 2: VPN Handshake & Encrypted Tunnel (TLS 1.3 & AES-256-GCM)
- **Slide 6**: Module 3: Digital Signatures & Non-Repudiation (SHA-256 & Tamper Detection)
- **Slide 7**: Module 4: CLI Cryptographic Tool Studio (OpenSSL, GnuPG, Wireshark)
- **Slide 8**: Module 5: Comparison & Analysis Matrix (VPN vs Signatures)
- **Slide 9**: Key Vault & System Audit Logging
- **Slide 10**: Conclusion & Q&A

---

## 📦 Part 4: Final ZIP Submission Structure

Prepare a single ZIP file containing:

```
CipherGuard_Submission.zip
├── Source_Code/
│   ├── frontend/             (Complete React codebase)
│   └── README.md
├── Documentation/
│   ├── ReadMe.doc           (Or ReadMe.pdf)
│   └── Project_Report.pdf
├── Presentation/
│   └── CipherGuard_Presentation.pptx
└── Video/
    └── CipherGuard_Demo_Working.mp4 (MANDATORY)
```
