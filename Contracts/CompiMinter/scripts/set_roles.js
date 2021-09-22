// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require("hardhat");

async function main() {
    const accounts = await ethers.getSigners();

    const CompiMinter = await ethers.getContractFactory("CompiMinter")
    const compiminter = await CompiMinter.attach("")
    console.log("CompiMinter deployed to:", compiminter.address);

    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

    const trueAdmin = '0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d';
    const fakeAdmin = accounts[0].address;

    console.log("Granting admin role");
    const grantRoleTx = await compiminter.grantRole(ADMIN_ROLE, trueAdmin);
    await grantRoleTx.wait();
    console.log("Done");

    console.log("Sleeping");
    sleep(1000);

    console.log("Revoke admin role");
    const revokeRoleTx = await compiminter.revokeRole(ADMIN_ROLE, fakeAdmin);
    await revokeRoleTx.wait();
    console.log("Done");
}

function sleep(milliseconds) {
 var start = new Date().getTime();
 for (var i = 0; i < 1e7; i++) {
  if ((new Date().getTime() - start) > milliseconds) {
   break;
  }
 }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
