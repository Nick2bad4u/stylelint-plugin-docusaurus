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
    devEngines: {
        packageManager: {
            name: string;
            onFail: string;
            version: string;
        };
    };
    devDependencies: Readonly<Record<string, string>>;
    packageManager: string;
    scripts: Readonly<Record<string, string>>;
};
const documentationPackageMetadata = JSON.parse(
    readFileSync("docs/docusaurus/package.json", "utf8")
) as Pick<typeof packageMetadata, "devEngines" | "packageManager">;
const stylelintCompatibilityWrapper = readFileSync(
    "scripts/run-stylelint16-compat.mjs",
    "utf8"
);

const shellVariable = (name: string) => `${String.fromCodePoint(36)}{${name}}`;
const countOccurrences = (content: string, value: string) =>
    content.split(value).length - 1;

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

    it("keeps workflow dependency setup script-free and checksum-locked", () => {
        expect.hasAssertions();

        for (const workflow of [
            releaseWorkflow,
            continuousIntegrationWorkflow,
            documentationWorkflow,
        ]) {
            expect(workflow).not.toMatch(/npm ci(?! --ignore-scripts)/v);
        }

        expect(continuousIntegrationWorkflow).toContain(
            'run: "npm run test:coverage:ci"'
        );
        expect(packageMetadata.scripts["test:coverage:ci"]).toBe(
            "vitest run --coverage --reporter=github-actions --reporter=dot --reporter=junit --outputFile=test-report.junit.xml --silent"
        );

        for (const workflow of [
            releaseWorkflow,
            continuousIntegrationWorkflow,
        ]) {
            expect(workflow).toContain(
                'working-directory: ".github/actionlint"'
            );
            expect(workflow).toContain("go build -mod=readonly -trimpath");
            expect(workflow).not.toContain("go install");
        }
    });

    it("uses the exact selected npm release in every contributor and workflow path", () => {
        expect.hasAssertions();

        const expectedPackageManager = "npm@12.0.2";
        const expectedVersion = "12.0.2";

        for (const metadata of [
            packageMetadata,
            documentationPackageMetadata,
        ]) {
            expect(metadata.packageManager).toBe(expectedPackageManager);
            expect(metadata.devEngines.packageManager).toEqual({
                name: "npm",
                onFail: "error",
                version: expectedVersion,
            });
        }

        for (const workflow of [
            releaseWorkflow,
            continuousIntegrationWorkflow,
            documentationWorkflow,
        ]) {
            const setupCount = countOccurrences(
                workflow,
                'name: "Setup Node.js"'
            );

            expect(setupCount).toBeGreaterThan(0);
            expect(
                countOccurrences(workflow, "package-manager-cache: false")
            ).toBe(setupCount);
            expect(
                countOccurrences(
                    workflow,
                    `run: "npm install --global npm@${expectedVersion} --ignore-scripts"`
                )
            ).toBe(setupCount);
            expect(
                countOccurrences(
                    workflow,
                    'working-directory: "${{ runner.temp }}"'
                )
            ).toBeGreaterThanOrEqual(setupCount);
            expect(workflow).not.toContain('cache: "npm"');
        }
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
