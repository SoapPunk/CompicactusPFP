import { Blockchain } from "./contracts"
import * as eth from "eth-connect"

const mint_mint_shape = new GLTFShape("models/mint_mint.gltf")
const mint_price_shape = new GLTFShape("models/mint_price.gltf")
const mint_getpmana_shape = new GLTFShape("models/mint_getpmana.gltf")
const mint_50off_shape = new GLTFShape("models/mint_50off.gltf")
const price_shape = new TextShape()

const blockchain = new Blockchain("mumbai")

export class Mint {
    mint_mint_entity: Entity = new Entity
    mint_price_entity: Entity = new Entity
    mint_getpmana_entity: Entity = new Entity
    mint_50off_entity: Entity = new Entity

    price_entity: Entity = new Entity

    current_price: [string, boolean] = ["0", false]
    with_discount: boolean = false

    constructor(parent: Entity) {
        mint_mint_shape.visible = false
        this.mint_mint_entity.addComponent(mint_mint_shape)
        this.mint_mint_entity.addComponent(new Transform({
            position: new Vector3(0, 0.5, 0)
        }))
        this.mint_mint_entity.setParent(parent)
        engine.addEntity(this.mint_mint_entity)
        this.mint_mint_entity.addComponent(
            new OnPointerDown(()=>{this.mint(this)},
            {
                hoverText: "Mint Compi",
            })
        )

        mint_50off_shape.visible = false
        this.mint_50off_entity.addComponent(mint_50off_shape)
        this.mint_50off_entity.addComponent(new Transform({
            position: new Vector3(0, 0.5, 0)
        }))
        this.mint_50off_entity.setParent(parent)
        engine.addEntity(this.mint_50off_entity)

        mint_price_shape.visible = false
        this.mint_price_entity.addComponent(mint_price_shape)
        this.mint_price_entity.addComponent(new Transform({
            position: new Vector3(0, 0.5, 0)
        }))
        this.mint_price_entity.setParent(parent)
        engine.addEntity(this.mint_price_entity)

        mint_getpmana_shape.visible = false
        this.mint_getpmana_entity.addComponent(mint_getpmana_shape)
        this.mint_getpmana_entity.addComponent(new Transform({
            position: new Vector3(0, 0.5, 0)
        }))
        this.mint_getpmana_entity.setParent(parent)
        engine.addEntity(this.mint_getpmana_entity)
        this.mint_getpmana_entity.addComponent(
            new OnPointerDown(() => {
                openExternalURL("https://account.decentraland.org/")
            },
            {
                hoverText: "Get Polygon Mana",
            })
        )

        price_shape.fontSize = 2
        price_shape.visible = false
        this.price_entity.addComponent(price_shape)
        this.price_entity.addComponent(new Transform({
            position: new Vector3(-.82, 1.76+0.5, 0.01),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.price_entity.setParent(parent)
        engine.addEntity(this.price_entity)
    }

    async mint(self: Mint) {
        log("Minting");

        log("price", self.current_price);

        await blockchain.increaseAllowance(self.current_price[0]).then(tx => {
            log("IncreaseAllowance Ok ", tx)
            blockchain.mintCompi(self.current_price[0]).then(tx => {
                log("Mint Ok ", tx)
            }).catch(e => {
                log("Error on mint", e)
            })
        }).catch(e => {
            log("Error on IncreaseAllowance", e)
        })

    }

    async updatePrice() {
        const isWindowOpen = await blockchain.isWindowOpen()
        if (!isWindowOpen) return

        mint_50off_shape.visible = false

        this.price_entity.getComponent(TextShape).value = "-"

        log("Getting price")
        const price = await blockchain.getPrice()
        this.current_price = price
        log("this.current_price", this.current_price)
        const price_human = eth.fromWei(price[0].toString(), 'ether')
        log("price_human", price_human)

        if (price[1]) {
            mint_50off_shape.visible = true
        }

        const balance = await blockchain.balance()
        const balance_human = eth.fromWei(balance.toString(), 'ether')
        log("balance", balance_human)

        if (balance < price) {
            engine.removeEntity(this.mint_mint_entity)
            log("Not enough balance")
        } else {
            engine.addEntity(this.mint_mint_entity)
            log("Enough balance")
        }

        this.price_entity.getComponent(TextShape).value = price_human.toString()
    }

    deactivate() {
        mint_mint_shape.visible = false
        mint_price_shape.visible = false
        mint_getpmana_shape.visible = false
        mint_50off_shape.visible = false
        price_shape.visible = false
    }

    activate() {
        mint_mint_shape.visible = true
        mint_price_shape.visible = true
        mint_getpmana_shape.visible = true
        mint_50off_shape.visible = true
        price_shape.visible = true
    }
}
