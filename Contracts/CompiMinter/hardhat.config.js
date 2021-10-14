require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

const fs = require('fs');
const maticvigil = fs.readFileSync("../.maticvigil").toString().trim();
const mnemonic = fs.readFileSync("../.secret").toString().trim();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
* @type import('hardhat/config').HardhatUserConfig
*/
module.exports = {
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1
            }
        }
    },

    networks: {
        hardhat: {
        },
        mumbai: {
            //url: 'https://rpc-mumbai.maticvigil.com/v1/'+maticvigil,
            url: 'https://matic-mumbai.chainstacklabs.com/',
            chainId: 80001,
            accounts: {
                mnemonic: mnemonic,
            },
            gasPrice: 8000000000
        },
        matic: {
            url: 'https://rpc-mainnet.maticvigil.com/v1/'+maticvigil,
            //url: 'https://matic-mainnet.chainstacklabs.com/',
            chainId: 137,
            accounts: {
                mnemonic: mnemonic,
            },
            gasPrice: 140000000000, //70
            gasMultiplier: 4,
            timeout: 1000000
        }
    }
};
