// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers, upgrades} = require("hardhat");

async function aux() {
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
    console.log("CompiMinter deployed to:", compiminter.address);

 }

module.exports = {aux}
