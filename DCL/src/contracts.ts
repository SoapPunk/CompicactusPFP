//import { getUserAccount } from '@decentraland/EthereumController'
import { getUserPublicKey } from "@decentraland/Identity"
import { getProvider } from "@decentraland/web3-provider";
import {
  //ContractName,
  //getContract,
  sendMetaTransaction,
} from "decentraland-transactions";
import * as eth from "eth-connect";

import abiMANA from './erc20Abi'
import abiMinter from './minterAbi'
import abiPFP from './pfpAbi'
import abiBrain from './brainAbi'

export const contracts = {
    mana: {
        matic: {
            version: '1',
            abi: abiMANA,
            address: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
            name: '(PoS) Decentraland MANA',
            chainId: 137
        },
        mumbai: {
            version: '1',
            abi: abiMANA,
            //address: '0x882Da5967c435eA5cC6b09150d55E8304B838f45',
            address: '0x4dA830330048be6380f102a83d3B94ea318bc598',  // Test contract
            name: 'Decentraland MANA (PoS)',
            chainId: 80001
        }
    },
    minter: {
        matic: {
            version: '1',
            abi: abiMinter,
            address: '',
            name: 'CompiMinter',
            chainId: 137
        },
        mumbai: {
            version: '1',
            abi: abiMinter,
            address: '0x4820E6424989c22eF7f41B67e7439aB9969fe948',
            name: 'CompiMinter',
            chainId: 80001
        }
    },
    pfp: {
        matic: {
            version: '1',
            abi: abiPFP,
            address: '',
            name: 'CompiPFP',
            chainId: 137
        },
        mumbai: {
            version: '1',
            abi: abiPFP,
            address: '0xcF904EeCa0dC1d99E6c4Be05f6C9a733041Ce093',
            name: 'CompiPFP',
            chainId: 80001
        }
    },
    brain: {
        matic: {
            version: '1',
            abi: abiBrain,
            address: '',
            name: 'CompiBrain',
            chainId: 137
        },
        mumbai: {
            version: '1',
            abi: abiBrain,
            address: '0x308aF74242aFb7bC598Ff1ced52De1D3E6cb02d7',
            name: 'CompiBrain',
            chainId: 80001
        }
    }
}

export class Blockchain {
    metaRequestManager: any
    provider: any
    network: string
    minter_contract:any
    pfp_contract:any
    mana_contract:any
    brain_contract:any
    // functionSetGreeting = new eth.SolidityFunction(this.getFunction("setGreeting", abiMinter));

    constructor(network="mumbai") {
        if (network != "mumbai" && network != "matic") {
            throw new Error("Network not found: " + network)
        }
        /*const publicKeyRequest = executeTask(async () => {
          const publicKey = await getUserPublicKey()
          log(publicKey)
          return publicKey
        })*/
        this.network = network
        if (network == "mumbai") {
            //this.provider = new eth.WebSocketProvider("wss://rpc-mainnet.maticvigil.com/ws/v1/")
            this.provider = new eth.HTTPProvider("https://rpc-mumbai.maticvigil.com")
            this.mana_contract = contracts.mana.mumbai
            this.minter_contract = contracts.minter.mumbai
            this.pfp_contract = contracts.pfp.mumbai
            this.brain_contract = contracts.brain.mumbai
        } else {
            this.provider = new eth.HTTPProvider("https://rpc-mainnet.maticvigil.com")
            this.mana_contract = contracts.mana.matic
            this.minter_contract = contracts.minter.matic
            this.pfp_contract = contracts.pfp.matic
            this.brain_contract = contracts.brain.matic
        }
        this.metaRequestManager = new eth.RequestManager(this.provider)
    }

    getFunction(name: string, abi: Array<any>) {
        for (let n=0; n < abi.length; n++) {
            if (abi[n].type == "function" && abi[n].name == name) {
                return abi[n]
            }
        }
        //log(abi)
        throw new Error("Function not found: " + name)
    }

    async prepareMetaTransaction(functionSignature: any, contractConfig: any) {
        const provider = await getProvider();
        const requestManager: any = new eth.RequestManager(provider);

        return sendMetaTransaction(
          requestManager,
          this.metaRequestManager,
          functionSignature.data,
          contractConfig
        )
    }

    async getFactory(contractConfig: any) {
        const requestManager: any = new eth.RequestManager(this.provider);

        const factory = new eth.ContractFactory(requestManager, contractConfig.abi)
        const contract = await factory.at(contractConfig.address)

        return contract
    }

    // Functions

    // Minter
    async getPrice() {
        const publicKeyRequest = await executeTask(async () => {
          const publicKey = await getUserPublicKey()
          return publicKey
        })

        log("publicKeyRequest", publicKeyRequest)

        return this.getFactory(
            this.minter_contract
        ).then(async ( contract ) => {
            return await contract.getPrice(publicKeyRequest)
        })
    }

    async isWindowOpen() {
        return this.getFactory(
            this.minter_contract
        ).then(async ( contract ) => {
            return await contract.isWindowOpen()
        })
    }

    async mintCompi() {
        const functionMintCompi = new eth.SolidityFunction(this.getFunction("mintCompi", abiMinter));
        const functionSignature = functionMintCompi.toPayload([]);
        log(functionSignature)
        return this.prepareMetaTransaction(functionSignature, this.minter_contract).then().catch()
    }

    // Mana
    async balance() {
        const publicKeyRequest = await executeTask(async () => {
          const publicKey = await getUserPublicKey()
          return publicKey
        })

        return this.getFactory(
            this.mana_contract
        ).then(async ( contract ) => {
            return await contract.balanceOf(publicKeyRequest)
        })
    }

    async increaseAllowance(amount:String) {
        const functionApprove = new eth.SolidityFunction(this.getFunction("increaseAllowance", abiMANA));
        const amountValue = eth.toWei(amount, 'ether')
        const functionSignature = functionApprove.toPayload([this.minter_contract.address, String(amountValue)]);
        log(functionSignature)
        return this.prepareMetaTransaction(functionSignature, this.mana_contract).then().catch()
    }

    // PFP
    async balanceOf() {
        const publicKeyRequest = await executeTask(async () => {
          const publicKey = await getUserPublicKey()
          return publicKey
        })

        log("publicKeyRequest", publicKeyRequest)

        return this.getFactory(
            this.pfp_contract
        ).then(async ( contract ) => {
            return await contract.balanceOf(publicKeyRequest)
        })
    }

    async tokenOfOwnerByIndex(tokenId: number) {
        const publicKeyRequest = await executeTask(async () => {
          const publicKey = await getUserPublicKey()
          return publicKey
        })

        log("publicKeyRequest", publicKeyRequest)

        return this.getFactory(
            this.pfp_contract
        ).then(async ( contract ) => {
            return await contract.tokenOfOwnerByIndex(publicKeyRequest, tokenId)
        })
    }

    // Brain
    async getName(tokenId: number) {
        return this.getFactory(
            this.brain_contract
        ).then(async ( contract ) => {
            return await contract.getName(this.pfp_contract.address, tokenId)
        })
    }

    async getQuestionsCount() {

        return this.getFactory(
            this.brain_contract
        ).then(async ( contract ) => {
            return await contract.getQuestionsCount()
        })
    }

    async setName(id:number, name:string) {
        const functionSetName = new eth.SolidityFunction(this.getFunction("setName", abiBrain));
        const functionSignature = functionSetName.toPayload([this.pfp_contract.address, id, name]);
        log(functionSignature)
        return this.prepareMetaTransaction(functionSignature, this.brain_contract).then().catch()
    }

    async addQuestion(id:number, scene:string, question:string, answer:string) {
        const functionSsetQuestion = new eth.SolidityFunction(this.getFunction("addQuestion", abiBrain));
        const functionSignature = functionSsetQuestion.toPayload([this.pfp_contract.address, id, scene, question, answer]);
        log(functionSignature)
        return this.prepareMetaTransaction(functionSignature, this.brain_contract).then().catch()
    }

    async getAnswer(id:number, scene:string, question:string) {

        return this.getFactory(
            this.brain_contract
        ).then(async ( contract ) => {
            return await contract.getAnswer(this.pfp_contract.address, id, scene, question)
        })
    }

    /*
    sendDonation(callback: (tx:any)=>{}, error: (e:any)=>{}) {
        const functionTransfer = new eth.SolidityFunction(this.getFunction("transfer", abiMANA));
        const addedValue = eth.toWei(10, 'ether')
        const functionSignature = functionTransfer.toPayload([
            //fromAddress,
            "0x1a1792286a870d6630a80C924B39E37eD6618082",
            String(addedValue),
        ]);
        const conf = contracts.mana.matic
        log(functionSignature)
        log(conf)
        this.prepareMetaTransaction(functionSignature, conf).then().catch()
    }

    //

    async getMensajes() {
        return this.getFactory(
            contracts.mensajes.matic
        ).then(async ( contract ) => {
            return await contract.getMessages()
        })
    }*/


}
