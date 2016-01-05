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
  .option("-d, --dest [dest]", "Which setup mode to use")
  .action(function(components, options){
    let dest = path.join(__dirname, "../", options.dest || "/dist/components"),
        componentsToBuild = components ? components.split(",") : ["header"];
    
    const build = require("../lib/commands/build");
        
    build(componentsToBuild, { dest }).then(() => {
      console.log("Done!");
    });
  });
  
program
  .command("create [name]")
  .description("Create a new rizzo component")
  .action(function(name, options){
    const create = require("../lib/commands/create");
        
    create(name, {}).then(() => {
      console.log("Done!");
    });
  });

program.parse(process.argv);