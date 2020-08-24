import fs from "fs";
import path from "path";
import chalk from "chalk";

import { info, exitWithError } from "./logger";

const HOME = require("os").homedir();
const CONFIG_DIR_NAME = ".grandstack";
const grandStackName = "GRANDStack";

export const CONFIG_DIR = path.join(HOME, CONFIG_DIR_NAME);

export const exists = (pathToDirOrFile) => fs.existsSync(pathToDirOrFile);

export const dirIsNotEmpty = (dir) => fs.readdirSync(dir).length > 0;

export const dirExistsAndIsNotEmpty = (dir) =>
  exists(dir) && dirIsNotEmpty(dir);

export const createProfileJson = ({
  profile,
  neo4j_uri,
  neo4j_user,
  neo4j_password,
}) => {
  const profilePath = path.join(CONFIG_DIR, `${profile}.json`);
  const profileContents = { neo4j_uri, neo4j_user, neo4j_password };
  if (exists(profilePath)) {
    exitWithError({
      tag: `ALREADYEXISTS`,
      msg: `Profile ${chalk.italic(`${profile}.json`)} already exists`,
      code: 1,
    });
  }
  fs.writeFileSync(profilePath, JSON.stringify(profileContents));
  return profilePath;
};

export const createConfigDir = () => {
  if (dirExistsAndIsNotEmpty(CONFIG_DIR)) {
    info(`Skipping create, using current ${grandStackName} directory...`);
    return;
  }
  if (exists(CONFIG_DIR)) {
    info(`${grandStackName} directory exists at ${chalk.italic(CONFIG_DIR)}`);
    return;
  }
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.chmodSync(CONFIG_DIR, 0o700);
  info(`New ${grandStackName} directory created.`);
};

export const whereIsConfigDir = () => {
  if (exists(CONFIG_DIR)) {
    return `${grandStackName} directory exists at ${chalk.italic(CONFIG_DIR)}`;
  }
  return `${grandStackName} directory is missing from ${chalk.italic(HOME)}
Try running ${chalk.greenBright(`--init`)} for initial setup
`;
};
