import { expect } from "chai";
import { ethers } from "hardhat";

describe("DemoMarket", function () {
  async function deployFixture() {
    const [, watcher] = await ethers.getSigners();

    const Ledger = await ethers.getContractFactory("RiscovLedger");
    const ledger = await Ledger.deploy(watcher.address);
    await ledger.waitForDeployment();

    const assetId = ethers.id("FROG");

    const Market = await ethers.getContractFactory("DemoMarket");
    const market = await Market.deploy(await ledger.getAddress(), assetId);
    await market.waitForDeployment();

    return { ledger, market, watcher, assetId };
  }

  it("fails safe (paused, 0x leverage) when the asset has never been rated", async function () {
    const { market } = await deployFixture();
    expect(await market.maxLeverage()).to.equal(0);
    expect(await market.isPaused()).to.equal(true);
  });

  it("derives 20x max leverage from a Green rating, live, with no market-side transaction", async function () {
    const { ledger, market, watcher, assetId } = await deployFixture();
    await ledger.connect(watcher).submitRating(assetId, 0, ethers.id("all clear")); // Green

    expect(await market.maxLeverage()).to.equal(20);
    expect(await market.isPaused()).to.equal(false);
  });

  it("derives 5x max leverage from a Yellow rating", async function () {
    const { ledger, market, watcher, assetId } = await deployFixture();
    await ledger.connect(watcher).submitRating(assetId, 1, ethers.id("early-stage risk")); // Yellow

    expect(await market.maxLeverage()).to.equal(5);
    expect(await market.isPaused()).to.equal(false);
  });

  it("pauses the market (0x leverage) on a Red rating, and un-pauses again if the rating improves", async function () {
    const { ledger, market, watcher, assetId } = await deployFixture();

    await ledger.connect(watcher).submitRating(assetId, 2, ethers.id("coordinated liquidity withdrawal")); // Red
    expect(await market.maxLeverage()).to.equal(0);
    expect(await market.isPaused()).to.equal(true);

    // Same market contract, no transaction against it — limits follow the Ledger live.
    await ledger.connect(watcher).submitRating(assetId, 0, ethers.id("resolved")); // Green
    expect(await market.maxLeverage()).to.equal(20);
    expect(await market.isPaused()).to.equal(false);
  });
});
