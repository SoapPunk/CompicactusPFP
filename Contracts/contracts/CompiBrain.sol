//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import { CompicactusPFP } from "./CompicactusPFP.sol";

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

        CompicactusPFP _cpfpContract = CompicactusPFP(_contract);
        bool is_owner = _cpfpContract.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        if (keccak256(bytes(_nftQuestionAnswer[_contract][id][scene][question])) == keccak256(bytes(""))) {
            console.log("Adding question");
            _nftQuestions[_contract][id][scene].push(question);
        }

        _nftQuestionAnswer[_contract][id][scene][question] = answer;
    }


    function removeQuestion(address _contract, uint256 id, string memory scene, uint256 questionId) public {

        // Move element to the end
        _nftQuestions[_contract][id][scene][questionId] = _nftQuestions[_contract][id][scene][ _nftQuestions[_contract][id][scene].length - 1 ];
        // Remove element
        _nftQuestions[_contract][id][scene].pop();
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
    }


    function unmuteQuestion(address _contract, uint256 id, string memory scene, string memory question) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to unmute question");

        _nftQuestionMuted[_contract][id][scene][question] = false;
    }


    function isQuestionMuted(address _contract, uint256 id, string memory scene, string memory question) public view returns (bool) {

        return _nftQuestionMuted[_contract][id][scene][question];
    }


    function setName(address _contract, uint256 id, string memory name) public {
        CompicactusPFP _cpfpContract = CompicactusPFP(_contract);
        bool is_owner = _cpfpContract.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        _nftName[_contract][id] = name;
    }


    function getName(address _contract, uint256 id) public view returns (string memory) {

        return _nftName[_contract][id];
    }


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
