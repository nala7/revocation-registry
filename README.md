# Blockchain-Based Certificate Revocation System

This project is part of an assignment of the course IFT6056 - Chaîne de blocs et ses applications.

## Overview

The proposed system introduces the smart contract `RevocationRegistry`. This contract maintains a decentralized and tamper-resistant log of certificate revocations. Certificate Authorities (CAs) interact with the smart contract to publish revocation events, and clients query the blockchain to verify certificate status in near real time.

The main components of the architecture are:

- **Revocation Smart Contract**: A public smart contract where CAs submit certificate revocations. Each revocation entry includes the certificate's serial number, issuer's identifier, and the timestamp of revocation.
- **Certificate Authority (CA)**: Responsible for issuing certificates and submitting revocation information to the `RevocationRegistry` smart contract.
- **Client**: When validating a certificate, the client queries the blockchain for the revocation status.
- **Event Emitters**: To optimize retrieval, smart contracts emit events upon revocation submission, enabling clients to subscribe to real-time revocation notifications.

## Revocation Workflow

The revocation workflow is designed as follows:

1. When a certificate needs to be revoked, the issuing CA calls the `revokeCertificate` function in the `RevocationRegistry` smart contract, providing the certificate serial number and relevant metadata.
2. The smart contract records the revocation immutably on-chain and emits a `RevocationEvent`.
3. Clients, during certificate validation, query the smart contract to check if the serial number of the certificate exists in the revocation mapping.
4. If a revocation record is found, the client treats the certificate as invalid; otherwise, the certificate is considered valid with respect to revocation.

## Smart Contract Design

The smart contract contains the following functions:

- `revokeCertificate(bytes32 serialNumber, string issuerId, uint256 timestamp)`: Records a new revocation.
- `isRevoked(bytes32 serialNumber)`: Returns a boolean indicating whether the given certificate has been revoked.
- `getRevocationDetails(bytes32 serialNumber)`: Returns detailed metadata about a revoked certificate.

Access control mechanisms ensure that only authorized CAs can submit revocations. A registry of trusted CAs is maintained within the contract.

## Security and Cost Considerations

- **Integrity**: The blockchain provides tamper-resistance, ensuring that once a certificate is revoked, it cannot be silently restored.
- **Availability**: By decentralizing revocation information, the system avoids single points of failure present in traditional CRL servers.
- **Cost**: Although each transaction incurs a gas fee, revocation events are infrequent relative to certificate issuance.
- **Privacy**: To protect sensitive information, revocation entries only store minimal necessary data.

## Advantages over Traditional CRL Mechanisms

This blockchain-based CRL implementation offers several advantages:

- Elimination of stale revocation lists and synchronization delays.
- Resistance to denial-of-service attacks targeting centralized revocation servers.
- Real-time revocation checking without heavy bandwidth consumption.
- Enhanced transparency and auditability for revocation actions.

This design leverages the immutability, transparency, and availability properties of Ethereum to address limitations of certificate revocation in traditional PKI architectures.
