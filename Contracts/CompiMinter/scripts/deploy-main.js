// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers, upgrades} = require("hardhat");

async function main() {
    const accounts = await ethers.getSigners();

    const CompiMinter = await ethers.getContractFactory("CompiMinter");
    const compiminter = await upgrades.deployProxy(CompiMinter, ["CompiMinter"]);
    await compiminter.deployed();
    console.log("CompiMinter deployed to:", compiminter.address);

}

function sleep(milliseconds) {
 var start = new Date().getTime();
 for (var i = 0; i < 1e7; i++) {
  if ((new Date().getTime() - start) > milliseconds) {
   break;
  }
 }
}

module.exports = {main}
