import { fetchRetry } from './common'

const elements = [
    "cigar",
    "eye",
    "hat",
    "mustache",
    "nose",
    "pot",
    "body",
    "eyes"
]
const compi_actions = [
    "Action-01-Look R-L",
    "Action-02-Look R",
    "Action-03-Look L",
    "Action-04-Look-Up",
    "Action-05-Sleep",
    "Action-06-Dancing",
    "Action-07-Swinging",
    "Action-08-LOL",
    "Action-09-Pised Off",
    "Action-10-Yawn",
    "Action-11-Alert",
    "Action-12 Sigh",
]

const variations: any = {
    "cigar": [
        "Cigar-Brush",
        "Cigar-Faso",
        "Cigar-Palillo",
        "Cigar-Pipa",
        "Cigar-Simple",
        "Cigar-Trumpet",
        "Cigar-Two"
    ],
    "eye": [
        "Eye-3dGlasses",
        "Eye-Buttons",
        "Eye-CircularGlasses",
        "Eye-Cuberpunk",
        "Eye-Monocule",
        "Eye-SquareGlasses",
        "Eye-VRheadset"
    ],
    "hat": [
        "Hat-Ants",
        "Hat-Banana",
        "Hat-BunnyEars",
        "Hat-CatEars",
        "Hat-Curl",
        "Hat-Dino",
        "Hat-Emo",
        "Hat-Galley",
        "Hat-Headphones",
        "Hat-HeadphonesWinter",
        "Hat-Lemon",
        "Hat-Llama",
        "Hat-MotorcycleHelmet",
        "Hat-PinkHair",
        "Hat-PunkHair",
        "Hat-Sleep",
        "Hat-Unicorn",
        "Hat-Viking",
        "Hat-Worker"
    ],
    "mustache": [
        "Mustache-Cat",
        "Mustache-CepilloA",
        "Mustache-CepilloB",
        "Mustache-CosmeFulanitoA",
        "Mustache-CosmeFulanitoB",
        "Mustache-Dali",
        "Mustache-Mexican",
        "Mustache-Small"
    ],
    "nose": [
        "Nose-Carrot",
        "Nose-Clown",
        "Nose-Prism",
        "Nose-Screw",
        "Nose-Triangle"
    ],
    "pot": [
        "Pot-Basic",
        "Pot-Broken",
        "Pot-Censored",
        "Pot-Cup",
        "Pot-Cyber",
        "Pot-Fishbowl",
        "Pot-Hearth",
        "Pot-IceCreamCone",
        "Pot-Punk",
        "Pot-Rainbow",
        "Pot-Rings",
        "Pot-Tuxedo",
        "Pot-Yuppie"
    ],
    "body": [
        "Body-Green",
        "Body-Pink",
        "Body-Violet",
        "Body-Yellow",
    ],
    "eyes": [
        "Eyes-Green-Simple",
        "Eyes-Pink-Simple",
        "Eyes-Violet-Simple",
        "Eyes-Yellow-Simple",

        "Eyes-Green-None",
        "Eyes-Pink-None",
        "Eyes-Violet-None",
        "Eyes-Yellow-None",
    ]
}

type Variation = {
    "body": string,
    "cigar": string,
    "eyes": string,
    "glasses": string,
    "hat": string,
    "mustache": string,
    "nose": string,
    "pot": string
}

export class Compicactus extends Entity {

    /*cigar_entity: Entity
    eye_entity: Entity
    hat_entity: Entity
    mustache_entity: Entity
    nose_entity: Entity
    pot_entity: Entity*/

    element_entities: Array<Entity> = []

    variation: Variation

    constructor(){
        super()

        this.variation = {
            "body": "",
            "cigar": "",
            "eyes": "",
            "glasses": "",
            "hat": "",
            "mustache": "",
            "nose": "",
            "pot": ""
        }
        this.set_body(0)
    }

    play_random() {
        const clip_name = compi_actions[Math.floor(Math.random()*compi_actions.length)]
        log("clip_name", clip_name)
        for (let n=0; n<this.element_entities.length; n++) {
            const clip = this.element_entities[n].getComponent(Animator).getClip(clip_name)
            clip.play()
            clip.looping = false
        }
    }

    remove_elements() {
        for (let n=0; n<this.element_entities.length; n++) {
            engine.removeEntity(this.element_entities[n])
        }
    }

    async set_body(id: number) {
        log("set body")
        this.remove_elements()

        const url = "https://ipfs.io/ipfs/QmVcN4A6EzBrrWcsovrKsRg5sTootZ9HmSuTadGQ2XrL9y"
        const data = {
            headers: {
                'Accept': 'application/json'
            },
            method: "GET",
        }
        log("get variations")
        const variations: Array<Variation> = await fetchRetry(url, data, 3).then(r => r.json()).catch(e => log("Error"))

        log("variations", variations)

        this.variation = variations[id]

        this.add_element("body")
        this.add_element("cigar")
        this.add_element("eyes")
        this.add_element("glasses")
        this.add_element("hat")
        this.add_element("mustache")
        this.add_element("nose")
        this.add_element("pot")
    }

    add_element(name: string) {
        if (this.variation[name]=="") return
        this.element_entities.push(new Entity)
        this.get_last_element().addComponent(new GLTFShape("compi_models/"+this.variation[name]+".glb"))
        this.get_last_element().addComponent(new Animator())
        engine.addEntity(this.get_last_element())
        this.get_last_element().setParent(this)
        //return entity
    }

    get_last_element() {
        return this.element_entities[this.element_entities.length-1]
    }
}
