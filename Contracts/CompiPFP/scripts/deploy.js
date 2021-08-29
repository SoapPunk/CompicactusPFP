const {ethers, upgrades} = require("hardhat");

async function main() {
    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    const PAUSER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE"));
    const accounts = await ethers.getSigners();

    const CompiPFP = await ethers.getContractFactory("CompicactusPFP");
    const compiPFP = await upgrades.deployProxy(CompiPFP, ["CompicactusPFP", "CPFP", "ipfs://baseUri"]);
    await compiPFP.deployed();
    console.log("CompicactusPFP deployed to:", compiPFP.address);

    console.log("Sleeping");
    sleep(2000);

    const trueAdmin = '0xCF10CD8B5Dc2323B1eb6de6164647756BAd4dE4d';
    const fakeAdmin = accounts[0].address;

    const grantMinterRoleTx = await compiPFP.grantRole(MINTER_ROLE, trueAdmin);
    await grantMinterRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    const revokeMinterRoleTx = await compiPFP.revokeRole(MINTER_ROLE, fakeAdmin);
    await revokeMinterRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    const grantPauserRoleTx = await compiPFP.grantRole(PAUSER_ROLE, trueAdmin);
    await grantPauserRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    const revokePauserRoleTx = await compiPFP.revokeRole(PAUSER_ROLE, fakeAdmin);
    await revokePauserRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    const grantAdminRoleTx = await compiPFP.grantRole(ADMIN_ROLE, trueAdmin);
    await grantAdminRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    const revokeAdminRoleTx = await compiPFP.revokeRole(ADMIN_ROLE, fakeAdmin);
    await revokeAdminRoleTx.wait();

    console.log("Sleeping");
    sleep(2000);

    console.log("Transferring ownership of ProxyAdmin...");
    await upgrades.admin.transferProxyAdminOwnership(trueAdmin);
    console.log("Transferred ownership of ProxyAdmin to:", trueAdmin);
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
