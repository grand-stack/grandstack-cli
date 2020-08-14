import fs from "fs";
import path from "path";
import chalk from "chalk";

export const exists = (pathToDirOrFile) => fs.existsSync(pathToDirOrFile);

export const dirIsNotEmpty = (dir) => fs.readdirSync(dir).length > 0;

export const dirExistsAndIsNotEmpty = (dir) =>
  exists(dir) && dirIsNotEmpty(dir);

export const HOME = require("os").homedir();

export const writeConfig = ({ neo4j_uri, neo4j_user, neo4j_password }) => {
  const configFilePath = path.join(HOME, ".grandstack");
  if (exists(configFilePath)) {
    console.log(chalk.green.italic(`Config Already Setup.`));
    return;
  }
  const contents = `
neo4j_uri=${neo4j_uri}
neo4j_user=${neo4j_user}
neo4j_password=${neo4j_password}
`;
  fs.writeFileSync(configFilePath, contents);
};
