//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CompiBrain is Initializable {
    string private greeting;

    // Mapping from contract to enabled boolean
    mapping (address => bool) private _nftContractEnabled;

    // Mapping from token+question to answer
    mapping (string => string) private _nftQuestionAnswer;

    // Mapping from token to muted boolean
    mapping (string => bool) private _nftQuestionMuted;

    // Mapping from token to name
    mapping (string => string) private _nftName;


    function initialize(string memory _greeting) public initializer {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }


    function enableContract(address _contract) public {
        console.log("Enabling contract '%s'", _contract);

        _nftContractEnabled[_contract] = true;
    }

    function disableContract(address _contract) public {
        console.log("Disabling contract '%s'", _contract);

        _nftContractEnabled[_contract] = false;
    }

    function isContractEnabled(address _contract) public view returns (bool) {
        return _nftContractEnabled[_contract];
    }

    function createQuestionId(address _contract, uint256 id, string memory question) private view returns (string memory) {

        string memory questionId = string(abi.encodePacked(_contract, "-", id, "-", question));

        return questionId;
    }

    function addQuestion(address _contract, uint256 id, string memory question, string memory answer) public {

        string memory questionId = createQuestionId(_contract, id, question);

        _nftQuestionAnswer[questionId] = answer;
    }

    function getQuestion(address _contract, uint256 id, string memory question) public view returns (string memory) {

        string memory questionId = createQuestionId(_contract, id, question);

        return _nftQuestionAnswer[questionId];
    }

    function muteQuestion(address _contract, uint256 id, string memory question) public {
        string memory questionId = createQuestionId(_contract, id, question);

        _nftQuestionMuted[questionId] = true;
    }

    function unmuteQuestion(address _contract, uint256 id, string memory question) public {
        string memory questionId = createQuestionId(_contract, id, question);

        _nftQuestionMuted[questionId] = false;
    }

    function isQuestionMuted(address _contract, uint256 id, string memory question) public view returns (bool) {
        string memory questionId = createQuestionId(_contract, id, question);

        return _nftQuestionMuted[questionId];
    }

    function setName(address _contract, uint256 id, string memory name) public {
        string memory questionId = createQuestionId(_contract, id, "");

        _nftName[questionId] = name;
    }

    function getName(address _contract, uint256 id) public view returns (string memory) {

        string memory questionId = createQuestionId(_contract, id, "");

        return _nftName[questionId];
    }

}
