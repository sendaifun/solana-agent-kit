// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract IdentityLinkedWallet is AccessControl, ReentrancyGuard {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");
    
    struct Identity {
        address userAddress;
        bytes32 identityHash;
        bool isActive;
    }
    
    mapping(bytes32 => Identity) public identities;
    mapping(address => bytes32[]) public userIdentities;
    
    event IdentityLinked(bytes32 indexed identityHash, address indexed userAddress);
    event IdentityUnlinked(bytes32 indexed identityHash, address indexed userAddress);
} 