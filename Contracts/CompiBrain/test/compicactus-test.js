const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CompiBrain", function () {
    let compibrain;
    let compicactus_pfp;

    before(async function () {
        const CompiBrain = await ethers.getContractFactory("CompiBrain");
        compibrain = await upgrades.deployProxy(CompiBrain, []);
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

    it("Prevent add question for tokens owned by others", async function () {
        const addQuestionTx = compibrain.addQuestion(compicactus_pfp.address, 1, "test", "Hi", "Hi there!");

        await expect(addQuestionTx).to.be.revertedWith('CompiBrain: sender must be the owner of the token');
    });

    it("Adding questions", async function () {
        const addQuestionTx = await compibrain.addQuestion(compicactus_pfp.address, 0, "test", "Hi", "Hi there!");

        await addQuestionTx.wait();

        const answer = await compibrain.getAnswer(compicactus_pfp.address, 0, "test", "Hi");

        expect(answer).to.equal("Hi there!");
    });

    it("Getting questions", async function () {

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 0);

        expect(answer[0]).to.equal('Hi');

        const answer2 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer2).to.equal(1);
    });

    it("Getting questions with offset", async function () {

        const addQuestionTx = await compibrain.addQuestion(compicactus_pfp.address, 0, "test", "Bye", "See you later!");

        await addQuestionTx.wait();

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 1);

        expect(answer[0]).to.equal('Bye');

        const answer2 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer2).to.equal(2);
    });

    it("Muting questions", async function () {
        const muteQuestionTx = await compibrain.muteQuestion(compicactus_pfp.address, 0, "test", "Hi");

        await muteQuestionTx.wait();

        const is_muted = await compibrain.isQuestionMuted(compicactus_pfp.address, 0, "test", "Hi");

        expect(is_muted).to.equal(true);
    });

    it("Unmuting questions", async function () {
        const unmuteQuestionTx = await compibrain.unmuteQuestion(compicactus_pfp.address, 0, "test", "Hi");

        await unmuteQuestionTx.wait();

        const is_muted = await compibrain.isQuestionMuted(compicactus_pfp.address, 0, "test", "Hi");

        expect(is_muted).to.equal(false);
    });


    it("Removing questions", async function () {
        const removeQuestionBadTx = compibrain.removeQuestion(compicactus_pfp.address, 0, "test", "No Hi", 0);

        await expect(removeQuestionBadTx).to.be.revertedWith('CompiBrain: questionId is not pointing to the expected question');

        const removeQuestionTx = await compibrain.removeQuestion(compicactus_pfp.address, 0, "test", "Hi", 0);

        await removeQuestionTx.wait();

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 0);

        expect(answer[0]).to.equal('Bye');

        const answer2 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer2).to.equal(1);
    });


    it("Prevent remove question for tokens owned by others", async function () {
        const removeQuestionTx = compibrain.removeQuestion(compicactus_pfp.address, 1, "_", "_", 0);

        await expect(removeQuestionTx).to.be.revertedWith('CompiBrain: sender must be the owner of the token');
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
