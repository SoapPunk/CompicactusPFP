const { ethers } = require("hardhat");

async function main() {
    const accounts = await ethers.getSigners();

    const tx = {
        from: accounts[0].address,
        to: accounts[0].address,
        value: 0,
        nonce: 146,
    }

    const cancel = await accounts[0].sendTransaction(tx);
    await cancel.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
