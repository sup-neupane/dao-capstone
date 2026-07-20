// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {DAO} from "../src/DAO.sol";

contract DAOTest is Test {
    DAO dao;
    address owner = address(this);
    address alice = address(0x1);
    address bob = address(0x2);
    address stranger = address(0x3);

    function setUp() public {
        dao = new DAO();
        dao.addMember(alice);
        dao.addMember(bob);
        // owner, alice, bob = 3 members total. stranger is intentionally not a member.
    }

    // ---------- Membership ----------

    function test_OwnerIsMemberAfterDeploy() public view {
        assertTrue(dao.isMember(owner));
        assertEq(dao.memberCount(), 3);
    }

    function test_AddMember_RevertsIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert(DAO.NotOwner.selector);
        dao.addMember(stranger);
    }

    function test_AddMember_RevertsIfAlreadyMember() public {
        vm.expectRevert(DAO.AlreadyMember.selector);
        dao.addMember(alice);
    }

    function test_AddMember_RevertsOnZeroAddress() public {
        vm.expectRevert(DAO.ZeroAddress.selector);
        dao.addMember(address(0));
    }

    // ---------- Proposals ----------

    function test_Propose_CreatesProposalWithId1() public {
        vm.prank(alice);
        uint256 id = dao.propose("Fund the treasury");
        assertEq(id, 1);

        (string memory description,,,, bool executed) = dao.proposals(id);
        assertEq(description, "Fund the treasury");
        assertFalse(executed);
    }

    function test_Propose_RevertsIfNotMember() public {
        vm.prank(stranger);
        vm.expectRevert(DAO.NotMember.selector);
        dao.propose("Should fail");
    }

    function test_Propose_RevertsOnEmptyDescription() public {
        vm.prank(alice);
        vm.expectRevert(DAO.EmptyDescription.selector);
        dao.propose("");
    }

    // ---------- Voting ----------

    function test_Vote_RecordsForVote() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.prank(bob);
        dao.vote(id, true);

        (, , uint256 forVotes, uint256 againstVotes, ) = dao.proposals(id);
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);
    }

    function test_Vote_RevertsIfNotMember() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.prank(stranger);
        vm.expectRevert(DAO.NotMember.selector);
        dao.vote(id, true);
    }

    function test_Vote_RevertsIfAlreadyVoted() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.prank(bob);
        dao.vote(id, true);

        vm.prank(bob);
        vm.expectRevert(DAO.AlreadyVoted.selector);
        dao.vote(id, true);
    }

    function test_Vote_RevertsIfProposalNotFound() public {
        vm.prank(alice);
        vm.expectRevert(DAO.ProposalNotFound.selector);
        dao.vote(999, true);
    }

    function test_Vote_RevertsIfVotingClosed() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.warp(block.timestamp + 4 days); // past the 3-day VOTING_PERIOD

        vm.prank(bob);
        vm.expectRevert(DAO.VotingClosed.selector);
        dao.vote(id, true);
    }

    // ---------- Execution ----------

    function test_Execute_SucceedsWhenPassedWithQuorum() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        // 3 members total; need totalVotes*2 > 3, so 2 votes clears quorum
        vm.prank(alice);
        dao.vote(id, true);
        vm.prank(bob);
        dao.vote(id, true);

        vm.warp(block.timestamp + 4 days);
        dao.execute(id);

        (, , , , bool executed) = dao.proposals(id);
        assertTrue(executed);
    }

    function test_Execute_RevertsIfVotingStillOpen() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.expectRevert(DAO.VotingStillOpen.selector);
        dao.execute(id);
    }

    function test_Execute_RevertsIfQuorumNotMet() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        // only 1 vote cast out of 3 members: 1*2 = 2, not > 3 -> quorum fails
        vm.prank(alice);
        dao.vote(id, true);

        vm.warp(block.timestamp + 4 days);
        vm.expectRevert(DAO.QuorumNotMet.selector);
        dao.execute(id);
    }

    function test_Execute_RevertsIfDefeated() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.prank(alice);
        dao.vote(id, false);
        vm.prank(bob);
        dao.vote(id, false);

        vm.warp(block.timestamp + 4 days);
        vm.expectRevert(DAO.ProposalDefeated.selector);
        dao.execute(id);
    }

    function test_Execute_RevertsIfAlreadyExecuted() public {
        vm.prank(alice);
        uint256 id = dao.propose("Proposal A");

        vm.prank(alice);
        dao.vote(id, true);
        vm.prank(bob);
        dao.vote(id, true);

        vm.warp(block.timestamp + 4 days);
        dao.execute(id);

        vm.expectRevert(DAO.AlreadyExecuted.selector);
        dao.execute(id);
    }
}