import { Blockchain } from "./contracts"
import * as eth from "eth-connect";

const stool_shape = new GLTFShape("models/stool.gltf")
const mint_shape = new GLTFShape("models/mint.gltf")
const setname_shape = new GLTFShape("models/setName.gltf")
const left = new GLTFShape("models/left.gltf")
const right = new GLTFShape("models/right.gltf")

const blockchain = new Blockchain("mumbai")

export class Stool extends Entity {
    mint_entity: Entity = new Entity
    setname_entity: Entity = new Entity
    price_entity: Entity = new Entity
    left_entity: Entity = new Entity
    right_entity: Entity = new Entity

    current_price: number = -1
    with_discount: boolean = false
    current_compi: number = -1
    current_token: number = -1

    constructor() {
        super()
        this.addComponent(stool_shape)
        this.addComponent(new Transform({
            position: new Vector3(8, 0, 8)
        }))
        engine.addEntity(this)

        mint_shape.visible = false
        this.mint_entity.addComponent(mint_shape)
        this.mint_entity.addComponent(new Transform())
        this.mint_entity.setParent(this)
        engine.addEntity(this.mint_entity)
        this.mint_entity.addComponent(
            new OnPointerDown(this.mint,
            {
                hoverText: "Mint Compi",
            })
        )

        setname_shape.visible = false
        this.setname_entity.addComponent(setname_shape)
        this.setname_entity.addComponent(new Transform())
        this.setname_entity.setParent(this)
        engine.addEntity(this.setname_entity)
        this.setname_entity.addComponent(
            new OnPointerDown(() => {this.setName(this)},
            {
                hoverText: "Set Name",
            })
        )

        const price_shape = new TextShape()
        price_shape.fontSize = 2
        this.price_entity.addComponent(price_shape)
        this.price_entity.addComponent(new Transform({
            position: new Vector3(0, 1.5, 0),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.price_entity.setParent(this)
        engine.addEntity(this.price_entity)

        this.left_entity.addComponent(left)
        this.left_entity.addComponent(new Transform())
        this.left_entity.setParent(this)
        engine.addEntity(this.left_entity)
        this.left_entity.addComponent(
            new OnPointerDown(()=>{this.previous(this)},
            {
                hoverText: "Previous",
            })
        )

        this.right_entity.addComponent(right)
        this.right_entity.addComponent(new Transform())
        this.right_entity.setParent(this)
        engine.addEntity(this.right_entity)
        this.right_entity.addComponent(
            new OnPointerDown(()=>{this.next(this)},
            {
                hoverText: "Next",
            })
        )

        this.updatePrice()
        this.ownsCompi()
    }

    async updatePrice() {
        log("Getting price")
        const price = await blockchain.getPrice()
        const price_human = eth.fromWei(price[0].toString(), 'ether')
        log("price", price_human)

        const balance = await blockchain.balance()
        const balance_human = eth.fromWei(balance.toString(), 'ether')
        log("balance", balance_human)

        if (balance < price) {
            this.mint_entity.getComponent(GLTFShape).visible = false
            log("Not enough balance")
        } else {
            this.mint_entity.getComponent(GLTFShape).visible = true
            log("Enough balance")
        }

        this.price_entity.getComponent(TextShape).value = price_human
    }

    async mint() {
        log("Minting");

        const price = await blockchain.getPrice();

        log("price", price);

        await blockchain.increaseAllowance(price[0]).then(tx => {
            log("IncreaseAllowance Ok ", tx)
            blockchain.mintCompi().then(tx => {
                log("Mint Ok ", tx)
            }).catch(e => {
                log("Error on mint", e)
            })
        }).catch(e => {
            log("Error on IncreaseAllowance", e)
        })

    }

    async setName(self:any) {
        log("Set Name");
        if (self.current_compi < 0) return

        log("this.current_token", self.current_token);

        await blockchain.setName(self.current_token, "Pepe").then(tx => {
            log("setName Ok ", tx)
        }).catch(e => {
            log("Error on setName", e)
        })

    }

    previous(self:any) {
        self.goto(false)
    }

    next(self:any) {
        self.goto(true)
    }

    async goto(next=true) {
        log("Getting compis")

        const compisCount = await blockchain.balanceOf()

        if (compisCount>0) {
            if (next) {
                this.current_compi += 1
            } else {
                this.current_compi -= 1
            }

            if (this.current_compi<0) {
                this.current_compi = compisCount
            } else if (this.current_compi>=compisCount) {
                this.current_compi = 0
            }

            this.updateCompi()
        }

        log(this.current_compi)
    }

    async ownsCompi() {
        const compisCount = await blockchain.balanceOf()

        if (compisCount>0) {
            setname_shape.visible = true

            this.current_compi = 0

            this.updateCompi()
        }


    }

    async updateCompi() {
        const compiId = await blockchain.tokenOfOwnerByIndex(this.current_compi)

        this.current_token = compiId

        const compiName = await blockchain.getName(compiId)

        log("compi: ", compiId, compiName)
    }
}
