import { getUserPublicKey } from "@decentraland/Identity"

import { Stool, StoolSystem } from "./stool"

executeTask(async () => {
  const publicKey = await getUserPublicKey()
  log(publicKey)
  if (publicKey) {
      new Stool()
      engine.addSystem(new StoolSystem())
  }
})

const building = new Entity()
building.addComponent(new GLTFShape("models/Building.gltf"))
building.addComponent(new Transform({
    position: new Vector3(8, 0, -8),
    rotation: Quaternion.Euler(0, 90, 0)
}))
engine.addEntity(building)
