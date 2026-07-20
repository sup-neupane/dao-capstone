import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const foundryArtifactPath = join(
  __dirname,
  "../../contracts/out/DAO.sol/DAO.json",
);
const outputPath = join(__dirname, "../lib/dao-abi.ts");

const artifact = JSON.parse(readFileSync(foundryArtifactPath, "utf-8"));

const fileContent = `// AUTO-GENERATED — do not edit by hand.
// Run \`bun run extract-abi\` to regenerate after changing DAO.sol.

export const daoAbi = ${JSON.stringify(artifact.abi, null, 2)} as const;
`;

writeFileSync(outputPath, fileContent);
console.log("ABI extracted to lib/dao-abi.ts");
