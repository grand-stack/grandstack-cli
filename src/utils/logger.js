import chalk from "chalk";

// Move to enum when convert to TS
// const errorTypes = [`CREDSMISSING`]

// Move to enum when convert to TS
// const warningTypes = [`CREDSMISSING`]

export const exitWithError = ({ tag, msg, code, display = false }) => {
  if (display) {
    console.log(`%s :: ${msg}`, chalk.redBright(tag));
    process.exit(code);
  }
  console.log(`${tag} :: ${msg}`);
  process.exit(code);
};

export const exitWithWarning = ({ tag, msg, code, display = false }) => {
  if (display) {
    console.log(`%s :: ${msg}`, chalk.yellow(tag));
    process.exit(code);
  }
  console.log(`${tag} :: ${msg}`);
  process.exit(code);
};

export const info = ({ msg, display = false }) => {
  if (display) {
    console.log(`%s :: ${msg}`, chalk.green("INFO"));
    return;
  }
  console.log(`INFO :: ${msg}`);
};

export const logData = ({ idMarker, dataString, display = false }) => {
  if (display) {
    console.log(`$${chalk.green(idMarker)}=>${dataString}`);
    return;
  }
  console.log(`$${idMarker}=>${dataString}`);
};

export const infoExitZero = (msg) => {
  info(msg);
  process.exit(0);
};
