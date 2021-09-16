import { getUserPublicKey } from "@decentraland/Identity"

import { Stool, StoolSystem } from "./stool"

executeTask(async () => {
  const publicKey = await getUserPublicKey()
  log(publicKey)
  if (publicKey) {
      const st = new Stool()
      st.addComponent(new Transform({
          position: new Vector3(8, 1.5, 8)
      }))
  }
})

const st2 = new Stool(1)
st2.addComponent(new Transform({
    position: new Vector3(8, 2.5, -0.3)
}))
st2.addComponent(new Billboard())

const building = new Entity()
building.addComponent(new GLTFShape("models/Building.gltf"))
building.addComponent(new Transform({
    position: new Vector3(8, 0, -8),
    rotation: Quaternion.Euler(0, 90, 0)
}))
engine.addEntity(building)

engine.addSystem(new StoolSystem())
