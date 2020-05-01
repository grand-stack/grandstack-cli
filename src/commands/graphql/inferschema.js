const { makeAugmentedSchema, inferSchema } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");

export const command = "inferschema";
export const desc =
  "Generate GraphQL type definitions from an existing database";

/**
 * Inspect existing Neo4j database and generate GraphQL type definitions.

Options:
  * `--file` - the file to write the generated type definitions to, if not specified log to standard out
  * `--neo4j-uri`
  * `--neo4j-user`
  * `--neo4j-password`
  * `--start-server` - start GraphQL server using generated type definitions instead of writing to file
 */

export const builder = (yargs) => {
  yargs
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
    .option("encrypted", {
      description: "Use encrypted connection",
      boolean: true
    })
    .option("database", {
      description: "The Neo4j database to use"
    })
    .option("run-server", {
      description: "Start  GraphQL server after generating type definitions",
      boolean: true,
    }).example(`$0 graphql dev \\
  --types "type Person {name: string}" \\
  --neo4j-uri bolt://localhost:7687 \\
  --neo4j-user neo4j \\
  --neo4j-password letmein`);
};

export const handler = async ({
  "neo4j-uri": neo4j_uri,
  "neo4j-user": neo4j_user,
  "neo4j-password": neo4j_password,
  "graphql-port": graphql_port,
  "run-server": run_server,
  encrypted = false,
  database
}) => {
  const port = graphql_port || 3003;

  const driver = neo4j.driver(
    neo4j_uri,
    neo4j.auth.basic(neo4j_user, neo4j_password), {encrypted: `${encrypted ? "ENCRYPTION_ON" : "ENCRYPTION_OFF"}`}
  );

  const schemaInferenceOptions = {
    alwaysIncludeRelationships: false,
    database
  };

  const results = await inferSchema(driver, schemaInferenceOptions);

  if (run_server) {
    const server = new ApolloServer({
      schema: makeAugmentedSchema({ typeDefs: results.typeDefs }),
      context: ({ req }) => {
        return {
          driver,
          req,
          neo4jDatabase: database

        };
      },
    });

    server
      .listen(port, "0.0.0.0")
      .then(({ url }) => {
        console.log(`GraphQL API ready at ${url}`);
      })
      .catch((err) => console.error(err));
  } else {
    // TODO: check for type defs file option and write to file
    console.log(results.typeDefs);
    process.exit(0);
  }
};
