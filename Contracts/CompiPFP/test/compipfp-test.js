const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Greeter", function () {
    let compicactusPFP;
    let accounts;

    it("Should return the new greeting once it's changed", async function () {
        const CompicactusPFP = await ethers.getContractFactory("CompicactusPFP");
        compicactusPFP = await upgrades.deployProxy(CompicactusPFP, ["CompicactusPFP", "CPFP", "ipfs://baseUri"]);
        await compicactusPFP.deployed();

        accounts = await hre.ethers.getSigners();
    });

    it("Should return the contractURI", async function () {

        const setContractURITx = await compicactusPFP.setContractURI("ipfs://contract.json");

        await setContractURITx.wait();

        expect(await compicactusPFP.contractURI()).to.equal("ipfs://contract.json");

    });

    it("Mints", async function () {
        const setMintTx = await compicactusPFP.mint(accounts[0].address);

        await setMintTx.wait();

        const setMint2Tx = await compicactusPFP.mint(accounts[1].address);

        await setMint2Tx.wait();
    });

    it("Should return the baseTokenURI", async function () {

        const setBaseTokenURITx = await compicactusPFP.setBaseTokenURI("ipfs://baseUri2/");

        await setBaseTokenURITx.wait();

        expect(await compicactusPFP.tokenURI(0)).to.equal("ipfs://baseUri2/0");

    });

    it("Prevents mint for non minters", async function () {

        const setMintTx = compicactusPFP.connect(accounts[1]).mint(accounts[1].address);

        await expect(setMintTx).to.be.revertedWith('CompicactusPFP: must have minter role to mint');
    });
});
