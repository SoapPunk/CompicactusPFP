const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const CompicactusPFP = await ethers.getContractFactory("CompicactusPFP");
    const compicactusPFP = await upgrades.deployProxy(CompicactusPFP, ["CompicactusPFP", "CPFP", "ipfs://baseUri"]);
    await compicactusPFP.deployed();

    /*
    expect(await compicactusPFP.greet()).to.equal("Hello, world!");

    const setGreetingTx = await compicactusPFP.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await compicactusPFP.greet()).to.equal("Hola, mundo!");
    */
  });
});
