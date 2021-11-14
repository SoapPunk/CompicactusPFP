const { ethers } = require("hardhat");

async function main() {
    const accounts = await ethers.getSigners();

    const srting = ""

    let flatSig = await accounts[0].signMessage(srting);

    console.log(flatSig)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
