#!/usr/bin/env node
/* global process */
"use strict";

let program = require("commander"),
    path = require("path");

program
  .version("0.1.0")
  .description("The evolution of Lonely Planet's Style Guide")

program
  .command("build [components]")
  .description("Builds given components")
  .option("-d, --dest [dest]", "Where to output the compiled files")
  .option("-c, --config [config]", "Pass in a JSON configuration file")
  .action(function(components, options){
    const build = require("../lib/commands/build");

    let config;
    if (options.config) {
      try {
        config = require(options.config);
      } catch(e) {
        console.log("No config file found at %s", options.config);
        return program.exit(0);
      }
    } else {
      config = require("../lib/data/default.json");
    }

    if (options.dest) {
      config.dest = options.dest;
    }

    build(components ? components.split(",") : [], config).then(() => {
      console.log("Done!");
    });
  });

program
  .command("create [name]")
  .description("Create a new rizzo component")
  .action(require("../lib/commands/create"));

program.parse(process.argv);
