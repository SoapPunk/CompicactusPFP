import {
    CompiNPC,
    CompiNPCSystem,
    Blockchain,
    CHARACTER,
    NETWORK
} from '@compicactus/dcl-scene-utils'

// Floor
const floor_material = new Material()
floor_material.albedoColor = new Color3(0, 0.2, 0)
floor_material.specularIntensity = 0
floor_material.metallic = 0
floor_material.roughness = 1
const floor = new Entity()
floor.addComponent(new PlaneShape())
floor.addComponent(floor_material)
floor.addComponent(new Transform({
    rotation: Quaternion.Euler(90, 0, 0),
    position: new Vector3(8, 0.01, 0),
    scale: new Vector3(16, 32, 1)
}))
engine.addEntity(floor)


// Boots
const boot_train = new Entity()
boot_train.addComponent(new GLTFShape("models/BoothTrain.glb"))
boot_train.addComponent(new Transform({
    position: new Vector3(8, 0, 0),
}))
engine.addEntity(boot_train)

const boot_mint = new Entity()
boot_mint.addComponent(new GLTFShape("models/BoothMint.glb"))
boot_mint.addComponent(new Transform({
    position: new Vector3(5, 0, 0),
}))
engine.addEntity(boot_mint)

const boot_twitter = new Entity()
boot_twitter.addComponent(new GLTFShape("models/BoothTwitter.glb"))
boot_twitter.addComponent(new Transform({
    position: new Vector3(3, 0, 0),
}))
engine.addEntity(boot_twitter)
boot_twitter.addComponent(
    new OnPointerDown(async ()=>{
        openExternalURL("https://twitter.com/compicactus")
    },
    {
        hoverText: "Info about Compicactus"
    }
))


// Animations
const error_anim = new Entity()
const error_shape = new GLTFShape("models/Error.glb")
error_shape.visible = false
error_anim.addComponent(error_shape)
error_anim.addComponent(new Transform({
    position: new Vector3(5, 1.5, 0.1),
    scale: new Vector3(4, 4, 4)
}))
let animator_error = new Animator()
error_anim.addComponent(animator_error)
const clipError = new AnimationState("ArmatureAction")
animator_error.addClip(clipError)
engine.addEntity(error_anim)
clipError.stop()
error_anim.addComponent(
    new OnPointerDown(async ()=>{
        clearMessages()
    },
    {
        hoverText: "Ok"
    }
))

const success_anim = new Entity()
const success_shape = new GLTFShape("models/Success.glb")
success_shape.visible = false
success_anim.addComponent(success_shape)
success_anim.addComponent(new Transform({
    position: new Vector3(5+0.2, 0.7, 0.1),
    scale: new Vector3(2, 2, 2)
}))
let animator_success = new Animator()
success_anim.addComponent(animator_success)
const clipSuccess = new AnimationState("CheckAction")
animator_success.addClip(clipSuccess)
engine.addEntity(success_anim)
clipSuccess.stop()
success_anim.addComponent(
    new OnPointerDown(async ()=>{
        clearMessages()
    },
    {
        hoverText: "Ok"
    }
))


// Compicactus
const network_compi = new Blockchain(NETWORK.MATIC, CHARACTER.COMPICACTUS)
const compi = new CompiNPC(-1, network_compi)
compi.addComponent(new Transform({
    position: new Vector3(8, 0.5, 0.01)
}))

engine.addSystem(new CompiNPCSystem())




// Mint

let price: any
let minting: boolean

boot_mint.addComponent(
    new OnPointerDown(async ()=>{
        if (minting) {
            return;
        }
        minting = true
        const current_price = price
        log("price", current_price);
        clearMessages();
        setStatus("Waiting for signature 1 of 2");
        await network_compi.increaseAllowance(current_price[0]).then(receipt => {
            if (receipt.status === 1) {
                log("IncreaseAllowance Ok ", receipt)
                setStatus("Waiting for signature 2 of 2");
                network_compi.mintCompi(current_price[0]).then(receipt => {
                    if (receipt.status === 1) {
                        log("Mint Ok ", receipt)
                        showSuccess()
                        setStatus("Compi minted!")
                        updatePrice()
                    } else {
                        log("Error on mint", receipt)
                        showError()
                        setStatus("Error minting")
                        updatePrice()
                    }
                }).catch(e => {
                    log("Error on mint", e)
                    showError()
                    setStatus("Error minting")
                    updatePrice()
                })
            } else {
                log("Error on IncreaseAllowance", receipt)
                setStatus("Error allowing MANA")
                showError()
            }
        }).catch(e => {
            log("Error on IncreaseAllowance", e)
            setStatus("Error allowing MANA")
            showError()
        })
    },
    {
        hoverText: "Mint Compi",
    })
);



// Price Text
const price_shape = new TextShape()
//price_shape.textWrapping = true
price_shape.font = new Font(Fonts.SanFrancisco_Heavy)
price_shape.hTextAlign = "left"
price_shape.vTextAlign = "top"
price_shape.fontSize = 4
//price_shape.fontWeight = 'heavy'
price_shape.value = "-"
//price_shape.width = 1.5
price_shape.color = new Color3(0.3, 0.05, 0.05)

const price_entity = new Entity()
price_entity.addComponent(price_shape)
price_entity.addComponent(new Transform({
    position: new Vector3(5.8, 2.2, 0),
    rotation: Quaternion.Euler(0, 180, 0),
    //scale: new Vector3(0.5, 0.5, 1)
}))
engine.addEntity(price_entity)

// Status Text
const status_shape = new TextShape()
//price_shape.textWrapping = true
status_shape.font = new Font(Fonts.SanFrancisco_Heavy)
status_shape.hTextAlign = "left"
status_shape.vTextAlign = "top"
status_shape.fontSize = 1
//price_shape.fontWeight = 'heavy'
status_shape.value = "Status:\n-Idle"
status_shape.color = Color3.White()

const status_entity = new Entity()
status_entity.addComponent(status_shape)
status_entity.addComponent(new Transform({
    position: new Vector3(5.8, 1.2, 0),
    rotation: Quaternion.Euler(0, 180, 0),
    //scale: new Vector3(0.5, 0.5, 1)
}))
engine.addEntity(status_entity)


function updatePrice() {
    executeTask(async ()=>{
        price = await network_compi.getPrice()
        price_shape.value = network_compi.wei2human(price[0].toString())
        if (price[1]) {
            price_shape.value += "\n50% Off!"
        }
    })
}

function setStatus(text: string) {
    status_shape.value = `Status:\n-${text}`
}

updatePrice()


function showError() {
    error_shape.visible = true
    clipError.looping = false
    clipError.play(true)
    success_shape.visible = false
    minting = false
}

function showSuccess() {
    success_shape.visible = true
    clipSuccess.looping = false
    clipSuccess.play(true)
    error_shape.visible = false
    minting = false
}

function clearMessages() {
    error_shape.visible = false
    success_shape.visible = false
}



// Set the date we're counting down to
//var countDownDate = new Date("Oct 16, 2021 11:05:00").getTime();
let countDownDate = Date.UTC(2021, 9, 16, 16, 5); 
log("date", countDownDate)
executeTask(async ()=>{
    const _countDownDate = await network_compi.getTimeWindow()
    countDownDate = Number(_countDownDate[0])
})

export class TimerSystem implements ISystem {
    acumulated_time: number = 0
    update(dt: number) {
        this.acumulated_time += dt;
        if (this.acumulated_time < 1) return;

        var now = new Date().getTime();
        //var now = Date.UTC(2020, 9, 16, 11, 10);

        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let time_txt

        if (distance < 0) {
            time_txt = "Live!";
            engine.removeSystem(this)
        } else {
            time_txt = ` Starting in ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        setStatus(time_txt)
    }
}

// Add system to engine
engine.addSystem(new TimerSystem())
