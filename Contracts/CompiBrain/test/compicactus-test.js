const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CompiBrain", function () {
    let compibrain;
    let compicactus_pfp;
    let another_pfp;
    let accounts;

    before(async function () {
        const CompiBrain = await ethers.getContractFactory("CompiBrain");
        compibrain = await upgrades.deployProxy(CompiBrain, ["CompiBrain"]);
        await compibrain.deployed();

        const CompicactusPFP = await ethers.getContractFactory("ERC721PresetMinterPauserAutoIdUpgradeable");
        compicactus_pfp = await upgrades.deployProxy(CompicactusPFP, ["ERC721", "ERC721", "https://"]);
        await compicactus_pfp.deployed();

        const OtherPFP = await ethers.getContractFactory("ERC721PresetMinterPauserAutoIdUpgradeable");
        another_pfp = await upgrades.deployProxy(OtherPFP, ["ERC721", "ERC721", "https://"]);
        await another_pfp.deployed();

        accounts = await ethers.getSigners();

        const mintTx = await compicactus_pfp.mint(accounts[0].address);
        await mintTx.wait();

        const mint2Tx = await compicactus_pfp.mint(accounts[1].address);
        await mint2Tx.wait();

        const mint3Tx = await compicactus_pfp.mint(accounts[2].address);
        await mint3Tx.wait();

        const mint4Tx = await another_pfp.mint(accounts[2].address);
        await mint4Tx.wait();

        const mint5Tx = await another_pfp.mint(accounts[3].address);
        await mint5Tx.wait();
    });

    it("Set PFP", async function () {

        await compibrain.setPFP(compicactus_pfp.address);

    });


    it("Prevent add question for tokens owned by others", async function () {
        const addQuestionTx = compibrain.addQuestion(compicactus_pfp.address, 1, "test", "Hi", "Hi there!");

        await expect(addQuestionTx).to.be.revertedWith('CompiBrain: sender must be the owner or operator of the token');
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


    it("Getting scenes", async function () {

        const answer = await compibrain.getScenes(compicactus_pfp.address, 0, 0);

        expect(answer[0]).to.equal('test');

        const answer2 = await compibrain.getScenesCount(compicactus_pfp.address, 0);

        expect(answer2).to.equal(1);
    });


    it("Getting questions with offset", async function () {

        const addQuestionTx = await compibrain.addQuestion(compicactus_pfp.address, 0, "test", "Bye", "See you later!");

        await addQuestionTx.wait();

        const addQuestionTx2 = await compibrain.addQuestion(compicactus_pfp.address, 0, "test", "LOL", "Indeed");

        await addQuestionTx2.wait();

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 1);

        expect(answer[0]).to.equal('Bye');

        const answer2 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer2).to.equal(3);
    });


    it("Flag question", async function () {
        const setFlagTx = await compibrain.setFlag(compicactus_pfp.address, 0, "NSFW");

        await setFlagTx.wait();

        const flags = await compibrain.getFlag(compicactus_pfp.address, 0);

        expect(flags).to.equal("NSFW");
    });


    it("Switching questions", async function () {

        const addQuestionTx = await compibrain.switchQuestions(compicactus_pfp.address, 0, "test", 0, 1);

        await addQuestionTx.wait();

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 0);

        expect(answer[0]).to.equal('Bye');

        expect(answer[1]).to.equal('Hi');

        const answer3 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer3).to.equal(3);
    });


    it("Removing questions", async function () {
        const removeQuestionBadTx = compibrain.removeQuestion(compicactus_pfp.address, 0, "test", "No Bye", 0);

        await expect(removeQuestionBadTx).to.be.revertedWith('CompiBrain: questionId is not pointing to the expected question');

        const removeQuestionTx = await compibrain.removeQuestion(compicactus_pfp.address, 0, "test", "Bye", 0);

        await removeQuestionTx.wait();

        const answer = await compibrain.getQuestions(compicactus_pfp.address, 0, "test", 0);

        expect(answer[0]).to.equal('LOL');

        const answer2 = await compibrain.getQuestionsCount(compicactus_pfp.address, 0, "test");

        expect(answer2).to.equal(2);
    });


    it("Prevent remove question for tokens owned by others", async function () {
        const removeQuestionTx = compibrain.removeQuestion(compicactus_pfp.address, 1, "_", "_", 0);

        await expect(removeQuestionTx).to.be.revertedWith('CompiBrain: sender must be the owner or operator of the token');
    });


    it("Prevent set name for tokens owned by others", async function () {
        const setNameTx = compibrain.setName(compicactus_pfp.address, 1, "Felix");

        await expect(setNameTx).to.be.revertedWith('CompiBrain: sender must be the owner or operator of the token');
    });

    it("Prevent set name if does not own compicactus", async function () {
        const setNameTx = compibrain.connect(accounts[3]).setName(another_pfp.address, 1, "Felix");

        await expect(setNameTx).to.be.revertedWith('CompiBrain: sender must own a Compicactus');
    });

    it("Setting names others", async function () {
        const setNameTx = await compibrain.connect(accounts[2]).setName(another_pfp.address, 0, "Ana");

        await setNameTx.wait();

        const name = await compibrain.getName(another_pfp.address, 0);

        expect(name).to.equal("Ana");
    });

    it("Setting names compicactus", async function () {
        const setNameTx = await compibrain.setName(compicactus_pfp.address, 0, "Felix");

        await setNameTx.wait();

        const name = await compibrain.getName(compicactus_pfp.address, 0);

        expect(name).to.equal("Felix");
    });


    it("Setting initial scene", async function () {
        const setInitialSceneTx = await compibrain.setInitialScene(compicactus_pfp.address, 0, "test");

        await setInitialSceneTx.wait();

        const name = await compibrain.getInitialScene(compicactus_pfp.address, 0);

        expect(name).to.equal("test");
    });


    it("Setting operator", async function () {
        const setOperatorTx = await compibrain.setOperator(compicactus_pfp.address, 0, accounts[2].address);

        await setOperatorTx.wait();

        const address = await compibrain.getOperator(compicactus_pfp.address, 0);

        expect(address).to.equal(accounts[2].address);
    });


    it("Operator can't set operator", async function () {
        const setOperatorTx = compibrain.connect(accounts[2]).setOperator(compicactus_pfp.address, 0, accounts[2].address);

        await expect(setOperatorTx).to.be.revertedWith('CompiBrain: sender must be the owner of the token');
    });


    it("Allow if operator", async function () {
        const setInitialSceneTx = await compibrain.connect(accounts[2]).setInitialScene(compicactus_pfp.address, 0, "test2");

        await setInitialSceneTx.wait();

        const name = await compibrain.getInitialScene(compicactus_pfp.address, 0);

        expect(name).to.equal("test2");
    });


    it("Prevent adding questions in batch with wrong length", async function () {
        const addQuestionBatchTx = compibrain.addQuestionBatch(compicactus_pfp.address, 0, "test", ["1", "2"], ["1!"]);

        await expect(addQuestionBatchTx).to.be.revertedWith('CompiBrain: array lengths must match');
    });


    it("Adding questions in batch", async function () {
        const addQuestionBatchTx = await compibrain.addQuestionBatch(compicactus_pfp.address, 0, "test", ["1", "2"], ["1!", "2!"]);

        await addQuestionBatchTx.wait();

        const answer = await compibrain.getAnswer(compicactus_pfp.address, 0, "test", "2");

        expect(answer).to.equal("2!");
    });
});
