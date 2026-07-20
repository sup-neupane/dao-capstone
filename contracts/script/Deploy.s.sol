// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {DAO} from "../src/DAO.sol";

contract DeployScript is Script {
    function run() external returns (DAO) {
        // Reads the deployer's private key from an environment variable.
        // NEVER hardcode a private key in this file.
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        DAO dao = new DAO();
        vm.stopBroadcast();

        console.log("DAO deployed at:", address(dao));
        return dao;
    }
}