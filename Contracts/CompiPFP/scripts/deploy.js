const {ethers, upgrades} = require("hardhat");

async function main() {
    const CompiPFP = await ethers.getContractFactory("CompicactusPFP");
    const compiPFP = await upgrades.deployProxy(CompiPFP, ["CompicactusPFP", "CPFP", "ipfs://baseUri"]);
    await compiPFP.deployed();
    console.log("CompicactusPFP deployed to:", compiPFP.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
