// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCurveLP is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 53210396180182321756579531);
    }

    function get_virtual_price() external pure returns (uint256) {
        return 1010559446149703280;
    }
}
