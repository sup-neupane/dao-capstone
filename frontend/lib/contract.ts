import { daoAbi } from "./dao-abi";

// Update this if you redeploy — Anvil resets state on restart,
// which can (rarely) produce a different address depending on prior nonce usage.
export const DAO_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export const daoContract = {
  address: DAO_ADDRESS,
  abi: daoAbi,
} as const;
