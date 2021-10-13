//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

// import { CompicactusPFP } from "./CompicactusPFP.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";


contract CompiBrain is
    Initializable,
    AccessControlEnumerableUpgradeable,
    NativeMetaTransaction,
    ContextMixin
    {

    // Mapping from token+question to answer
    // map[Contract][tokenId][Scene][Question] = Answer
    mapping (address => mapping (uint256 => mapping (string => mapping (string => string)))) private _nftQuestionAnswer;

    // Mapping from token to flags
    // map[Contract][tokenId] = String
    mapping (address => mapping (uint256 => string)) private _nftFlag;

    // Mapping from token to name
    // map[Contract][tokenId] = Name
    mapping (address => mapping (uint256 => string)) private _nftName;

    // Mapping from token to Operator
    // map[Contract][tokenId] = Address
    mapping (address => mapping (uint256 => address)) private _nftOperator;

    // Mapping from token to list of questions
    // map[Contract][tokenId][Scene] = Questions[]
    mapping (address => mapping (uint256 => mapping (string => string[]))) private _nftQuestions;

    // Mapping from token to list of Scenes
    // map[Contract][tokenId] = Scenes[]
    mapping (address => mapping (uint256 => string[])) private _nftScenes;

    // Mapping from scene to if added
    // map[scene] = boolean
    mapping (string => bool) private _sceneAdded;

    // Mapping from token to current Scene
    // map[Contract][tokenId] = Scene
    mapping (address => mapping (uint256 => string)) private _initialScene;

    ERC721Upgradeable private compicactus;

    function initialize(string memory domainSeparator) public initializer {

        _initializeEIP712(domainSeparator);

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }


    /**
    * @dev Set address for the compicactus PFP.
    * @param _compicactus - an URL to the metadata
    */
    function setPFP(address _compicactus) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to change PFP address");

        compicactus = ERC721Upgradeable(_compicactus);

        emit PFPSet(_compicactus);
    }


    function getScenes(address _contract, uint256 id, uint256 offset) public view returns (string[] memory) {

        string[] memory memoryArray = new string[](10);

        uint8 memi = 0;
        for(uint256 i = offset; i < _nftScenes[_contract][id].length; i++) {
            if (i > offset+10) break;
            memoryArray[memi] = _nftScenes[_contract][id][i];
            memi++;
        }

        return memoryArray;
    }


    function getScenesCount(address _contract, uint256 id) public view returns (uint256) {
        return _nftScenes[_contract][id].length;
    }


    function setInitialScene(address _contract, uint256 id, string memory scene)
        public
        isOwnerOrOperator(_contract, id)
    {

        _initialScene[_contract][id] = scene;

        emit InitialSceneSet(_contract, id, scene);
    }


    function getInitialScene(address _contract, uint256 id) public view returns (string memory) {

        return _initialScene[_contract][id];
    }


    function _addQuestion(address _contract, uint256 id, string memory scene, string memory question, string memory answer)
        private
    {

        if (keccak256(bytes(_nftQuestionAnswer[_contract][id][scene][question])) == keccak256(bytes(""))) {
            _nftQuestions[_contract][id][scene].push(question);
        }

        _nftQuestionAnswer[_contract][id][scene][question] = answer;

        if (!_sceneAdded[scene]) {
            _sceneAdded[scene] = true;
            _nftScenes[_contract][id].push(scene);
        }

        emit QuestionAdded(_contract, id, scene, question, answer);
    }


    function addQuestion(address _contract, uint256 id, string memory scene, string memory question, string memory answer)
        public
        isOwnerOrOperator(_contract, id)
    {

        _addQuestion(_contract, id, scene, question, answer);
    }


    function addQuestionBatch(address _contract, uint256 id, string memory scene, string[] memory questions, string[] memory answers)
        public
        isOwnerOrOperator(_contract, id)
    {
        require(questions.length == answers.length, "CompiBrain: array lengths must match");

        for(uint i = 0; i < questions.length; i++) {
            _addQuestion(_contract, id, scene, questions[i], answers[i]);
        }
    }


    function removeQuestion(address _contract, uint256 id, string memory scene, string memory question, uint256 questionId)
        public
        isOwnerOrOperator(_contract, id)
    {

        require(keccak256(bytes(_nftQuestions[_contract][id][scene][questionId])) == keccak256(bytes(question)), "CompiBrain: questionId is not pointing to the expected question");

        // Copy last element to the place of the to-remove element
        _nftQuestions[_contract][id][scene][questionId] = _nftQuestions[_contract][id][scene][ _nftQuestions[_contract][id][scene].length - 1 ];
        // Remove to-remove element
        _nftQuestions[_contract][id][scene].pop();

        emit QuestionRemoved(_contract, id, scene, question, questionId);
    }


    function switchQuestions(address _contract, uint256 id, string memory scene, uint256 questionId1, uint256 questionId2)
        public
        isOwnerOrOperator(_contract, id)
    {

        // Save element 1 on last place
        _nftQuestions[_contract][id][scene].push(_nftQuestions[_contract][id][scene][questionId1]);
        // Put element 2 in 1
        _nftQuestions[_contract][id][scene][questionId1] = _nftQuestions[_contract][id][scene][questionId2];
        // Copy last element to the place of element 2
        _nftQuestions[_contract][id][scene][questionId2] = _nftQuestions[_contract][id][scene][ _nftQuestions[_contract][id][scene].length - 1 ];
        // Remove to-remove element
        _nftQuestions[_contract][id][scene].pop();

        emit QuestionsSwitched(_contract, id, scene, questionId1, questionId1);
    }


    function getQuestions(address _contract, uint256 id, string memory scene, uint256 offset) public view returns (string[] memory) {

        string[] memory memoryArray = new string[](10);

        uint8 memi = 0;
        for(uint256 i = offset; i < _nftQuestions[_contract][id][scene].length; i++) {
            if (i > offset+10) break;
            memoryArray[memi] = _nftQuestions[_contract][id][scene][i];
            memi++;
        }

        return memoryArray;
    }


    function getQuestionsCount(address _contract, uint256 id, string memory scene) public view returns (uint256) {
        return _nftQuestions[_contract][id][scene].length;
    }


    function getAnswer(address _contract, uint256 id, string memory scene, string memory question) public view returns (string memory) {

        return _nftQuestionAnswer[_contract][id][scene][question];
    }


    function setFlag(address _contract, uint256 id, string memory flags) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to set flags");

        _nftFlag[_contract][id] = flags;

        emit FlagSet(_contract, id, flags);
    }


    function getFlag(address _contract, uint256 id) public view returns (string memory) {

        return _nftFlag[_contract][id];
    }


    function setOperator(address _contract, uint256 id, address operator)
        public
    {
        ERC721Upgradeable _erc721 = ERC721Upgradeable(_contract);
        bool is_owner = _erc721.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        _nftOperator[_contract][id] = operator;

        emit OperatorSet(_contract, id, operator);
    }


    function getOperator(address _contract, uint256 id) public view returns (address) {

        return _nftOperator[_contract][id];
    }


    function setName(address _contract, uint256 id, string memory name)
        public
        isOwnerOrOperator(_contract, id)
    {

        _nftName[_contract][id] = name;

        emit NameSet(_contract, id, name);
    }


    function getName(address _contract, uint256 id) public view returns (string memory) {

        return _nftName[_contract][id];
    }


    /**
    * @dev modifier to check if sender is owner or operator
    * @param _contract - token contract
    * @param id - token id
    */
    modifier isOwnerOrOperator(address _contract, uint256 id) {
        ERC721Upgradeable _erc721 = ERC721Upgradeable(_contract);
        bool is_owner = _erc721.ownerOf(id) == _msgSender() || _nftOperator[_contract][id] == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner or operator of the token");
        require(compicactus.balanceOf(_msgSender()) > 0, "CompiBrain: sender must own a Compicactus");

        _;
    }


    // Events


    /**
    * @dev Emits when owner add a question
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Unique name for the scene to add de question and answer
    * @param question - Unique question
    * @param answer - Answer for that question
    */
    event QuestionAdded(address _contract, uint256 id, string scene, string question, string answer);

    /**
    * @dev Emits when owner removes a question
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Unique name of the scene
    * @param question - String of the question
    * @param questionId - Id of the question in the array
    */
    event QuestionRemoved(address _contract, uint256 id, string scene, string question, uint256 questionId);

    /**
    * @dev Emits when owner switches 2 question
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Unique name of the scene
    * @param questionId1 - Id of the question 1 in the array
    * @param questionId2 - Id of the question 2 in the array
    */
    event QuestionsSwitched(address _contract, uint256 id, string scene, uint256 questionId1, uint256 questionId2);

    /**
    * @dev Emits when an admin flags a NFT
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param flags - A string with flags
    */
    event FlagSet(address _contract, uint256 id, string flags);

    /**
    * @dev Emits when an operator is set
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param operator - Operator's address
    */
    event OperatorSet(address _contract, uint256 id, address operator);

    /**
    * @dev Emits when the owner names the token
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param name - Name of the token
    */
    event NameSet(address _contract, uint256 id, string name);

    /**
    * @dev Emits when the owner sets current scene
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Name of the scene
    */
    event InitialSceneSet(address _contract, uint256 id, string scene);

    /**
    * @dev Emits when the PFP contract is set
    * @param _compicactus - ERC721 contract address
    */
    event PFPSet(address _compicactus);


    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead
    function _msgSender()
        internal
        override
        view
        returns (address sender) // Eibriel removed "payable"
    {
            return ContextMixin.msgSender();
    }
}
