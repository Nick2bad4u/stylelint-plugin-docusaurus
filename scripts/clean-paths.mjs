#!/usr/bin/env node
import process from "node:process";
import { glob, rm } from "node:fs/promises";

const patterns = process.argv.slice(2);

if (patterns.length === 0) {
    process.exit(0);
}

/**
 * @param {string} value
 *
 * @returns {boolean}
 */
const hasGlobSyntax = (value) => /[*?[\]{}]/u.test(value);

for (const pattern of patterns) {
    let hadMatches = false;

    for await (const matchedPath of glob(pattern)) {
        hadMatches = true;
        await rm(matchedPath, { force: true, recursive: true });
    }

    if (!hadMatches && !hasGlobSyntax(pattern)) {
        await rm(pattern, { force: true, recursive: true });
    }
}
