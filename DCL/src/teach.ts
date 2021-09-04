import { Blockchain } from "./contracts"
import { Stool } from "./stool"
import * as eth from "eth-connect"

const setname_shape = new GLTFShape("models/setName.gltf")
const button_add_shape = new GLTFShape("models/button_add.gltf")

const canvas = new UICanvas()
const textInput = new UIInputText(canvas)

const blockchain = new Blockchain("mumbai")

export class Teach {
    setname_entity: Entity = new Entity
    addquestion_entity: Entity = new Entity
    parent: Stool

    adding_question: string = ""
    adding_answer: string = ""

    question_list_entity: Array<Entity> = []
    play_list_entity: Array<Entity> = []
    edit_list_entity: Array<Entity> = []
    delete_list_entity: Array<Entity> = []
    question_list: Array<{id: number, value: string}> = []

    activated = false

    constructor(parent: Stool) {
        this.parent = parent

        setname_shape.visible = false
        this.setname_entity.addComponent(setname_shape)
        this.setname_entity.addComponent(new Transform())
        this.setname_entity.setParent(parent)
        engine.addEntity(this.setname_entity)
        this.setname_entity.addComponent(
            new OnPointerDown(() => {this.setName(this)},
            {
                hoverText: "Set Name",
            })
        )

        button_add_shape.visible = false
        this.addquestion_entity.addComponent(button_add_shape)
        this.addquestion_entity.addComponent(new Transform({
            position: new Vector3(-.82, 1.8, 0.01)
        }))
        this.addquestion_entity.setParent(parent)
        engine.addEntity(this.addquestion_entity)
        this.addquestion_entity.addComponent(
            new OnPointerDown(() => {this.addQuestion(this)},
            {
                hoverText: "Add question",
            })
        )

        // Input Text
        textInput.width = "50%"
        textInput.height = "50px"
        textInput.vAlign = "bottom"
        textInput.hAlign = "center"
        textInput.fontSize = 30
        textInput.placeholder = "Write name here"
        textInput.placeholderColor = Color4.Gray()
        textInput.positionY = "200px"
        textInput.isPointerBlocker = true
        textInput.visible = false

        //
        for (let n=0; n < 3; n++) {
            const starting_pos = -.4

            this.question_list_entity.push(new Entity())
            const text_shape = new TextShape()
            this.question_list_entity[n].addComponent(text_shape)
            text_shape.fontSize = 1
            text_shape.hTextAlign = "left"
            text_shape.color = Color3.Black()
            text_shape.outlineColor = Color3.White()
            text_shape.outlineWidth = .1
            this.question_list_entity[n].addComponent(new Transform({
                position: new Vector3(starting_pos - 0.3, 1.66-(n*0.1), 0.01),
                rotation: Quaternion.Euler(0, 180, 0)
            }))
            this.question_list_entity[n].setParent(parent)
            engine.addEntity(this.question_list_entity[n])

            this.play_list_entity.push(new Entity())
            const button_play_shape = new GLTFShape("models/button_play.gltf")
            button_play_shape.visible = false
            this.play_list_entity[n].addComponent(button_play_shape)
            this.play_list_entity[n].addComponent(new Transform({
                position: new Vector3(starting_pos, 1.66-(n*0.1), 0.01),
                scale: new Vector3(.5, .5, .5)
            }))
            this.play_list_entity[n].setParent(parent)
            this.play_list_entity[n].addComponent(
                new OnPointerDown(() => {this.askQuestion(this, n)},
                {
                    hoverText: "Ask question",
                })
            )
            engine.addEntity(this.play_list_entity[n])

            this.edit_list_entity.push(new Entity())
            const button_edit_shape = new GLTFShape("models/button_edit.gltf")
            button_edit_shape.visible = false
            this.edit_list_entity[n].addComponent(button_edit_shape)
            this.edit_list_entity[n].addComponent(new Transform({
                position: new Vector3(starting_pos - .1, 1.66-(n*0.1), 0.01),
                scale: new Vector3(.5, .5, .5)
            }))
            this.edit_list_entity[n].setParent(parent)
            this.edit_list_entity[n].addComponent(
                new OnPointerDown(() => {this.editQuestion(this, n)},
                {
                    hoverText: "Edit question",
                })
            )
            engine.addEntity(this.edit_list_entity[n])

            this.delete_list_entity.push(new Entity())
            const button_delete_shape = new GLTFShape("models/button_delete.gltf")
            button_delete_shape.visible = false
            this.delete_list_entity[n].addComponent(button_delete_shape)
            this.delete_list_entity[n].addComponent(new Transform({
                position: new Vector3(starting_pos - .2, 1.66-(n*0.1), 0.01),
                scale: new Vector3(.5, .5, .5)
            }))
            this.delete_list_entity[n].setParent(parent)
            this.delete_list_entity[n].addComponent(
                new OnPointerDown(() => {this.removeQuestion(this, n)},
                {
                    hoverText: "Remove question",
                })
            )
            engine.addEntity(this.delete_list_entity[n])
        }
    }

    async setName(self: Teach) {
        log("Set Name")
        if (self.parent.current_compi < 0) return

        log("this.current_token", self.parent.current_token)

        textInput.visible = true
        textInput.placeholder = "Write name here"

        textInput.onTextSubmit = new OnTextSubmit(async (x) => {
            textInput.visible = false
            await blockchain.setName(this.parent.current_token, x.text).then(tx => {
                log("setName Ok ", tx)
            }).catch(e => {
                log("Error on setName", e)
            })
        })
    }

    async addQuestion(self: Teach) {
        log("Add Questions")
        if (self.parent.current_compi < 0) return

        log("this.current_token", self.parent.current_token)

        textInput.visible = true
        textInput.placeholder = "Write question"

        textInput.onTextSubmit = new OnTextSubmit(async (x) => {

            this.adding_question = x.text
            textInput.value = ""
            textInput.placeholder = "Write answer"
            textInput.onTextSubmit = new OnTextSubmit(async (x) => {
                textInput.visible = false
                this.adding_answer = x.text

                await blockchain.addQuestion(this.parent.current_token, this.adding_question, this.adding_answer).then(tx => {
                    log("addQuestion Ok ", tx)
                }).catch(e => {
                    log("Error on addQuestion", e)
                })
            })
        })
    }

    async editQuestion(self: Teach, n: number) {
        log("Add Questions")
        if (self.parent.current_compi < 0) return

        log("this.current_token", self.parent.current_token)

        const text = await blockchain.getAnswer(this.parent.current_token, this.question_list[n].value)

        textInput.visible = true
        textInput.placeholder = text
        textInput.value = text
        textInput.onTextSubmit = new OnTextSubmit(async (x) => {
            textInput.visible = false

            await blockchain.addQuestion(this.parent.current_token, this.question_list[n].value, x.text).then(tx => {
                log("addQuestion Ok ", tx)
            }).catch(e => {
                log("Error on addQuestion", e)
            })
        })
    }

    async askQuestion(self: Teach, n: number) {
        const answer = await blockchain.getAnswer(this.parent.current_token, this.question_list[n].value)
        this.parent.answer_entity.getComponent(TextShape).value = answer
        this.parent.compi_entity.play_random()
        /*const clip_name = this.parent.compi_actions[Math.round(Math.random()*this.parent.compi_actions.length)]
        const clip = this.parent.compi_entity.getComponent(Animator).getClip(clip_name)
        clip.play()
        clip.looping = false*/
    }

    async getQuestions() {
        if (!this.activated) return

        const offset = 0
        const questions = await blockchain.getQuestions(this.parent.current_token, offset)
        log(questions)

        this.hideList()

        this.question_list = []

        for (let n=0; n < 3; n++) {
            this.question_list_entity[n].getComponent(TextShape).value = questions[n]

            if (questions[n] != "") {
                this.play_list_entity[n].getComponent(GLTFShape).visible = true
                this.edit_list_entity[n].getComponent(GLTFShape).visible = true
                this.delete_list_entity[n].getComponent(GLTFShape).visible = true

                this.question_list[n] = {
                    id: n+offset,
                    value: questions[n]
                }
            }
        }
    }

    hideList() {
        for (let n=0; n < 3; n++) {
            this.question_list_entity[n].getComponent(TextShape).value = ""
            this.play_list_entity[n].getComponent(GLTFShape).visible = false
            this.edit_list_entity[n].getComponent(GLTFShape).visible = false
            this.delete_list_entity[n].getComponent(GLTFShape).visible = false
        }
    }

    deactivate() {
        setname_shape.visible = false
        textInput.visible = false
        button_add_shape.visible = false

        this.hideList()

        this.activated = false
    }

    activate() {
        setname_shape.visible = true
        button_add_shape.visible = true

        this.activated = true

        this.getQuestions()
    }


}
