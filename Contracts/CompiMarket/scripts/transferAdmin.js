const {ethers} = require("hardhat");

async function main() {
    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

    const MyTokenContract = await ethers.getContractFactory("CompiBrain");
    const contract = MyTokenContract.attach('0x435dB939495A20f73F8d8fEF9Cf6BdcFcB11f4CE');

    const grantRoleTx = await contract.grantRole(ADMIN_ROLE, '0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d');
    await grantRoleTx.wait();

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
