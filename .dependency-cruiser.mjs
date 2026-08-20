/** @type {import("dependency-cruiser").IConfiguration} */
const dependencyCruiserConfig = {
    forbidden: [
        {
            comment:
                "Source modules must not participate in circular dependency chains.",
            from: {
                path: "^src",
            },
            name: "no-circular-source-dependencies",
            severity: "error",
            to: {
                circular: true,
                path: "^src",
            },
        },
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
        },
        includeOnly: "^src",
        tsConfig: {
            fileName: "tsconfig.json",
        },
    },
};

export default dependencyCruiserConfig;
