import madge from "madge";
import pc from "picocolors";

const sourceDirectoryPath = "./src";
const excludePattern =
    "(^|[\\/])(test|dist|node_modules|cache|.cache|coverage|build|eslint-inspector|temp|.docusaurus)($|[\\/])|\\.css$";

try {
    const result = await madge(sourceDirectoryPath, {
        excludeRegExp: [new RegExp(excludePattern, "u")],
        fileExtensions: [
            "ts",
            "tsx",
            "js",
            "jsx",
            "mjs",
            "cjs",
            "cts",
            "mts",
        ],
        tsConfig: "./tsconfig.json",
    });
    const circularDependencies = result.circular();

    if (circularDependencies.length === 0) {
        console.log(`${pc.green("✔")} No circular dependency found!`);
        process.exit(0);
    }

    console.error(pc.red("Circular dependencies detected:"));

    for (const dependencyPath of circularDependencies) {
        console.error(`- ${dependencyPath.join(" -> ")}`);
    }

    process.exit(1);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(pc.red("Failed to analyze circular dependencies."));
    console.error(message);
    process.exit(1);
}
