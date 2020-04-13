const { makeAugmentedSchema } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");

export const command = "graphql";
export const desc = "Start GraphQL service";
export const builder = {};

export const handler = () => {
  const typeDefs = `type Person {name: String}`;

  const schema = makeAugmentedSchema({ typeDefs });

  const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "letmin")
  );

  const server = new ApolloServer({ schema, context: { driver } });

  server.listen(3003, "0.0.0.0").then(({ url }) => {
    console.log(`GraphQL API ready at ${url}`);
  });
};
