// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint public feePercent;

    mapping(address => mapping(address => uint)) public tokens;

    event Deposit(
        address _token,
        address _user,
        uint _amount,
        uint _balance
    );

    event Withdraw(
        address _token,
        address _user,
        uint _amount,
        uint _balance
    );

    constructor(address _feeAccount, uint _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        emit Deposit(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function withdrawToken(address _token, uint _amount) public {
        Token(_token).transfer(msg.sender, _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        emit Withdraw(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function balanceOf(address _token, address _user) public view returns (uint) {
        return tokens[_token][_user];
    }
}