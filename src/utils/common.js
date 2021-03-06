import { getPackageLockJson } from "./file";

export const getNeo4jDatabaseString = (db) => {
  return db ? `{ driver, neo4jDatabase: "${db}" }` : "{ driver }";
};

export const getEncryptionKeyString = (encrypted) => {
  return encrypted ? ", {encrypted: 'ENCRYPTION_ON'}" : "";
};

const schemaGraphql = "schema.graphql";

const gitIgnore = ".gitignore";
const gitIgnoreContents = `.env
node_modules
`;

const indexJs = "index.js";
const indexJsContents = (
  database,
  encrypted
) => `const { makeAugmentedSchema } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env

const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql")).toString("utf-8");

const schema = makeAugmentedSchema({typeDefs})
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)${getEncryptionKeyString(
    encrypted
  )}
)

const server = new ApolloServer({ schema, context: ${getNeo4jDatabaseString(
  database
)} });

server.listen(3000, "0.0.0.0").then(({ url }) => {
  console.log("GraphQL API ready at: ", url);
});
`;

const packageJson = "package.json";
const packageJsonContents = `{
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "neo4j-graphql-js": "^2.14.4",
    "apollo-server": "^2.15.1",
    "dotenv": "^8.2.0"
  }
}
`;

const packageLockJson = "package-lock.json";
const packageLockJsonContents = getPackageLockJson();

export const arrayOfFiles = ({ owner, repo, types, database, encrypted }) => [
  {
    owner,
    repo,
    content: types,
    filename: schemaGraphql,
  },
  {
    owner,
    repo,
    content: indexJsContents(database, encrypted),
    filename: indexJs,
  },
  {
    owner,
    repo,
    content: gitIgnoreContents,
    filename: gitIgnore,
  },
  {
    owner,
    repo,
    content: packageJsonContents,
    filename: packageJson,
  },
  {
    owner,
    repo,
    content: packageLockJsonContents,
    filename: packageLockJson,
  },
];

export const checkCredentials = (neo4j_uri, neo4j_user, neo4j_password) => {
  if (!neo4j_uri || !neo4j_user || !neo4j_password) {
    const msg = `Try running agian with credentials \\
--neo4j-uri bolt://localhost:7687 \\
--neo4j-user neo4j \\
--neo4j-password letmein
`;
    console.log(`PARAMSMISSING :: ${msg}`);
    process.exit(9);
  }
};

export const checkGHRef = (repoName, repoOwner) => {
  if (!repoName || !repoOwner) {
    const msg = `
    Syncing a repository requires the owners username and repo name \\
    Try running agian with \\
    --repo-name awesome-repo-name \\
    --repo-owner greatUsername1 \\
`;
    console.log(`PARAMSMISSING :: ${msg}`);
    process.exit(9);
  }
};
