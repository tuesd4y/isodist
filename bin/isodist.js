#!/usr/bin/env node
/**
 * bin/isodist.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license 2015-16 (C) Ricepo LLC. All Rights Reserved.
 */
/* eslint strict: 0, no-process-exit: 0 */
"use strict";
const _ = require("lodash");
const Path = require("path");
const fs = require("fs");
const Yargs = require("yargs");
const IsoDist = require("../src");
const log = require("../lib/util/log");
const StdIn = require("../lib/util/stdin");

/**
 * Process CLI arguments
 */
const argv = Yargs.alias("m", "map")
  .describe("map", "OSRM file to use for routing")

  .alias("s", "step")
  .describe("step", "Distances where to compute isodistance polygons")

  .alias("r", "resolution")
  .default("r", 0.2)
  .describe("r", "Sampling resolution of point grid")

  .alias("h", "hex-size")
  .default("h", 0.5)
  .describe("h", "Size of hex grid cells")

  .boolean("no-deburr")
  .describe(
    "no-deburr",
    'Disable removal of isolated "islands" from isodistance result'
  ).argv;

/**
 * Read stdin file
 */
StdIn()
  .then((options) => {
    /**
     * Generate separate steps and data entries
     */
    options.data = _.keyBy(options.steps, "distance");
    options.steps = _.map(options.steps, "distance");

    /**
     * Generate the origin point if not specified
     */
    if (!options.origin && (!_.isFinite(argv.lat) || !_.isFinite(argv.lon))) {
      log.fail("Could not determine origin location");
    }
    if (argv.lat && argv.lon) {
      options.origin = {
        type: "Point",
        coordinates: [argv.lon, argv.lat],
      };
    }

    /**
     * Generate steps
     */
    if (argv.step) {
      options.steps = [].concat(argv.step);
    }
    if (!options.steps || !options.steps.length) {
      log.fail("Could not determine isodistance steps");
    }

    /**
     * Copy over -h, -r and -m
     */
    _.defaults(options, {
      resolution: argv.r,
      noDeburr: argv.noDeburr,
      hexSize: argv.h,
      map: argv.m,
    });

    /**
     * Resolve the options path
     */
    options.map = Path.resolve(__dirname, `../osrm/${options.map}.osrm`);

    /**
     * We really need that map though
     */
    if (!options.map) {
      log.fail("Missing OSRM map path");
    }

    /**
     * Start processing
     */
    return IsoDist(options.origin, options.steps, options);
  })
  .then((fc) => {
    const output = JSON.stringify(fc, null, 2);
    // process.stdout.write(output);
    // TODO temporarily write to out.geojson file, change later
    fs.writeFileSync("out.geojson", output);
    process.exit(0);
  })
  .catch((err) => {
    if (!err.known) {
      console.error(err.stack);
    }
    process.exit(1);
  });
