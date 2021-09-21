const {upgrades} = require("hardhat");

async function main() {

    const trueAdmin = '0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d';

    console.log("Transferring ownership of ProxyAdmin...");
    await upgrades.admin.transferProxyAdminOwnership(trueAdmin);
    console.log("Transferred ownership of ProxyAdmin to:", trueAdmin);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
