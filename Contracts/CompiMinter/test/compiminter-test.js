const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CompiMinter", function () {
    let compiminter;
    let accounts;
    let erc721;
    let erc721_discount;
    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"))

    before(async function () {
        const ERC721 = await ethers.getContractFactory("ERC721PresetMinterPauserAutoIdUpgradeable");
        erc721 = await upgrades.deployProxy(ERC721, ["ERC721", "ERC721", "https://"]);
        await erc721.deployed();

        const ERC20 = await ethers.getContractFactory("ERC20PresetMinterPauserUpgradeable");
        erc20 = await upgrades.deployProxy(ERC20, ["ERC20", "ERC20"]);
        await erc20.deployed();

        const ERC721_discount = await ethers.getContractFactory("ERC721PresetMinterPauserAutoIdUpgradeable");
        erc721_discount = await upgrades.deployProxy(ERC721_discount, ["ERC721", "ERC721", "https://"]);
        await erc721_discount.deployed();

        const CompiMinter = await ethers.getContractFactory("CompiMinter");
        compiminter = await upgrades.deployProxy(CompiMinter, [[erc721_discount.address], [false], "CompiMinter"]);
        await compiminter.deployed();

        const grantRoleTx = await erc721.grantRole(MINTER_ROLE, compiminter.address);
        await grantRoleTx.wait();

        accounts = await hre.ethers.getSigners();
    });

    it("Prevent setting price for non admins", async function () {
        const addQuestionTx = compiminter.connect(accounts[1]).setPrice(10);

        await expect(addQuestionTx).to.be.revertedWith('CompiMinter: must have admin role to set price');
    });

    it("Set price", async function () {
        const addQuestionTx = await compiminter.setPrice(10);

        await addQuestionTx.wait();

        const answer = await compiminter.getPrice(accounts[0].address);

        expect(answer[0]).to.equal(20);
        expect(answer[1]).to.equal(false);
    });

    it("Discount", async function () {
        const mintTx = await erc721_discount.mint(accounts[1].address);

        await mintTx.wait();

        const answer = await compiminter.getPrice(accounts[1].address);

        expect(answer[0]).to.equal(10);
        expect(answer[1]).to.equal(true);
    });

    it("Set erc20", async function () {
        const setERC20Tx = await compiminter.setERC20(erc20.address);

        await setERC20Tx.wait();
    });

    it("Set erc721", async function () {
        const setERC721Tx = await compiminter.setERC721(erc721.address);

        await setERC721Tx.wait();
    });

    it("Mint", async function () {
        // Minting erc20 to buy
        const mintTx = await erc20.mint(accounts[1].address, 1000);

        await mintTx.wait();

        // get price
        const price = await compiminter.getPrice(accounts[1].address);

        // Aprove
        const approveTx = await erc20.connect(accounts[1]).approve(compiminter.address, price[0]);

        await approveTx.wait();

        // Mint
        const mintCompiTx = await compiminter.connect(accounts[1]).mintCompi();

        await mintCompiTx.wait();

        const balance = await erc721.balanceOf(accounts[1].address);

        expect(balance).to.equal(1);
    });
});
