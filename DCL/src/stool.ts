import { Blockchain } from "./contracts"
import * as eth from "eth-connect";

//Menu Shapes
const menu_mint_shape = new GLTFShape("models/menu_mint.gltf")
const menu_chat_shape = new GLTFShape("models/menu_chat.gltf")
const menu_teach_shape = new GLTFShape("models/menu_teach.gltf")
const menu_photo_shape = new GLTFShape("models/menu_photo.gltf")
const menu_sell_shape = new GLTFShape("models/menu_sell.gltf")

const stool_shape = new GLTFShape("models/stool.gltf")

const mint_mint_shape = new GLTFShape("models/mint_mint.gltf")
const mint_price_shape = new GLTFShape("models/mint_price.gltf")
const mint_getpmana_shape = new GLTFShape("models/mint_getpmana.gltf")
const mint_50off_shape = new GLTFShape("models/mint_50off.gltf")
const price_shape = new TextShape()

const sell_cargo_shape = new GLTFShape("models/sell_cargo.gltf")
const sell_opensea_shape = new GLTFShape("models/sell_opensea.gltf")

const setname_shape = new GLTFShape("models/setName.gltf")

const left_shape = new GLTFShape("models/left.gltf")
const right_shape = new GLTFShape("models/right.gltf")
const compidata_shape = new TextShape()

const blockchain = new Blockchain("mumbai")


const canvas = new UICanvas()

const textInput = new UIInputText(canvas)



export class Stool extends Entity {
    // Menu entities
    menu_mint_entity: Entity = new Entity
    menu_chat_entity: Entity = new Entity
    menu_teach_entity: Entity = new Entity
    menu_photo_entity: Entity = new Entity
    menu_sell_entity: Entity = new Entity

    mint_mint_entity: Entity = new Entity
    mint_price_entity: Entity = new Entity
    mint_getpmana_entity: Entity = new Entity
    mint_50off_entity: Entity = new Entity

    sell_cargo_entity: Entity = new Entity
    sell_opensea_entity: Entity = new Entity

    setname_entity: Entity = new Entity
    price_entity: Entity = new Entity

    left_entity: Entity = new Entity
    right_entity: Entity = new Entity
    compidata_entity: Entity = new Entity

    current_price: [string, boolean] = ["0", false]
    with_discount: boolean = false
    current_compi: number = -1
    current_token: number = -1
    current_menu: number = 0

    constructor() {
        super()

        this.addComponent(stool_shape)
        this.addComponent(new Transform({
            position: new Vector3(8, 0, 8)
        }))
        engine.addEntity(this)

        this.setupMint()

        this.setupTeach()

        this.setupSell()

        this.left_entity.addComponent(left_shape)
        this.left_entity.addComponent(new Transform())
        this.left_entity.setParent(this)
        engine.addEntity(this.left_entity)
        this.left_entity.addComponent(
            new OnPointerDown(()=>{this.previous(this)},
            {
                hoverText: "Previous",
            })
        )

        this.right_entity.addComponent(right_shape)
        this.right_entity.addComponent(new Transform())
        this.right_entity.setParent(this)
        engine.addEntity(this.right_entity)
        this.right_entity.addComponent(
            new OnPointerDown(()=>{this.next(this)},
            {
                hoverText: "Next",
            })
        )

        compidata_shape.fontSize = 2
        compidata_shape.value = "-"
        this.compidata_entity.addComponent(compidata_shape)
        this.compidata_entity.addComponent(new Transform({
            position: new Vector3(0, 1.5, 0),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.compidata_entity.setParent(this)
        engine.addEntity(this.compidata_entity)

        textInput.width = "80%"
        textInput.height = "25px"
        textInput.vAlign = "bottom"
        textInput.hAlign = "center"
        textInput.fontSize = 10
        textInput.placeholder = "Write name here"
        textInput.placeholderColor = Color4.Gray()
        textInput.positionY = "200px"
        textInput.isPointerBlocker = true
        textInput.visible = false

        textInput.onTextSubmit = new OnTextSubmit(async (x) => {
            textInput.visible = false
            await blockchain.setName(this.current_token, x.text).then(tx => {
                log("setName Ok ", tx)
            }).catch(e => {
                log("Error on setName", e)
            })
        })


        this.setupMenu()

        this.ownsCompi()
    }

    setupMint() {
        mint_mint_shape.visible = false
        this.mint_mint_entity.addComponent(mint_mint_shape)
        this.mint_mint_entity.addComponent(new Transform())
        this.mint_mint_entity.setParent(this)
        engine.addEntity(this.mint_mint_entity)
        this.mint_mint_entity.addComponent(
            new OnPointerDown(()=>{this.mint(this)},
            {
                hoverText: "Mint Compi",
            })
        )

        mint_50off_shape.visible = false
        this.mint_50off_entity.addComponent(mint_50off_shape)
        this.mint_50off_entity.addComponent(new Transform())
        this.mint_50off_entity.setParent(this)
        engine.addEntity(this.mint_50off_entity)

        mint_price_shape.visible = false
        this.mint_price_entity.addComponent(mint_price_shape)
        this.mint_price_entity.addComponent(new Transform())
        this.mint_price_entity.setParent(this)
        engine.addEntity(this.mint_price_entity)

        mint_getpmana_shape.visible = false
        this.mint_getpmana_entity.addComponent(mint_getpmana_shape)
        this.mint_getpmana_entity.addComponent(new Transform())
        this.mint_getpmana_entity.setParent(this)
        engine.addEntity(this.mint_getpmana_entity)
        this.mint_getpmana_entity.addComponent(
            new OnPointerDown(() => {
                openExternalURL("https://account.decentraland.org/")
            },
            {
                hoverText: "Mint Compi",
            })
        )

        price_shape.fontSize = 2
        price_shape.visible = false
        this.price_entity.addComponent(price_shape)
        this.price_entity.addComponent(new Transform({
            position: new Vector3(-.82, 1.76, 0.01),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.price_entity.setParent(this)
        engine.addEntity(this.price_entity)
    }

    setupTeach() {
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
    }

    setupSell() {

        sell_cargo_shape.visible = false
        this.sell_cargo_entity.addComponent(sell_cargo_shape)
        this.sell_cargo_entity.addComponent(new Transform())
        this.sell_cargo_entity.setParent(this)
        engine.addEntity(this.sell_cargo_entity)
        this.sell_cargo_entity.addComponent(
            new OnPointerDown(() => {
                openExternalURL("https://app.cargo.build")
            },
            {
                hoverText: "Go to Cargo",
            })
        )

    }

    setupMenu() {
        this.menu_mint_entity.addComponent(menu_mint_shape)
        this.menu_mint_entity.addComponent(new Transform())
        this.menu_mint_entity.setParent(this)
        engine.addEntity(this.menu_mint_entity)
        this.menu_mint_entity.addComponent(
            new OnPointerDown(() => {
                this.current_menu = 0
                this.updateMenu()
            },
            {
                hoverText: "Mint new Compi",
            })
        )

        this.menu_chat_entity.addComponent(menu_chat_shape)
        this.menu_chat_entity.addComponent(new Transform())
        this.menu_chat_entity.setParent(this)
        engine.addEntity(this.menu_chat_entity)
        this.menu_chat_entity.addComponent(
            new OnPointerDown(() => {
                this.current_menu = 1
                this.updateMenu()
            },
            {
                hoverText: "Chat with Compi",
            })
        )

        this.menu_teach_entity.addComponent(menu_teach_shape)
        this.menu_teach_entity.addComponent(new Transform())
        this.menu_teach_entity.setParent(this)
        engine.addEntity(this.menu_teach_entity)
        this.menu_teach_entity.addComponent(
            new OnPointerDown(() => {
                this.current_menu = 2
                this.updateMenu()
            },
            {
                hoverText: "Teach your Compi",
            })
        )

        this.menu_photo_entity.addComponent(menu_photo_shape)
        this.menu_photo_entity.addComponent(new Transform())
        this.menu_photo_entity.setParent(this)
        engine.addEntity(this.menu_photo_entity)
        this.menu_photo_entity.addComponent(
            new OnPointerDown(() => {
                this.current_menu = 3
                this.updateMenu()
            },
            {
                hoverText: "Photo mode",
            })
        )

        this.menu_sell_entity.addComponent(menu_sell_shape)
        this.menu_sell_entity.addComponent(new Transform())
        this.menu_sell_entity.setParent(this)
        engine.addEntity(this.menu_sell_entity)
        this.menu_sell_entity.addComponent(
            new OnPointerDown(() => {
                this.current_menu = 4
                this.updateMenu()
            },
            {
                hoverText: "Sell Compi",
            })
        )
    }

    updateMenu(){
        // Hide all
        mint_mint_shape.visible = false
        mint_price_shape.visible = false
        mint_getpmana_shape.visible = false
        mint_50off_shape.visible = false
        price_shape.visible = false

        sell_cargo_shape.visible = false

        setname_shape.visible = false

        //Show all
        menu_mint_shape.visible = true
        menu_chat_shape.visible = true
        menu_teach_shape.visible = true
        menu_photo_shape.visible = true
        menu_sell_shape.visible = true

        if (this.current_menu==0) {  // Mint
            mint_mint_shape.visible = true
            mint_price_shape.visible = true
            mint_getpmana_shape.visible = true
            mint_50off_shape.visible = true
            price_shape.visible = true

            this.updatePrice()

        } else if (this.current_menu==1) {  // Chat
            //
        } else if (this.current_menu==2) {  // Teach
            setname_shape.visible = true
        } else if (this.current_menu==3) {  // Photo
            //menu_mint_shape.visible = false
            menu_chat_shape.visible = false
            menu_teach_shape.visible = false
            menu_photo_shape.visible = false
            menu_sell_shape.visible = false
        } else if (this.current_menu==4) {  // Sell
            sell_cargo_shape.visible = true
        }
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

        this.price_entity.getComponent(TextShape).value = price_human
    }

    async mint(self: Stool) {
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

    async setName(self:any) {
        log("Set Name");
        if (self.current_compi < 0) return

        log("this.current_token", self.current_token);

        textInput.visible = true

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

            this.current_compi = 0

            this.updateCompi()
        }


    }

    async updateCompi() {
        compidata_shape.value = "-"

        const compiId = await blockchain.tokenOfOwnerByIndex(this.current_compi)

        this.current_token = compiId

        const compiName = await blockchain.getName(compiId)

        compidata_shape.value = compiId + ":" + compiName

    }
}
