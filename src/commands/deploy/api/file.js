import fs from "fs";
import path from "path";

import { dirExistsAndIsNotEmpty } from "../../../utils";

export const command = "file";
export const desc = "Export project to filesystem";

export const builder = (yargs) => {
  yargs
    .option("types", {
      description: "The GraphQL type definitions",
      required: true,
    })
    .option("path", {
      description: "The path to write the project to",
      required: true,
    })
    .option("new-project", {
      description: "Whether or not to write a new project",
      type: "boolean",
      default: false,
    })
    .option("neo4j-uri", {
      description:
        'URI for the Neo4j instance. Example: "bolt://localhost:7798"',
      type: "string",
    })
    .option("neo4j-user", {
      description: "Database user",
      type: "string",
    })
    .option("neo4j-password", {
      description: "Database password for given user",
      type: "string",
    })
    .option("encrypted", {
      description: "Whether or not to encrypt the database",
      type: "boolean",
      default: false,
    })
    .option("database", {
      description: "The Neo4j database to use",
    }).example(`$0 deploy file \\
    --types "type Person {name: string}" \\
    --path ./relative/path \\
    --neo4j-uri bolt://localhost:7687 \\
    --neo4j-user neo4j \\
    --neo4j-password letmein \\
    --database neo4j \\
    --encrypted \\
    --new-project`);
};

const getNeo4jDatabaseString = (db) => {
  return db ? `neo4jDatabase: "${db}"` : "";
};

export const handler = async ({
  types,
  path: filePath,
  newProject,
  "neo4j-uri": neo4j_uri,
  "neo4j-user": neo4j_user,
  "neo4j-password": neo4j_password,
  encrypted,
  database,
}) => {
  if (dirExistsAndIsNotEmpty(filePath)) {
    console.log(`ERROR :: '${filePath}' already exists and is not empty.`);
    process.exit(1);
  }
  if (newProject) {
    if (!neo4j_uri || !neo4j_user || !neo4j_password) {
      console.error(`ERROR :: Neo4j credentials missing`);
      console.log(`Try running agian with credentials \\
      --neo4j-uri bolt://localhost:7687 \\
      --neo4j-user neo4j \\
      --neo4j-password letmein \\
      --database neo4j`);
      process.exit(9);
    }

    const schemaFile = path.join(filePath, "schema.graphql");
    const envFile = path.join(filePath, ".env");
    const envContents = `NEO4J_URI=${neo4j_uri}
NEO4J_USER=${neo4j_user}
NEO4J_PASSWORD=${neo4j_password}
`;
    const gitIgnoreFile = path.join(filePath, ".gitignore");
    const gitIgnoreContents = `.env
node_modules
`;
    const indexFile = path.join(filePath, "index.js");
    const indexContents = `const { makeAugmentedSchema } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD} = process.env

const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql")).toString("utf-8");

const schema = makeAugmentedSchema({typeDefs})
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)${
    encrypted ? ", {encrypted: 'ENCRYPTION_ON'}" : ""
  }
)

const server = new ApolloServer({ schema, context: { driver, ${getNeo4jDatabaseString(
      database
    )} } });

server.listen(3000, "0.0.0.0").then(({ url }) => {
  console.log("GraphQL API ready at: ", url);
});
`;
    const jsonFile = path.join(filePath, "package.json");
    const jsonContents = `{
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
    const jsonLockFile = path.join(filePath, "package-lock.json");
    const jsonLockContents = `{
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
    console.log(`Writing new project to  ${schemaFile}`);
    try {
      await fs.promises.mkdir(filePath, { recursive: true });
      await fs.promises.writeFile(schemaFile, types);
      await fs.promises.writeFile(envFile, envContents);
      await fs.promises.writeFile(gitIgnoreFile, gitIgnoreContents);
      await fs.promises.writeFile(indexFile, indexContents);
      await fs.promises.writeFile(jsonFile, jsonContents);
      await fs.promises.writeFile(jsonLockFile, jsonLockContents);
      console.log("Done Writing!");
      console.log(`cd into ${filePath} and run 'npm install'`);
    } catch (error) {
      console.error(`ERROR :: ${error}`);
      process.exit(1);
    }
    return;
  }

  try {
    // Not new project, file write
    const schemaFile = path.join(filePath, "schema.graphql");
    console.log("Writing to ", schemaFile);
    await fs.promises.mkdir(filePath, { recursive: true });
    await fs.promises.writeFile(schemaFile, types);
    console.log("Done Writing!");
  } catch (error) {
    console.error(`ERROR :: ${error}`);
    process.exit(1);
  }
};
