export const command = "api";
export const aliases = [];
export const desc = "Deploy GraphQL API";

export const builder = (yargs) =>
  yargs.commandDir("./api", { recurse: true }).demandCommand().argv;
