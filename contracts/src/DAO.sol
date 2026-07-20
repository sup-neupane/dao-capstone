// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title DAO
/// @notice A minimal DAO for creating proposals, voting, and executing decisions.
/// @dev LEARNING PROJECT SCOPE: Membership is owner-controlled for simplicity.
///      A production DAO would likely let members vote to admit new members.
contract DAO {
    /// @notice The address that can add new members.
    address public owner;

    /// @notice Tracks which addresses are members of the DAO.
    mapping(address => bool) public isMember;

    /// @notice Total number of current members. Needed later for quorum/majority checks.
    uint256 public memberCount;

    event MemberAdded(address indexed member);

    error NotOwner();
    error AlreadyMember();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        isMember[msg.sender] = true;
        memberCount = 1;
    }

    /// @notice Adds a new member to the DAO. Owner-only for now.
    /// @param newMember The address to grant membership to.
    function addMember(address newMember) external onlyOwner {
        if (newMember == address(0)) revert ZeroAddress();
        if (isMember[newMember]) revert AlreadyMember();

        isMember[newMember] = true;
        memberCount++;

        emit MemberAdded(newMember);
    }
}