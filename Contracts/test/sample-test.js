const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CompiBrain", function () {
  it("Should return the new greeting once it's changed", async function () {
    //const Greeter = await ethers.getContractFactory("Greeter");
    //const greeter = await Greeter.deploy("Hello, world!");
    //await greeter.deployed();
    const CompiBrain = await ethers.getContractFactory("CompiBrain");
    const compibrain = await upgrades.deployProxy(CompiBrain, ["Hello, world!"]);
    await compibrain.deployed();

    expect(await compibrain.greet()).to.equal("Hello, world!");

    const setGreetingTx = await compibrain.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await compibrain.greet()).to.equal("Hola, mundo!");
  });
});
