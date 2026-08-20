import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const releaseWorkflow = readFileSync(".github/workflows/release.yml", "utf8");
const continuousIntegrationWorkflow = readFileSync(
    ".github/workflows/ci.yml",
    "utf8"
);
const documentationWorkflow = readFileSync(
    ".github/workflows/deploy-docusaurus.yml",
    "utf8"
);
const packageManifest = readFileSync("package.json", "utf8");
const packageMetadata = JSON.parse(packageManifest) as {
    allowScripts: Readonly<Record<string, boolean>>;
    devDependencies: Readonly<Record<string, string>>;
    scripts: Readonly<Record<string, string>>;
};
const stylelintCompatibilityWrapper = readFileSync(
    "scripts/run-stylelint16-compat.mjs",
    "utf8"
);

const shellVariable = (name: string) => `${String.fromCodePoint(36)}{${name}}`;

describe("release automation guardrails", () => {
    it("does not bypass dependency resolution or package verification", () => {
        expect.hasAssertions();

        for (const content of [
            releaseWorkflow,
            continuousIntegrationWorkflow,
            documentationWorkflow,
            packageManifest,
        ]) {
            expect(content).not.toMatch(
                /(?:npm (?:ci|install|update)|run-npm-command\.mjs (?:install|update))[^\n]*--force/v
            );
        }

        expect(releaseWorkflow).not.toContain("skip_verify");
        expect(releaseWorkflow).toContain('run: "npm run release:check"');
        expect(stylelintCompatibilityWrapper).not.toContain(
            "--legacy-peer-deps"
        );
    });

    it("proves verification preserves the exact clean source", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain("source_tree=$(git write-tree)");
        expect(releaseWorkflow).toContain(
            "git status --porcelain=v1 --untracked-files=all"
        );
        expect(releaseWorkflow).toContain("current_tree=$(git write-tree)");
        expect(releaseWorkflow).toContain("current_sha=$(git rev-parse HEAD)");
    });

    it("allows only version files into an atomic release push", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain(
            "git add -- package.json package-lock.json"
        );
        expect(releaseWorkflow).not.toMatch(/git add (?:-A|\.)/v);
        expect(releaseWorkflow).toContain(
            `git push --atomic origin "HEAD:refs/heads/${shellVariable("BRANCH")}" "refs/tags/${shellVariable("TAG")}"`
        );
        expect(releaseWorkflow).toContain(
            `Origin ${shellVariable("BRANCH")} moved from ${shellVariable("SOURCE_SHA")}`
        );
    });

    it("distinguishes absent releases from failed lookups and normalizes pack metadata", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain("404 Not Found");
        expect(releaseWorkflow).toContain("HTTP 404");
        expect(releaseWorkflow).toContain('if [ "$remote_tag_status" -ne 2 ]');
        expect(releaseWorkflow).toContain("overwrite_files: false");
        expect(releaseWorkflow).toContain("node scripts/npm-pack-metadata.mjs");
        expect(releaseWorkflow).toContain("npm ci --ignore-scripts");
        expect(releaseWorkflow).toContain("npm rebuild @b12k/gitleaks");
        expect(releaseWorkflow).not.toContain("npm install-scripts run");
        expect(releaseWorkflow).not.toContain(
            'node scripts/npm-pack-metadata.mjs "$pack_metadata_path"'
        );
        expect(releaseWorkflow).not.toContain("packMetadata[0]");
    });

    it("builds documentation inspectors from lockfile-pinned dependencies", () => {
        expect.hasAssertions();

        expect(packageMetadata.scripts["build:eslint-inspector"]).toBe(
            'npx @eslint/config-inspector build --outDir "docs/docusaurus/static/eslint-inspector" --base "/stylelint-plugin-docusaurus/eslint-inspector/"'
        );
        expect(packageMetadata.scripts["build:stylelint-inspector"]).toBe(
            'npx stylelint-config-inspector build --outDir "docs/docusaurus/static/stylelint-inspector" --base "/stylelint-plugin-docusaurus/stylelint-inspector/"'
        );
        expect(
            packageMetadata.devDependencies["@eslint/config-inspector"]
        ).toBe("^3.3.0");
        expect(
            packageMetadata.devDependencies["stylelint-config-inspector"]
        ).toBe("^2.3.5");
        expect(packageMetadata.allowScripts["esbuild@0.28.2"]).toBe(true);
        expect(packageManifest).not.toContain("@latest");
    });
});
