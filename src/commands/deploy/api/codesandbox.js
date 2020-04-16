import { getParameters } from "codesandbox/lib/api/define";
import { inferSchema } from "neo4j-graphql-js";
import axios from "axios";
const neo4j = require("neo4j-driver")

export const command = "codesandbox";
export const desc = "Deploy to new CodeSandbox instance";

export const builder = (yargs) => {
  yargs
    .option("types", {
      description:
        "The GraphQL type definitions. If not specified an inferred schema will be used.",
      required: false,
    })
    .option("neo4j-uri", {
      description:
        'URI for the Neo4j instance. Example: "bolt://localhost:7798"',
      required: true,
    })
    .option("neo4j-user", {
      description: "Database user",
      required: true,
    })
    .option("neo4j-password", {
      description: "Database password for given user",
      required: true,
    })
    .option("graphql-port", {
      description: "The port for the GraphQL API to listen on",
      type: "number",
    }).example(`$0 graphql dev \\
    --types "type Person {name: string}" \\
    --neo4j-uri bolt://localhost:7687 \\
    --neo4j-user neo4j \\
    --neo4j-password letmein`);
};

// if no types option provided, then use inferSchema
const getInferredTypes = async (neo4jUri, neo4jUser, neo4jPassword) => {
  const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUser, neo4jPassword)
  );

  const schemaInferenceOptions = {
    alwaysIncludeRelationships: false,
  };

  const results = await inferSchema(driver, schemaInferenceOptions);
  return results.typeDefs;
};

export const handler = async ({
  neo4JUri,
  neo4JUser,
  neo4JPassword,
  types
}) => {
  if (!types) {
    types = await getInferredTypes(neo4JUri, neo4JUser, neo4JPassword)
  }
  const parameters = getParameters({
    files: {
      ".env": {
        content: `
NEO4J_URI=${neo4JUri}
NEO4J_USER=${neo4JUser}
NEO4J_PASSWORD=${neo4JPassword}`,
      },
      "schema.graphql": {
        content: `${types}`,
      },
      "index.js": {
        content: /* JavaScript */ `      
const { makeAugmentedSchema } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql")).toString("utf-8");

const schema = makeAugmentedSchema({typeDefs})
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
)

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3000, "0.0.0.0").then(({ url }) => {
  console.log("GraphQL API ready");
});`,
      },
      "package.json": {
        content: {
          scripts: {
            start: "node index.js",
          },
          dependencies: {
            "neo4j-graphql-js": "^2.13.0",
            "apollo-server": "^2.12.0",
            dotenv: "^8.2.0",
          },
        },
      },
    },
  });

  const url = `https://codesandbox.io/api/v1/sandboxes/define?json=1&parameters=${parameters}`;
 
  try {
    const response = await axios.get(url);
    
    const sandbox_id = response.data.sandbox_id;

    const sandbox_url = `https://codesandbox.io/s/${sandbox_id}`;
    const _res = await axios.get(sandbox_url);
    const graphql_url = `https://${sandbox_id}.sse.codesandbox.io`;

    console.log("GraphQL API deployed to new CodeSandbox instance");
    console.log(`Access your CodeSandbox instance here: ${sandbox_url}`);
    console.log(`GraphQL endpoint: ${graphql_url}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);

  }
};
