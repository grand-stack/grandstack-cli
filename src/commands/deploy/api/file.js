const fs = require("fs");
const path = require("path");

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
    });
};

export const handler = ({ types, path: filePath }) => {
  // FIXME: add options to create a new project or just write a schema.graphql file
  // currently we only write schema.graphql file

  const schemaFile = path.join(filePath, "schema.graphql");
  console.log("Writing to ", schemaFile);

  try {
    fs.writeFileSync(schemaFile, types);
    console.log("Done writing!");
  } catch (err) {
    console.log(err.message);
  }
};
