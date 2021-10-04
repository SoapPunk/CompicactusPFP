//import { getUserPublicKey } from "@decentraland/Identity"

import {
    CompiNPC,
    CompiNPCSystem,
    Blockchain,
    CHARACTER,
    NETWORK
} from '@compicactus/dcl-scene-utils'

/*executeTask(async () => {
  const publicKey = await getUserPublicKey()
  log(publicKey)
  if (publicKey) {
      const st = new CompiNPC()
      st.addComponent(new Transform({
          position: new Vector3(8, 0, 8)
      }))
      st.addComponent(new Billboard(false, true, false))
  }
})*/


const boot = new Entity()
boot.addComponent(new GLTFShape("models/CompiStand.glb"))
boot.addComponent(new Transform({
    position: new Vector3(8, 0, -0.3),
    //scale: new Vector3(0.5, 0.5, 0.5)
}))
engine.addEntity(boot)


const network = new Blockchain(NETWORK.MATIC, CHARACTER.COMPICACTUS)

// Instance the input object
const input = Input.instance

let compi_visible = true

let st2 = createCompi()

// button down event
input.subscribe("BUTTON_DOWN", ActionButton.POINTER, false, (e) => {
  log("pointer Down", e)

  if (compi_visible) {
      compi_visible = false
      st2.destroy()
  } else {
      compi_visible = true
      st2 = createCompi()
  }
})

function createCompi() {
    const st2 = new CompiNPC(1, network)
    st2.addComponent(new Transform({
        position: new Vector3(8, 1.0, -0.3)
    }))
    st2.addComponent(new Billboard(false, true, false))
    return st2
}

/*

const st3 = new CompiNPC(2, network)
st3.addComponent(new Transform({
    position: new Vector3(8, 0, -8)
}))
st3.addComponent(new Billboard(false, true, false))


const building = new Entity()
building.addComponent(new GLTFShape("models/Building.gltf"))
building.addComponent(new Transform({
    position: new Vector3(8, 0, -8),
    rotation: Quaternion.Euler(0, 90, 0)
}))
engine.addEntity(building)*/

engine.addSystem(new CompiNPCSystem(network))
