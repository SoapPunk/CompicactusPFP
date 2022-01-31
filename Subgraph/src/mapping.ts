import {
    QuestionAdded,
    QuestionRemoved,
    QuestionsSwitched,
    FlagSet,
    OperatorSet,
    NameSet,
    InitialSceneSet
} from "../generated/CompiBrain/CompiBrain"
import {
    Contract,
    NFT,
    Scene,
    Question
} from "../generated/schema"


export function handleQuestionAdded(event: QuestionAdded): void {
    // address _contract, uint256 id, string scene, string question, string answer

    // From account
    //let from = new Account(event.params.from.toHex())
    //from.save()

    // To account
    //let to = new Account(event.params.to.toHex())
    //to.save()

    //
    let contract = Contract.load(event.params._contract.toHex())
    if (contract == null) {
        contract = new Contract(event.params._contract.toHex())
        contract.address = event.params._contract.toHex()
    }

    let nft_id = event.params._contract.toHexString() + "-" + event.params.id.toString()
    let nft = NFT.load(nft_id)
    if (nft == null) {
        nft = new NFT(nft_id)
        nft.contract = event.params._contract.toHex()
        nft.tokenId = event.params.id
    }

    let scene_id = nft_id + "-" + event.params.scene
    let scene = Scene.load(scene_id)
    if (scene == null) {
        scene = new Scene(scene_id)
        scene.nft = nft_id
        scene.name = event.params.scene
    }

    let question_id = scene_id + "-" + event.params.question
    let question = Question.load(question_id)
    if (question == null) {
        question = new Question(question_id)
        question.scene = scene_id
        question.text = event.params.question
    }

    question.answer = event.params.answer

    contract.save()
    nft.save()
    scene.save()
    question.save()
}

export function handleQuestionRemoved(event: QuestionRemoved): void {
    //address _contract, uint256 id, string scene, string question, uint256 questionId

    /*
    // From account
    let oldPlayer = new Account(event.params.oldPlayer.toHex())
    oldPlayer.save()

    // To account
    let newPlayer = new Account(event.params.newPlayer.toHex())
    newPlayer.save()

    // Golfclub id
    let golfclub = Compicactus.load(event.params.tokenId.toHex())
    if (golfclub == null) {
        golfclub = new Compicactus(event.params.tokenId.toHex())
    }
    golfclub.player = event.params.newPlayer.toHex()
    golfclub.save()
    */
}

export function handleQuestionsSwitched(event: QuestionsSwitched): void {}

export function handleFlagSet(event: FlagSet): void {}

export function handleOperatorSet(event: OperatorSet): void {}

export function handleNameSet(event: NameSet): void {}

export function handleInitialSceneSet(event: InitialSceneSet): void {}
