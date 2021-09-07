import { getUserPublicKey } from "@decentraland/Identity"

import { Stool } from "./stool"

executeTask(async () => {
  const publicKey = await getUserPublicKey()
  log(publicKey)
  if (publicKey) {
      new Stool()
  }
})

const building = new Entity()
building.addComponent(new GLTFShape("models/Building.gltf"))
building.addComponent(new Transform({
    position: new Vector3(8, 0, -8),
    rotation: Quaternion.Euler(0, 90, 0)
}))
engine.addEntity(building) 

/*
const cubePrice = new Entity()
cubePrice.addComponent(new Transform({ position: new Vector3(8, 2, 8) }))
cubePrice.addComponent(new BoxShape())
cubePrice.addComponent(
    new OnPointerDown(async (e) => {
        log("Getting price");

        const price = await blockchain.getPrice();

        log("price", price);
    },
    {
        hoverText: "Get price",
    })
)
engine.addEntity(cubePrice)

const cubeMint = new Entity()
cubeMint.addComponent(new Transform({ position: new Vector3(10, 2, 8) }))
cubeMint.addComponent(new BoxShape())
cubeMint.addComponent(
    new OnPointerDown(async (e) => {
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

    },
    {
        hoverText: "Mint Compi",
    })
)
engine.addEntity(cubeMint)

const cubeCompis = new Entity()
cubeCompis.addComponent(new Transform({ position: new Vector3(10, 2, 10) }))
cubeCompis.addComponent(new BoxShape())
cubeCompis.addComponent(
    new OnPointerDown(async (e) => {
        log("Getting compis");

        const compisCount = await blockchain.balanceOf();

        const compiId = await blockchain.tokenOfOwnerByIndex(0);

        const compiName = await blockchain.getName(compiId);

        log("compis", compisCount, compiId, compiName);

    },
    {
        hoverText: "Get compis",
    })
)
engine.addEntity(cubeCompis)

const cubeCompiName = new Entity()
cubeCompiName.addComponent(new Transform({ position: new Vector3(12, 2, 10) }))
cubeCompiName.addComponent(new BoxShape())
cubeCompiName.addComponent(
    new OnPointerDown(async (e) => {
        log("Setting compi name");

        await blockchain.setName(0, "Pepe").then(tx => {
            log("setName Ok ", tx)
        }).catch(e => {
            log("Error on setName", e)
        })

    },
    {
        hoverText: "Set compi name",
    })
)
engine.addEntity(cubeCompiName)

const cubeCompiAddQuestion = new Entity()
cubeCompiAddQuestion.addComponent(new Transform({ position: new Vector3(12, 2, 12) }))
cubeCompiAddQuestion.addComponent(new BoxShape())
cubeCompiAddQuestion.addComponent(
    new OnPointerDown(async (e) => {
        log("Setting compi name");

        await blockchain.addQuestion(0, "default", "Hi compi!", "Hi there!").then(tx => {
            log("addQuestion Ok ", tx)
        }).catch(e => {
            log("Error on addQuestion", e)
        })

    },
    {
        hoverText: "Add compi question",
    })
)
engine.addEntity(cubeCompiAddQuestion)

const cubeCompigGetAnswer = new Entity()
cubeCompigGetAnswer.addComponent(new Transform({ position: new Vector3(12, 0.5, 12) }))
cubeCompigGetAnswer.addComponent(new BoxShape())
cubeCompigGetAnswer.addComponent(
    new OnPointerDown(async (e) => {
        log("Setting compi name");

        const answer = await blockchain.getAnswer(0, "default", "Hi compi!")
        log("answer", answer)
    },
    {
        hoverText: "Get answer",
    })
)
engine.addEntity(cubeCompigGetAnswer)
*/
