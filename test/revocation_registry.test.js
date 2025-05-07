const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("RevocationRegistry", (accounts) => {
  const owner = accounts[0];
  const trustedCA = accounts[1];
  const untrustedCA = accounts[2];

  let registry;

  beforeEach(async () => {
    registry = await RevocationRegistry.new({ from: owner });
  });

  it("should allow owner to add a trusted CA", async () => {
    await registry.addTrustedCA(trustedCA, { from: owner });
    const isTrusted = await registry.trustedCAs(trustedCA);
    assert.isTrue(isTrusted, "Trusted CA was not added properly");
  });

  it("should not allow non-owner to add a trusted CA", async () => {
    try {
      await registry.addTrustedCA(untrustedCA, { from: untrustedCA });
      assert.fail("Non-owner should not be able to add CA");
    } catch (error) {
      assert.include(error.message, "Only contract owner", "Incorrect error message");
    }
  });

  it("should allow trusted CA to revoke a certificate", async () => {
    const serial = web3.utils.keccak256("123456");
    const issuer = "TrustedCA-1";
    const timestamp = Math.floor(Date.now() / 1000);

    await registry.addTrustedCA(trustedCA, { from: owner });
    await registry.revokeCertificate(serial, issuer, timestamp, { from: trustedCA });

    const revoked = await registry.isRevoked(serial);
    assert.isTrue(revoked, "Certificate should be marked as revoked");

    const details = await registry.getRevocationDetails(serial);
    assert.equal(details.issuerId, issuer, "Issuer ID mismatch");
    assert.equal(details.timestamp.toString(), timestamp.toString(), "Timestamp mismatch");
  });

  it("should not allow untrusted CA to revoke a certificate", async () => {
    const serial = web3.utils.keccak256("999999");

    try {
      await registry.revokeCertificate(serial, "UntrustedCA", Date.now(), { from: untrustedCA });
      assert.fail("Untrusted CA should not be able to revoke certificates");
    } catch (error) {
      assert.include(error.message, "Only trusted CA", "Incorrect error message");
    }
  });

  it("should emit a RevocationEvent on revocation", async () => {
    const serial = web3.utils.keccak256("ABCDEF");
    const issuer = "CA-Test";
    const timestamp = Math.floor(Date.now() / 1000);

    await registry.addTrustedCA(trustedCA, { from: owner });
    const tx = await registry.revokeCertificate(serial, issuer, timestamp, { from: trustedCA });

    assert.equal(tx.logs.length, 1, "Expected one event to be emitted");
    const event = tx.logs[0];
    assert.equal(event.event, "RevocationEvent", "Event name mismatch");
    assert.equal(event.args.serialNumber, serial, "Serial number mismatch in event");
    assert.equal(event.args.issuerId, issuer, "Issuer ID mismatch in event");
  });
});
