//import main from 'deploy-main';
//import aux from 'deploy-aux';
const {main} = require("./deploy-main");
const {aux} = require("./deploy-aux");

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

aux()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
