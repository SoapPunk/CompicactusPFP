import {
    CompiNPC,
    CompiNPCSystem,
    Blockchain,
    CHARACTER,
    NETWORK
} from '@compicactus/dcl-scene-utils'

const boot = new Entity()
boot.addComponent(new GLTFShape("models/CompiStand.glb"))
boot.addComponent(new Transform({
    position: new Vector3(8, 0, -0.3),
    //scale: new Vector3(0.5, 0.5, 0.5)
}))
engine.addEntity(boot)

// Compicactus
const network_compi = new Blockchain(NETWORK.MATIC, CHARACTER.COMPICACTUS)
const compi = new CompiNPC(-1, network_compi, true)
compi.addComponent(new Transform({
    position: new Vector3(8, 1.0, -0.3)
}))
compi.addComponent(new Billboard(false, true, false)) 

//engine.addSystem(new CompiNPCSystem(network_compi))


// Voxters
const network_voxter = new Blockchain(NETWORK.MATIC, CHARACTER.VOXTER)
const voxters = new CompiNPC(-1, network_voxter, true)
voxters.addComponent(new Transform({
    position: new Vector3(8, 1.0, -5)
}))
voxters.addComponent(new Billboard(false, true, false))

engine.addSystem(new CompiNPCSystem())
