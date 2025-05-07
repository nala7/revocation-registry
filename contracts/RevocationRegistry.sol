// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RevocationRegistry {
    struct Revocation {
        string issuerId;
        uint256 timestamp;
        bool revoked;
    }

    mapping(bytes32 => Revocation) private revocations;
    mapping(address => bool) public trustedCAs;

    address public owner;

    event RevocationEvent(bytes32 indexed serialNumber, string issuerId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    modifier onlyTrustedCA() {
        require(trustedCAs[msg.sender], "Only trusted CA can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addTrustedCA(address ca) external onlyOwner {
        trustedCAs[ca] = true;
    }

    function removeTrustedCA(address ca) external onlyOwner {
        trustedCAs[ca] = false;
    }

    function revokeCertificate(bytes32 serialNumber, string calldata issuerId, uint256 timestamp) external onlyTrustedCA {
        require(!revocations[serialNumber].revoked, "Certificate already revoked");

        revocations[serialNumber] = Revocation({
            issuerId: issuerId,
            timestamp: timestamp,
            revoked: true
        });

        emit RevocationEvent(serialNumber, issuerId, timestamp);
    }

    function isRevoked(bytes32 serialNumber) external view returns (bool) {
        return revocations[serialNumber].revoked;
    }

    function getRevocationDetails(bytes32 serialNumber) external view returns (string memory issuerId, uint256 timestamp) {
        require(revocations[serialNumber].revoked, "Certificate not revoked");
        Revocation memory r = revocations[serialNumber];
        return (r.issuerId, r.timestamp);
    }
}
