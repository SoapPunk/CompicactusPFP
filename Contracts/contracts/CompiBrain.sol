//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import { CompicactusPFP } from "./CompicactusPFP.sol";

import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";

// TODO get question list / create events / remove question

contract CompiBrain is
    Initializable,
    AccessControlEnumerableUpgradeable,
    NativeMetaTransaction,
    ContextMixin
    {

    // Mapping from token+question to answer
    mapping (string => string) private _nftQuestionAnswer;

    // Mapping from token to muted boolean
    mapping (string => bool) private _nftQuestionMuted;

    // Mapping from token to name
    mapping (string => string) private _nftName;

    // Mapping from token to list of questions
    mapping (string => string[]) private _nftQuestions;


    function initialize() public initializer {

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function createQuestionId(address _contract, uint256 id, string memory question) private pure returns (string memory) {

        string memory questionId = string(abi.encodePacked(_contract, "-", id, "-", question));

        return questionId;
    }

    function addQuestion(address _contract, uint256 id, string memory question, string memory answer) public {

        CompicactusPFP _cpfpContract = CompicactusPFP(_contract);
        bool is_owner = _cpfpContract.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        string memory questionId = createQuestionId(_contract, id, question);

        if (keccak256(bytes(_nftQuestionAnswer[questionId])) == keccak256(bytes(""))) {
            console.log("Adding question");
            string memory tokenId = createQuestionId(_contract, id, "");
            _nftQuestions[tokenId].push(question);
        }

        _nftQuestionAnswer[questionId] = answer;

    }

    function removeQuestion(address _contract, uint256 id, uint256 questionId) public {
        string memory tokenId = createQuestionId(_contract, id, "");

        // Move element to the end
        _nftQuestions[tokenId][questionId] = _nftQuestions[tokenId][_nftQuestions[tokenId].length - 1];
        // Remove element
        _nftQuestions[tokenId].pop();
    }

    function getQuestions(address _contract, uint256 id) public view returns (string[] memory) {
        string memory tokenId = createQuestionId(_contract, id, "");

        string[] memory memoryArray = new string[](10);

        for(uint8 i = 0; i < _nftQuestions[tokenId].length; i++) {
            if (i > 10) break;
            memoryArray[i] = _nftQuestions[tokenId][i];
        }

        return memoryArray;
    }

    function getQuestion(address _contract, uint256 id, string memory question) public view returns (string memory) {

        string memory questionId = createQuestionId(_contract, id, question);

        return _nftQuestionAnswer[questionId];
    }

    function muteQuestion(address _contract, uint256 id, string memory question) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to mute question");

        string memory questionId = createQuestionId(_contract, id, question);

        _nftQuestionMuted[questionId] = true;
    }

    function unmuteQuestion(address _contract, uint256 id, string memory question) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiBrain: must have admin role to unmute question");

        string memory questionId = createQuestionId(_contract, id, question);

        _nftQuestionMuted[questionId] = false;
    }

    function isQuestionMuted(address _contract, uint256 id, string memory question) public view returns (bool) {
        string memory questionId = createQuestionId(_contract, id, question);

        return _nftQuestionMuted[questionId];
    }

    function setName(address _contract, uint256 id, string memory name) public {
        CompicactusPFP _cpfpContract = CompicactusPFP(_contract);
        bool is_owner = _cpfpContract.ownerOf(id) == _msgSender();
        require(is_owner, "CompiBrain: sender must be the owner of the token");

        string memory questionId = createQuestionId(_contract, id, "");

        _nftName[questionId] = name;
    }

    function getName(address _contract, uint256 id) public view returns (string memory) {

        string memory questionId = createQuestionId(_contract, id, "");

        return _nftName[questionId];
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
