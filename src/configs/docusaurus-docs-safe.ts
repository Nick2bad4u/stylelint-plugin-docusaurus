/**
 * @packageDocumentation
 * Shareable Stylelint config: docusaurus-docs-safe.
 */

import {
    docusaurusPluginConfigs,
    type DocusaurusShareableConfig,
} from "../plugin.js";

/**
 * Shareable config intended for Docusaurus docs-surface linting workflows.
 */
const docusaurusDocsSafeConfig: DocusaurusShareableConfig =
    docusaurusPluginConfigs["docusaurus-docs-safe"];

export default docusaurusDocsSafeConfig;
