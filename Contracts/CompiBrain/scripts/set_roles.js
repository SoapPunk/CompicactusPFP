// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers, upgrades} = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const CompiBrain = await ethers.getContractFactory("CompiBrain")
  const compibrain = await CompiBrain.attach("0x89e2558091D28290B834ddd42e59E2b72D07Fe0B")

  console.log("CompiBrain deployed to:", compibrain.address);

  const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const accounts = await ethers.getSigners();

  const trueAdmin = '0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d';
  const fakeAdmin = accounts[0].address;

  console.log("Sleeping");
  sleep(2000);

  console.log("Granting admin role");
  const grantRoleTx = await compibrain.grantRole(ADMIN_ROLE, trueAdmin);
  await grantRoleTx.wait();
  console.log("Done");

  console.log("Sleeping");
  sleep(2000);

  console.log("Revoke admin role");
  const revokeRoleTx = await compibrain.revokeRole(ADMIN_ROLE, fakeAdmin);
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

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
