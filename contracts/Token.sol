//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol;
    uint public decimals = 18;
    uint public totalSupply;

    // Track account balances
    mapping(address => uint) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint _value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint _totalSupply
    )
    
    {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint _value) public returns (bool success) {
        
        require(
            _to != address(0),
            "Transferring to zero address is not permitted"
        );

        require(
            balanceOf[msg.sender] >= _value,
            "Insufficient funds"
        );
        
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

}