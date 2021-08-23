const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CompiBrain", function () {
    let compibrain;
    let compicactus_pfp;

    before(async function () {
        const CompiBrain = await ethers.getContractFactory("CompiBrain");
        compibrain = await upgrades.deployProxy(CompiBrain, ["Hello, world!"]);
        await compibrain.deployed();

        const CompicactusPFP = await ethers.getContractFactory("CompicactusPFP");
        compicactus_pfp = await upgrades.deployProxy(CompicactusPFP, ["CompicactusPFP", "CPFP", "https://"]);
        await compicactus_pfp.deployed();

        const accounts = await ethers.getSigners();

        const mintTx = await compicactus_pfp.mint(accounts[0].address);
        await mintTx.wait();

        const mint2Tx = await compicactus_pfp.mint(accounts[1].address);
        await mint2Tx.wait();
    });

    it("Prevent add question for disabled contract", async function () {
        const addQuestionTx = compibrain.addQuestion(compicactus_pfp.address, 0, "Hi", "Hi there!");

        await expect(addQuestionTx).to.be.revertedWith('CompiBrain: contract is not enabled');
    });

    it("Enabling contracts", async function () {
        const enableContractTx = await compibrain.enableContract(compicactus_pfp.address);

        await enableContractTx.wait();

        expect(await compibrain.isContractEnabled(compicactus_pfp.address)).to.equal(true);
    });

    it("Prevent add question for tokens owned by others", async function () {
        const addQuestionTx = compibrain.addQuestion(compicactus_pfp.address, 1, "Hi", "Hi there!");

        await expect(addQuestionTx).to.be.revertedWith('CompiBrain: sender must be the owner of the token');
    });

    it("Adding questions", async function () {
        const addQuestionTx = await compibrain.addQuestion(compicactus_pfp.address, 0, "Hi", "Hi there!");

        await addQuestionTx.wait();

        const answer = await compibrain.getQuestion(compicactus_pfp.address, 0, "Hi");

        expect(answer).to.equal("Hi there!");
    });

    it("Muting questions", async function () {
        const muteQuestionTx = await compibrain.muteQuestion(compicactus_pfp.address, 0, "Hi");

        await muteQuestionTx.wait();

        const is_muted = await compibrain.isQuestionMuted(compicactus_pfp.address, 0, "Hi");

        expect(is_muted).to.equal(true);
    });

    it("Unmuting questions", async function () {
        const unmuteQuestionTx = await compibrain.unmuteQuestion(compicactus_pfp.address, 0, "Hi");

        await unmuteQuestionTx.wait();

        const is_muted = await compibrain.isQuestionMuted(compicactus_pfp.address, 0, "Hi");

        expect(is_muted).to.equal(false);
    });

    it("Prevent set name for tokens owned by others", async function () {
        const setNameTx = compibrain.setName(compicactus_pfp.address, 1, "Felix");

        await expect(setNameTx).to.be.revertedWith('CompiBrain: sender must be the owner of the token');
    });

    it("Setting names", async function () {
        const setNameTx = await compibrain.setName(compicactus_pfp.address, 0, "Felix");

        await setNameTx.wait();

        const name = await compibrain.getName(compicactus_pfp.address, 0);

        expect(name).to.equal("Felix");
    });
});
