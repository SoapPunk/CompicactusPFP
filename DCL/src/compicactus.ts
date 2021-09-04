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
    "Action-09-Pissed Off",
    "Action-10-Yawn",
    "Action-11-Alert",
    "Action-02 Sigh",
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


export class Compicactus extends Entity {

    /*cigar_entity: Entity
    eye_entity: Entity
    hat_entity: Entity
    mustache_entity: Entity
    nose_entity: Entity
    pot_entity: Entity*/

    element_entities: any = {}

    constructor(){
        super()

        // this.addComponent(new Transform())
        //this.setParent(parent)

        for (let n=0; n<elements.length; n++) {
            this.element_entities[elements[n]] = new Entity()
            this.element_entities[elements[n]].setParent(this)
            const shape = variations[elements[n]][Math.floor(Math.random()*variations[elements[n]].length)]
            //const shape = variations[elements[n]][0]
            log("shape", shape)
            this.element_entities[elements[n]].addComponent(new GLTFShape("compi_models/"+shape+".glb"))
            let animator = new Animator()
            this.element_entities[elements[n]].addComponent(animator)
        }

        /*
        this.compi_entity.addComponent(compicactus_shape)
        this.compi_entity.addComponent(new Transform({
            position: new Vector3(0, 1.05, -0.1),
            scale: new Vector3(0.3, 0.3, 0.3)
        }))
        this.compi_entity.setParent(this)

        let animator = new Animator()
        this.compi_entity.addComponent(animator)
        this.compi_actions = [
            "Action-01-Look R-L",
            "Action-02-Look R",
            "Action-03-Look L",
            "Action-04-Look-Up",
            "Action-05-Sleep",
            "Action-06-Dancing",
            "Action-07-Swinging",
            "Action-08-LOL",
            "Action-09-Pissed Off",
            "Action-10-Yawn",
            "Action-11-Alert",
            "Action-02 Sigh",
        ]
        this.compi_actions.forEach(element => {
            animator.addClip(new AnimationState(element))
        })
        engine.addEntity(this.compi_entity)
        */
    }

    play_random() {
        const clip_name = compi_actions[Math.round(Math.random()*compi_actions.length)]

        for (let n=0; n<elements.length; n++) {
            const clip = this.element_entities[elements[n]].getComponent(Animator).getClip(clip_name)
            clip.play()
            clip.looping = false
        }
    }
}
