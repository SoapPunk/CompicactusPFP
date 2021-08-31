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
        erc721_discount = await upgrades.deployProxy(ERC721_discount, ["ERC721", "ERC721", "https://uri"]);
        await erc721_discount.deployed();

        const ERC1155_discount = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
        erc1155_discount = await upgrades.deployProxy(ERC1155_discount, ["https://uri"]);
        await erc1155_discount.deployed();

        const CompiMinter = await ethers.getContractFactory("CompiMinter");
        compiminter = await upgrades.deployProxy(CompiMinter, ["CompiMinter"]);
        await compiminter.deployed();

        const setDiscountTokensTx = await compiminter.setDiscountTokens([erc721_discount.address, erc1155_discount.address], [false, true]);
        await setDiscountTokensTx.wait();

        const grantRoleTx = await erc721.grantRole(MINTER_ROLE, compiminter.address);
        await grantRoleTx.wait();

        accounts = await hre.ethers.getSigners();
    });

    it("Prevent setting discount tokens with wrong length", async function () {
        const setDiscountTokensTx = compiminter.setDiscountTokens([erc721_discount.address], [false, true]);

        await expect(setDiscountTokensTx).to.be.revertedWith('CompiMinter: array lengths must match');
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

    it("Discount erc721", async function () {
        const mintTx = await erc721_discount.mint(accounts[1].address);

        await mintTx.wait();

        const answer = await compiminter.getPrice(accounts[1].address);

        expect(answer[0]).to.equal(10);
        expect(answer[1]).to.equal(true);
    });

    it("Discount erc1155", async function () {
        const answer1 = await compiminter.getPrice(accounts[2].address);

        expect(answer1[0]).to.equal(20);
        expect(answer1[1]).to.equal(false);

        const mintTx = await erc1155_discount.mint(accounts[2].address, 0, 10, []);

        await mintTx.wait();

        const answer2 = await compiminter.getPrice(accounts[2].address);

        expect(answer2[0]).to.equal(10);
        expect(answer2[1]).to.equal(true);
    });

    it("Set erc20", async function () {
        const setERC20Tx = await compiminter.setERC20(erc20.address);

        await setERC20Tx.wait();
    });

    it("Set erc721", async function () {
        const setERC721Tx = await compiminter.setERC721(erc721.address);

        await setERC721Tx.wait();
    });

    it("Mint failing for lack of funds", async function () {
        const price = await compiminter.getPrice(accounts[1].address);

        // Testing failing for lack of funds
        const mintCompi_nofundsTx = compiminter.connect(accounts[1]).mintCompi(price[0]);

        await expect(mintCompi_nofundsTx).to.be.revertedWith('CompiMinter: Not enough ERC20 tokens.');
    });

    it("Mint failing for lack of approval", async function () {
        const price = await compiminter.getPrice(accounts[1].address);

        // Minting erc20 to buy
        const mintTx = await erc20.mint(accounts[1].address, 1000);

        await mintTx.wait();

        // Testing failing for lack of approval
        const mintCompi_noapprovalTx = compiminter.connect(accounts[1]).mintCompi(price[0]);

        await expect(mintCompi_noapprovalTx).to.be.revertedWith('CompiMinter: Not enough ERC20 token allowance.');

    });

    it("Mint ok", async function () {
        // get price
        const price = await compiminter.getPrice(accounts[1].address);

        // Aprove
        const approveTx = await erc20.connect(accounts[1]).approve(compiminter.address, price[0]);

        await approveTx.wait();

        // Testing failing for lack of approval
        const mintCompi_badpriceTx = compiminter.connect(accounts[1]).mintCompi('1');

        await expect(mintCompi_badpriceTx).to.be.revertedWith('CompiMinter: price exceedes maxPrice');

        // Mint
        const mintCompiTx = await compiminter.connect(accounts[1]).mintCompi(price[0]);

        await mintCompiTx.wait();

        const balance = await erc721.balanceOf(accounts[1].address);

        expect(balance).to.equal(1);
    });

    it("Discount depleted", async function () {

        const answer = await compiminter.getPrice(accounts[1].address);

        expect(answer[0]).to.equal(20);
        expect(answer[1]).to.equal(false);
    });

    it("Withdraw", async function () {
        const withdrawBalanceTx = await compiminter.withdrawBalance();

        await withdrawBalanceTx.wait();

        const balance = await erc20.balanceOf(accounts[0].address);

        expect(balance).to.equal(10);
    });

    it("Window is open", async function () {
        const window_status = await compiminter.isWindowOpen();

        expect(window_status).to.equal(true);
    });

    it("Close window", async function () {
        const setTimeWindowTx = await compiminter.setTimeWindow(2592000000, 25920000000);

        await setTimeWindowTx.wait();

        const window_status2 = await compiminter.isWindowOpen();

        expect(window_status2).to.equal(false);
    });
});
