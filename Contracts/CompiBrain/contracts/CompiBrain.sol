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

    // Mapping from token to muted boolean
    // map[Contract][tokenId][Scene][Question] = Boolean
    mapping (address => mapping (uint256 => mapping (string => mapping (string => bool)))) private _nftQuestionMuted;

    // Mapping from token to name
    // map[Contract][tokenId] = Name
    mapping (address => mapping (uint256 => string)) private _nftName;

    // Mapping from token to list of questions
    // map[Contract][tokenId][Scene] = Questions[]
    mapping (address => mapping (uint256 => mapping (string => string[]))) private _nftQuestions;


    function initialize() public initializer {

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }


    function addQuestion(address _contract, uint256 id, string memory scene, string memory question, string memory answer) public {

        ERC721Upgradeable _erc721 = ERC721Upgradeable(_contract);
        bool is_owner = _erc721.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        if (keccak256(bytes(_nftQuestionAnswer[_contract][id][scene][question])) == keccak256(bytes(""))) {
            console.log("Adding question");
            _nftQuestions[_contract][id][scene].push(question);
        }

        _nftQuestionAnswer[_contract][id][scene][question] = answer;

        emit QuestionAdded(_contract, id, scene, question, answer);
    }


    function removeQuestion(address _contract, uint256 id, string memory scene, string memory question, uint256 questionId) public {

        ERC721Upgradeable _erc721 = ERC721Upgradeable(_contract);
        bool is_owner = _erc721.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        require(keccak256(bytes(_nftQuestions[_contract][id][scene][questionId])) == keccak256(bytes(question)), "CompiBrain: questionId is not pointing to the expected question");

        // Move element to the end
        _nftQuestions[_contract][id][scene][questionId] = _nftQuestions[_contract][id][scene][ _nftQuestions[_contract][id][scene].length - 1 ];
        // Remove element
        _nftQuestions[_contract][id][scene].pop();

        emit QuestionRemoved(_contract, id, scene, question, questionId);
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


    function getAnswer(address _contract, uint256 id, string memory scene, string memory question) public view returns (string memory) {

        return _nftQuestionAnswer[_contract][id][scene][question];
    }

    function getQuestionsCount(address _contract, uint256 id, string memory scene) public view returns (uint256) {
        return _nftQuestions[_contract][id][scene].length;
    }

    function muteQuestion(address _contract, uint256 id, string memory scene, string memory question) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to mute question");

        _nftQuestionMuted[_contract][id][scene][question] = true;

        emit QuestionMuted(_contract, id, scene, question);
    }


    function unmuteQuestion(address _contract, uint256 id, string memory scene, string memory question) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to unmute question");

        _nftQuestionMuted[_contract][id][scene][question] = false;

        emit QuestionUnmuted(_contract, id, scene, question);
    }


    function isQuestionMuted(address _contract, uint256 id, string memory scene, string memory question) public view returns (bool) {

        return _nftQuestionMuted[_contract][id][scene][question];
    }


    function setName(address _contract, uint256 id, string memory name) public {
        ERC721Upgradeable _erc721 = ERC721Upgradeable(_contract);
        bool is_owner = _erc721.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        _nftName[_contract][id] = name;

        emit nameSet(_contract, id, name);
    }


    function getName(address _contract, uint256 id) public view returns (string memory) {

        return _nftName[_contract][id];
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
    * @param questionId - Id of the question in the array
    */
    event QuestionRemoved(address _contract, uint256 id, string scene, string question, uint256 questionId);

    /**
    * @dev Emits when an admin mute a question
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Unique name of the scene
    * @param question - Unique question
    */
    event QuestionMuted(address _contract, uint256 id, string scene, string question);

    /**
    * @dev Emits when an admin unmute a question
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param scene - Unique name of the scene
    * @param question - Unique question
    */
    event QuestionUnmuted(address _contract, uint256 id, string scene, string question);

    /**
    * @dev Emits when the owner names the token
    * @param _contract - ERC721 contract address
    * @param id - Id of the ERC721 token
    * @param name - Name of the token
    */
    event nameSet(address _contract, uint256 id, string name);


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
