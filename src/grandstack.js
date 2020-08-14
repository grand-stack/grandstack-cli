#!/usr/bin/env node
const yargs = require("yargs");

yargs
  .commandDir("./commands")
  .scriptName("grandstack")
  .example("grandstack dev", "launch local GraphQL API")
  .demandCommand().argv;
