// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;

contract Exchange {
    address public feeAccount;
    uint public feePercent;

    constructor(address _feeAccount, uint _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}