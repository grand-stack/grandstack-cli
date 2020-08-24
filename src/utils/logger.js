import chalk from "chalk";

// Move to enum when convert to TS
// const errorTypes = [`CREDSMISSING`]

// Move to enum when convert to TS
// const warningTypes = [`CREDSMISSING`]

export const exitWithError = ({ tag, msg, code }) => {
  console.log(`%s :: ${msg}`, chalk.redBright(tag));
  process.exit(code);
};

export const exitWithWarning = ({ tag, msg, code }) => {
  console.log(`%s :: ${msg}`, chalk.yellow(tag));
  process.exit(code);
};

export const info = (msg) => {
  console.log(`%s :: ${msg}`, chalk.green("INFO"));
};

export const infoExitZero = (msg) => {
  info(msg);
  process.exit(0);
};
