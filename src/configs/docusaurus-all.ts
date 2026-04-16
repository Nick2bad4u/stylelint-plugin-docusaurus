/**
 * @packageDocumentation
 * Shareable Stylelint config: docusaurus-all.
 */

import {
    docusaurusPluginConfigs,
    type DocusaurusShareableConfig,
} from "../plugin.js";

/**
 * Shareable config that enables the full public Docusaurus plugin catalog.
 */
const docusaurusAllConfig: DocusaurusShareableConfig =
    docusaurusPluginConfigs["docusaurus-all"];

export default docusaurusAllConfig;
