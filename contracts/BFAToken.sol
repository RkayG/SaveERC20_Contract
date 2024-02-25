// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BFAToken {
    // Define token-specific variables
    string public name = "BFA Token"; // Token name
    string public symbol = "BFA"; // Token symbol
    uint8 public decimals = 18; // Decimal precision

    // Total supply of tokens (initialize in constructor)
    uint256 public totalSupply;

    // Mapping to store individual token balances
    mapping(address => uint256) public balances;

    // Mapping to track allowed transfer amounts (spender => owner => amount)
    mapping(address => mapping(address => uint256)) private allowances;

    // Event emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event emitted when allowance is changed
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // Initial constructor to set the total supply (modify here)
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** decimals; // Adjust for decimal precision
        balances[msg.sender] = totalSupply; // Grant total supply to deployer
    }

    // Function to get the balance of a specific account
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    // Function to transfer tokens from one address to another
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool) {
        // uint256 _burn_amount = amount / 10;
        require(
            balances[msg.sender] >= amount,
            "Insufficient balance"
        );
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    // Function to check the allowance of a spender for a specific owner
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256) {
        return allowances[owner][spender];
    }

    // Function to approve a spender to transfer tokens on the owner's behalf
    function approve(address spender, uint256 amount) external returns (bool) {
        require(
            balances[msg.sender] >= amount,
            "Cannot give allowance greater than balance"
        );
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // Function to transfer tokens from one address to another using an allowance
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        // Check if sender has enough balance or approved allowance
        // uint256 _burn_amount = amount / 10;
        require(
            balances[sender] >= amount &&
                allowances[sender][msg.sender] >= amount,
            "Insufficient funds or allowance"
        );

        // Update balances and allowance accordingly
        balances[sender] -= amount;
        allowances[sender][msg.sender] -= amount; // Decrement allowance if used

        // totalSupply -= _burn_amount;
        balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }
}
