// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const CompiMinter = await ethers.getContractFactory("CompiMinter");
  const compiminter = await upgrades.upgradeProxy("0xd5140d7b09B5DFB0C17e9bAb6EC8a7875B19367C", CompiMinter);
  console.log("CompiMinter upgraded");
}

main();
