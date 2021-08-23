// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/presets/ERC721PresetMinterPauserAutoIdUpgradeable.sol";

contract CompicactusPFP is
    ERC721PresetMinterPauserAutoIdUpgradeable
{

    string private _contractURI;

    //function initialize(string memory _name, string memory symbol, string memory baseURI, string memory domainSeparator) initializer public override {
    //    __ERC721PresetMinterPauserAutoId_init(_name, symbol, baseURI);

        /*
        _initializeEIP712(domainSeparator);
        _tokenCount = 0;

        uint256 _startTime = block.timestamp;
        setEndTime(_startTime.add(2592000));
        setPrice(5000000000000000000); // 5 Matic

        _maxVotes = 10;

        _totalArtworkAmount = 4096;
        _totalTokenAmount = 1024;

        _maxMintByAccount = 16;
        */

    //    setContractURI("ipfs://contract-metadata");
    //}

    /**
    * @dev Get the URL to a JSON file with contract metadata for OpenSea.
    */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
    * @dev Set the URL to a JSON file with contract metadata for OpenSea.
    * @param __contractURI - an URL to the metadata
    */
    function setContractURI(string memory __contractURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompicactusPFP: must have admin role to change contract uri");

        _contractURI = __contractURI;

        emit ContractURISet(__contractURI);
    }


    /* EVENTS */

    /**
    * @dev Emits when the contract URI is set
    * @param contractURI - an URL to the metadata
    */
    event ContractURISet(string contractURI);

}
