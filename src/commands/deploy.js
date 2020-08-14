export const command = "deploy";
export const aliases = [];
export const desc = "Deployment options for GRANDstack";

export const builder = (yargs) =>
  yargs.commandDir("./deploy", { recurse: true }).demandCommand().argv;
