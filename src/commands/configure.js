import {
  checkCredentials,
  createConfigDir,
  infoExitZero,
  whereIsConfigDir,
  createProfileJson,
} from "../utils/";

export const command = "configure";
export const desc = "Setup configuration options for CLI";

export const builder = (yargs) => {
  yargs
    .option("init", {
      alias: "i",
      description: "Initialize configuration",
      type: "boolean",
      default: false,
    })
    .option("where-is", {
      alias: "w",
      description: "The current path to your configuration directory",
      type: "boolean",
      default: false,
    })
    .option("profile", {
      alias: "p",
      description: "Create a new named profile",
      type: "string",
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
    }).example(`$0 configure \\
    --neo4j-uri bolt://localhost:7687 \\
    --neo4j-user neo4j \\
    --neo4j-password letmein \\
    --new-profile graph-test`);
};

export const handler = async ({
  profile,
  whereIs,
  init,
  "neo4j-uri": neo4j_uri,
  "neo4j-user": neo4j_user,
  "neo4j-password": neo4j_password,
}) => {
  if (whereIs) {
    infoExitZero(whereIsConfigDir());
  }

  if (init) {
    createConfigDir();
    infoExitZero(whereIsConfigDir());
  }

  if (profile) {
    checkCredentials(neo4j_uri, neo4j_user, neo4j_password);
    // TODO: no creds run enquirer
    // How to handle low level versus interactive
    createConfigDir();
    const profilePath = createProfileJson({
      profile,
      neo4j_uri,
      neo4j_user,
      neo4j_password,
    });
    infoExitZero(`Profile created at ${profilePath}`);
  }
};
