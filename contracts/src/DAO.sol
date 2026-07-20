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
    struct Proposal {
        string description;
        uint256 deadline;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    /// @notice Fixed voting window for every proposal. Simplification for v1.
    uint256 public constant VOTING_PERIOD = 3 days;

    /// @notice All proposals, indexed by id. Id 0 is unused/invalid on purpose.
    mapping(uint256 => Proposal) public proposals;

    /// @notice Next proposal id to assign. Starts at 1.
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 deadline);

    error NotMember();
    error EmptyDescription();

    modifier onlyMember() {
        if (!isMember[msg.sender]) revert NotMember();
        _;
    }

    /// @notice Creates a new proposal. Only members may propose.
    /// @param description Human-readable text describing what's being proposed.
    /// @return id The id of the newly created proposal.
    function propose(string calldata description) external onlyMember returns (uint256 id) {
        if (bytes(description).length == 0) revert EmptyDescription();

        proposalCount++;
        id = proposalCount;

        proposals[id] = Proposal({
            description: description,
            deadline: block.timestamp + VOTING_PERIOD,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });

        emit ProposalCreated(id, msg.sender, description, proposals[id].deadline);
    }
    /// @notice Tracks whether an address has already voted on a given proposal.
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event VoteCast(uint256 indexed id, address indexed voter, bool support);

    error ProposalNotFound();
    error VotingClosed();
    error AlreadyVoted();

    /// @notice Casts a vote on an active proposal. Only members may vote, once each.
    /// @param id The proposal id.
    /// @param support True for a "yes" vote, false for "no".
    function vote(uint256 id, bool support) external onlyMember {
        Proposal storage p = proposals[id];

        if (p.deadline == 0) revert ProposalNotFound();
        if (block.timestamp > p.deadline) revert VotingClosed();
        if (hasVoted[id][msg.sender]) revert AlreadyVoted();

        hasVoted[id][msg.sender] = true;

        if (support) {
            p.forVotes++;
        } else {
            p.againstVotes++;
        }

        emit VoteCast(id, msg.sender, support);
    }
    /// @notice Minimum fraction of members who must vote for a proposal to be executable.
    /// @dev Expressed as a divisor: memberCount / QUORUM_DIVISOR must be exceeded by total votes cast.
    uint256 public constant QUORUM_DIVISOR = 2; // i.e. more than 50% participation required

    event ProposalExecuted(uint256 indexed id);

    error VotingStillOpen();
    error AlreadyExecuted();
    error ProposalDefeated();
    error QuorumNotMet();

    /// @notice Executes a proposal if voting has closed, quorum was met, and it passed.
    /// @param id The proposal id.
    function execute(uint256 id) external {
        Proposal storage p = proposals[id];

        if (p.deadline == 0) revert ProposalNotFound();
        if (block.timestamp <= p.deadline) revert VotingStillOpen();
        if (p.executed) revert AlreadyExecuted();

        uint256 totalVotes = p.forVotes + p.againstVotes;
        if (totalVotes * QUORUM_DIVISOR <= memberCount) revert QuorumNotMet();

        if (p.forVotes <= p.againstVotes) revert ProposalDefeated();

        p.executed = true;

        emit ProposalExecuted(id);
    }
}