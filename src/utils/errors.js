import chalk from "chalk";

export const exitWithOutput = ({ tag, msg, code }) => {
  console.log(`%s :: ${msg}`, chalk.redBright(tag));
  process.exit(code);
};
