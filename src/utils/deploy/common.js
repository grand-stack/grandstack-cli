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
];
