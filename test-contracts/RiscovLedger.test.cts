import { expect } from "chai";
import { ethers } from "hardhat";

describe("RiscovLedger", function () {
  it("only lets the watcher submit ratings", async function () {
    const [, watcher, stranger] = await ethers.getSigners();

    const Ledger = await ethers.getContractFactory("RiscovLedger");
    const ledger = await Ledger.deploy(watcher.address);
    await ledger.waitForDeployment();

    const assetId = ethers.id("FROG");
    const reasonHash = ethers.id("thin liquidity, but normal for a 3-day-old token");

    await expect(
      ledger.connect(stranger).submitRating(assetId, 1, reasonHash)
    ).to.be.revertedWithCustomError(ledger, "NotWatcher");
  });

  it("reverts reading a rating that was never submitted", async function () {
    const [, watcher] = await ethers.getSigners();
    const Ledger = await ethers.getContractFactory("RiscovLedger");
    const ledger = await Ledger.deploy(watcher.address);
    await ledger.waitForDeployment();

    await expect(ledger.getRating(ethers.id("NOPE"))).to.be.revertedWithCustomError(
      ledger,
      "UnknownAsset"
    );
  });

  it("stores a submitted rating, emits an event, and reads it back correctly", async function () {
    const [, watcher] = await ethers.getSigners();
    const Ledger = await ethers.getContractFactory("RiscovLedger");
    const ledger = await Ledger.deploy(watcher.address);
    await ledger.waitForDeployment();

    const assetId = ethers.id("FROG");
    const reasonHash = ethers.id("80% liquidity withdrawal in under a day");

    await expect(ledger.connect(watcher).submitRating(assetId, 2, reasonHash))
      .to.emit(ledger, "RatingUpdated")
      .withArgs(assetId, 2, reasonHash, (ts: bigint) => ts > 0n);

    const [rating, timestamp, storedHash] = await ledger.getRating(assetId);
    expect(rating).to.equal(2); // Red
    expect(storedHash).to.equal(reasonHash);
    expect(timestamp).to.be.greaterThan(0);
    expect(await ledger.hasRating(assetId)).to.equal(true);
  });

  it("overwrites the previous rating and re-emits on a rating change", async function () {
    const [, watcher] = await ethers.getSigners();
    const Ledger = await ethers.getContractFactory("RiscovLedger");
    const ledger = await Ledger.deploy(watcher.address);
    await ledger.waitForDeployment();

    const assetId = ethers.id("FROG");
    await ledger.connect(watcher).submitRating(assetId, 1, ethers.id("yellow reasoning"));
    await ledger.connect(watcher).submitRating(assetId, 2, ethers.id("red reasoning"));

    const [rating] = await ledger.getRating(assetId);
    expect(rating).to.equal(2);
  });
});
