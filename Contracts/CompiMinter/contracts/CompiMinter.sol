//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/presets/ERC721PresetMinterPauserAutoIdUpgradeable.sol";
//import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";

import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";


contract CompiMinter is
    Initializable,
    AccessControlEnumerableUpgradeable,
    NativeMetaTransaction,
    ContextMixin
    {

    using SafeMathUpgradeable for uint256;

    ERC721PresetMinterPauserAutoIdUpgradeable private _tokenERC721;

    IERC20Upgradeable private _tokenERC20;

    // Mapping from address to boolean -> true if refund was used
    mapping (address => bool) private _accountDiscountUsed;

    // Mapping from address to amount of mints
    mapping (address => uint8) private _accountMintCount;

    address[] private _discountTokens;

    bool[] private _discountTokensIsERC1155;

    uint8 private _maxMintByAccount;

    uint256 private _startTime;

    uint256 private _endTime;

    uint256 private _multPrice;

    uint32 private _totalTokenAmount;

    uint256 private _tokenCount;


    function initialize(string memory domainSeparator) public initializer {

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _initializeEIP712(domainSeparator);

        setTimeWindow(block.timestamp, block.timestamp.add(2592000));

        setPrice(5000000000000000000);

        _maxMintByAccount = 100;

        _totalTokenAmount = 10010-14;
    }


    function setMaxSupply(uint32 maxSupply) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to set max supply");

        _totalTokenAmount = maxSupply;

        emit MaxSupplySet(maxSupply);
    }


    /**
    * @dev Max supply, minted count
    */
    function getSupply() public view returns(uint32 maxSupply, uint256 currentSupply) {
        return (_totalTokenAmount, _tokenCount);
    }


    function setDiscountTokens(address[] memory discountTokens, bool[] memory discountTokensIsERC1155) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to set price");
        require(discountTokens.length == discountTokensIsERC1155.length, "CompiMinter: array lengths must match");

        _discountTokens = discountTokens;

        _discountTokensIsERC1155 = discountTokensIsERC1155;

        emit DiscountTokensSet(discountTokens, discountTokensIsERC1155);
    }


    function setPrice(uint256 multPrice) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to set price");

        _multPrice = multPrice;

        emit PriceSet(multPrice);
    }


    function setTimeWindow(uint256 startTime, uint256 endTime) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to change end time");

        _startTime = startTime;

        _endTime = endTime;

        emit TimeWindowSet(startTime, endTime);
    }


    /**
    * @dev Get time window
    */
    function getTimeWindow() public view returns(uint256 startTime, uint256 endTime) {
        return (_startTime, _endTime);
    }


    function setERC20(IERC20Upgradeable tokenERC20) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to set token");

        _tokenERC20 = tokenERC20;

        emit ERC20Set(tokenERC20);
    }


    function setERC721(ERC721PresetMinterPauserAutoIdUpgradeable tokenERC721) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to set PFP contract");

        _tokenERC721 = tokenERC721;

        emit ERC721Set(_tokenERC721);
    }


    function getPrice(address for_account) public view returns(uint256 _price, bool use_discount) {
        //
        bool willUseDiscount = false;
        uint256 tmpPrice = _multPrice;

        if (!_accountDiscountUsed[for_account]) {
            for(uint i = 0; i < _discountTokens.length; i++) {
                if (_discountTokensIsERC1155[i]) {
                    ERC1155PresetMinterPauserUpgradeable _contract = ERC1155PresetMinterPauserUpgradeable(_discountTokens[i]);
                    if (_contract.balanceOf(for_account, 0)>0) {
                        willUseDiscount = true;
                        break;
                    }
                } else {
                    ERC721PresetMinterPauserAutoIdUpgradeable _contract = ERC721PresetMinterPauserAutoIdUpgradeable(_discountTokens[i]);
                    if (_contract.balanceOf(for_account)>0) {
                        willUseDiscount = true;
                        break;
                    }
                }
            }
        }

        if (!willUseDiscount) {
            // Price not cut in half
            tmpPrice = tmpPrice.mul(2);
        }
        //
        return (tmpPrice, willUseDiscount);
    }


    /**
    * @dev Get price, setting the discount as used.
    */
    function _getPrice() private returns(uint256 _price) {
        (uint256 tmpPrice, bool willUseDiscount) = getPrice(_msgSender());

        // Mark discount as used
        if (willUseDiscount) {
            _accountDiscountUsed[_msgSender()] = true;
        }

        return tmpPrice;
    }


    /**
    * @dev Is time window open?
    */
    function isWindowOpen() public view returns(bool use_discount) {
        if (block.timestamp > _startTime && block.timestamp < _endTime){
            return true;
        } else {
            return false;
        }
    }


    /**
    * @dev Mints a new Compi from an id.
    */
    function mintCompi(uint256 maxPrice)
        external
        price(_getPrice(), maxPrice)
    {
        require(!_tokenERC721.paused(), "CompiMinter: token mint while paused");
        require(block.timestamp > _startTime, "CompiMinter: minting event not started");
        require(block.timestamp < _endTime, "CompiMinter: minting event ended");
        require(_tokenCount < _totalTokenAmount, "CompiMinter: contract mint limit reached");
        require(_accountMintCount[_msgSender()] < _maxMintByAccount, "CompiMinter: max mints reached");

        _tokenCount = _tokenCount.add(1);

        _accountMintCount[_msgSender()] += 1;

        _tokenERC721.mint(_msgSender());
    }


    /*
    * @dev Remove all Ether from the contract, and transfer it to account of owner
    */
    function withdrawBalance() external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CompiMinter: must have admin role to withdraw");
        uint256 balance = _tokenERC20.balanceOf(address(this));
        _tokenERC20.transfer(_msgSender(), balance);

        emit Withdraw(balance);
    }

    // Modifiers


    /**
    * @dev modifier Associete fee with a function call. If the caller sent too much, then is discounted, but only after the function body.
    * This was dangerous before Solidity version 0.4.0, where it was possible to skip the part after `_;`.
    * @param _amount - ether needed to call the function
    */
    modifier price(uint256 _amount, uint256 maxPrice) {
        require(maxPrice >= _amount, "CompiMinter: price exceedes maxPrice");
        require(_tokenERC20.balanceOf(_msgSender()) >= _amount, "CompiMinter: Not enough ERC20 tokens.");
        require(_tokenERC20.allowance(_msgSender(), address(this)) >= _amount, "CompiMinter: Not enough ERC20 token allowance.");

        _;

        _tokenERC20.transferFrom(_msgSender(), address(this), _amount);
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



    /* Events */

    /**
    * @dev Emits when owner take ETH out of contract
    * @param balance - amount of ETh sent out from contract
    */
    event Withdraw(uint256 balance);

    /**
    * @dev Emits when discount tokens are set
    * @param discountTokens - array of ERC721 or ERC1155 address
    * @param discountTokensIsERC1155 - array of boolean. True if token is ERC1155
    */
    event DiscountTokensSet(address[] discountTokens, bool[] discountTokensIsERC1155);

    /**
    * @dev Emits when a new price is set
    * @param multPrice - a multiplier for the price
    */
    event PriceSet(uint256 multPrice);

    /**
    * @dev Emits when a new max supply is set
    * @param maxSupply - max amount of tokens to mint
    */
    event MaxSupplySet(uint256 maxSupply);

    /**
    * @dev Emits when the contract URI is set
    * @param contractURI - an URL to the metadata
    */
    event ContractURISet(string contractURI);

    /**
    * @dev Emits when the start and end time are set
    * @param startTime - the event start time
    * @param endTime - the event end time
    */
    event TimeWindowSet(uint256 startTime, uint256 endTime);

    /**
    * @dev Emits when the minting ERC721 contract address is set
    * @param tokenERC721 - an address to the minting ERC721 contract
    */
    event ERC721Set(IERC721Upgradeable tokenERC721);

    /**
    * @dev Emits when the payment ERC20 contract address is set
    * @param tokenERC20 - an address to the payment ERC20 contract
    */
    event ERC20Set(IERC20Upgradeable tokenERC20);
}
