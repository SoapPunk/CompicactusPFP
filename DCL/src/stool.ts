import { Blockchain } from "./contracts"
import { Mint } from "./mint"
import { Teach } from "./teach"
import { Compicactus } from "./compicactus"
import * as eth from "eth-connect"

//Menu Shapes
const menu_mint_shape = new GLTFShape("models/menu_mint.gltf")
const menu_chat_shape = new GLTFShape("models/menu_chat.gltf")
const menu_teach_shape = new GLTFShape("models/menu_teach.gltf")
const menu_photo_shape = new GLTFShape("models/menu_photo.gltf")
const menu_sell_shape = new GLTFShape("models/menu_sell.gltf")

const stool_shape = new GLTFShape("models/stool.gltf")
//const compicactus_shape = new GLTFShape("models/Compicactus.glb")

const sell_cargo_shape = new GLTFShape("models/sell_cargo.gltf")
const sell_opensea_shape = new GLTFShape("models/sell_opensea.gltf")

const left_shape = new GLTFShape("models/left.gltf")
const right_shape = new GLTFShape("models/right.gltf")
const compidata_shape = new TextShape()
const answer_shape = new TextShape()

const blockchain = new Blockchain("mumbai")


export class Stool extends Entity {
    // Menu entities
    menu_mint_entity: Entity = new Entity
    menu_chat_entity: Entity = new Entity
    menu_teach_entity: Entity = new Entity
    menu_photo_entity: Entity = new Entity
    menu_sell_entity: Entity = new Entity
    compi_entity: Compicactus

    sell_cargo_entity: Entity = new Entity
    sell_opensea_entity: Entity = new Entity

    left_entity: Entity = new Entity
    right_entity: Entity = new Entity
    compidata_entity: Entity = new Entity
    answer_entity: Entity = new Entity

    current_compi: number = -1
    current_token: number = -1
    current_menu: number = 0

    mint: Mint
    teach: Teach

    //compi_actions: Array<string>

    constructor() {
        super()

        this.addComponent(stool_shape)
        this.addComponent(new Transform({
            position: new Vector3(8, 0, 8)
        }))
        this.addComponent(new Billboard(false, true ,false))
        engine.addEntity(this)

        this.mint = new Mint(this)

        this.teach = new Teach(this)

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

        this.compi_entity = new Compicactus()
        this.compi_entity.addComponent(new Transform({
            position: new Vector3(0, 1.05, -0.1),
            scale: new Vector3(0.4, 0.4, 0.4)
        }))
        this.compi_entity.setParent(this)

        compidata_shape.fontSize = 1
        compidata_shape.value = "-"
        this.compidata_entity.addComponent(compidata_shape)
        this.compidata_entity.addComponent(new Transform({
            position: new Vector3(0, 1.1, 0),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.compidata_entity.setParent(this)
        engine.addEntity(this.compidata_entity)

        answer_shape.fontSize = 2
        answer_shape.value = "-"
        answer_shape.color = Color3.Black()
        answer_shape.outlineColor = Color3.White()
        answer_shape.outlineWidth = .1
        this.answer_entity.addComponent(answer_shape)
        this.answer_entity.addComponent(new Transform({
            position: new Vector3(0, 1.9, 0),
            rotation: Quaternion.Euler(0, 180, 0)
        }))
        this.answer_entity.setParent(this)
        engine.addEntity(this.answer_entity)

        this.setupMenu()

        this.ownsCompi()
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

        sell_opensea_shape.visible = false
        this.sell_opensea_entity.addComponent(sell_opensea_shape)
        this.sell_opensea_entity.addComponent(new Transform())
        this.sell_opensea_entity.setParent(this)
        engine.addEntity(this.sell_opensea_entity)
        this.sell_opensea_entity.addComponent(
            new OnPointerDown(() => {
                openExternalURL("https://opensea.io/")
            },
            {
                hoverText: "Go to OpenSea",
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
        this.mint.deactivate()

        sell_cargo_shape.visible = false
        sell_opensea_shape.visible = false

        this.teach.deactivate()

        //Show all
        menu_mint_shape.visible = true
        menu_chat_shape.visible = true
        menu_teach_shape.visible = true
        menu_photo_shape.visible = true
        menu_sell_shape.visible = true

        if (this.current_menu==0) {  // Mint
            this.mint.activate()

            this.mint.updatePrice()

        } else if (this.current_menu==1) {  // Chat
            //
        } else if (this.current_menu==2) {  // Teach
            this.teach.activate()
        } else if (this.current_menu==3) {  // Photo
            //menu_mint_shape.visible = false
            menu_chat_shape.visible = false
            menu_teach_shape.visible = false
            menu_photo_shape.visible = false
            menu_sell_shape.visible = false
        } else if (this.current_menu==4) {  // Sell
            sell_cargo_shape.visible = true
            sell_opensea_shape.visible = true
        }
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

        this.teach.getQuestions()

        this.compi_entity.set_body(this.current_compi)
    }
}
