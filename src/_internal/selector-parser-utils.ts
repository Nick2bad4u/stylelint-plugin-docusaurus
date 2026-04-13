import selectorParser, {
    type Attribute,
    type Node,
    type Pseudo,
    type Root,
    type Selector,
} from "postcss-selector-parser";
import { isDefined } from "ts-extras";

/** Parsed selector-list root used by multiple Docusaurus selector helpers. */
export type ParsedSelectorList = Root;
/** Parsed individual selector used by multiple Docusaurus selector helpers. */
export type ParsedSelector = Selector;

/** Supported selector containers that expose the standard traversal helpers. */
type SelectorContainer = Root | Selector;

/** Positive pseudo wrappers whose trailing compound can still target the
element. */
const positiveTrailingCompoundPseudoNames: ReadonlySet<string> = new Set([
    ":global",
    ":is",
    ":where",
]);

/** Pseudo wrappers whose nested selectors must not count as positive matches. */
const nonPositiveSelectorMatchPseudoNames: ReadonlySet<string> = new Set([
    ":has",
    ":not",
]);

/** Check whether a selector-parser node lives under a named pseudo wrapper. */
function hasNamedAncestorPseudo(
    node: Readonly<Node>,
    pseudoName: string
): boolean {
    let currentNode: Node | undefined = node.parent as Node | undefined;

    while (currentNode !== undefined) {
        const parentNode = currentNode.parent as Node | undefined;

        if (currentNode.type === "pseudo" && currentNode.value === pseudoName) {
            return true;
        }

        currentNode = parentNode;
    }

    return false;
}

/** Check whether a selector-parser node lives under any pseudo in a named set. */
function hasNamedAncestorPseudoInSet(
    node: Readonly<Node>,
    pseudoNames: ReadonlySet<string>
): boolean {
    let currentNode: Node | undefined = node.parent as Node | undefined;

    while (currentNode !== undefined) {
        const parentNode = currentNode.parent as Node | undefined;

        if (
            currentNode.type === "pseudo" &&
            pseudoNames.has(currentNode.value)
        ) {
            return true;
        }

        currentNode = parentNode;
    }

    return false;
}

/** Parse one selector list with `postcss-selector-parser`. */
export function parseSelectorList(
    selectorList: string
): ParsedSelectorList | undefined {
    try {
        return selectorParser().astSync(selectorList);
    } catch {
        return undefined;
    }
}

/** Get the individual selectors from a parsed selector-list root. */
export function getSelectors(
    selectorList: Readonly<ParsedSelectorList>
): readonly ParsedSelector[] {
    return selectorList.nodes.filter(
        (node): node is ParsedSelector => node.type === "selector"
    );
}

/** Check whether one node lives under `:global(...)` CSS Modules syntax. */
export function isInsideGlobalPseudo(node: Readonly<Node>): boolean {
    return hasNamedAncestorPseudo(node, ":global");
}

/** Options for positive class/attribute selector matching helpers. */
type PositiveSelectorMatchOptions = Readonly<{
    includeGlobal?: boolean;
}>;

/** Check whether one selector node should be ignored for positive matching. */
function shouldIgnorePositiveSelectorMatchNode(
    node: Readonly<Node>,
    includeGlobal: boolean
): boolean {
    if (!includeGlobal && isInsideGlobalPseudo(node)) {
        return true;
    }

    return hasNamedAncestorPseudoInSet(
        node,
        nonPositiveSelectorMatchPseudoNames
    );
}

/** Collect class names outside CSS Modules `:global(...)` wrappers. */
export function getClassNamesOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>
): readonly string[] {
    const classNames = new Set<string>();

    selectorContainer.walkClasses((classNode) => {
        if (isInsideGlobalPseudo(classNode)) {
            return;
        }

        classNames.add(classNode.value);
    });

    return [...classNames];
}

/** Collect id names outside CSS Modules `:global(...)` wrappers. */
export function getIdNamesOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>
): readonly string[] {
    const idNames = new Set<string>();

    selectorContainer.walkIds((idNode) => {
        if (isInsideGlobalPseudo(idNode)) {
            return;
        }

        idNames.add(idNode.value);
    });

    return [...idNames];
}

/** Collect type selectors outside CSS Modules `:global(...)` wrappers. */
export function getTypeNamesOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>
): readonly string[] {
    const typeNames = new Set<string>();

    selectorContainer.walkTags((tagNode) => {
        if (isInsideGlobalPseudo(tagNode)) {
            return;
        }

        typeNames.add(tagNode.value.toLowerCase());
    });

    return [...typeNames];
}

/** Collect attribute selectors outside CSS Modules `:global(...)` wrappers. */
export function getAttributeNodesOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>
): readonly Attribute[] {
    const attributeNodes: Attribute[] = [];

    selectorContainer.walkAttributes((attributeNode) => {
        if (isInsideGlobalPseudo(attributeNode)) {
            return;
        }

        attributeNodes.push(attributeNode);
    });

    return attributeNodes;
}

/** Collect attribute names outside CSS Modules `:global(...)` wrappers. */
export function getAttributeNamesOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>
): readonly string[] {
    return getAttributeNodesOutsideGlobal(selectorContainer).map(
        (attributeNode) => attributeNode.attribute.toLowerCase()
    );
}

/** Supported leading root-attribute classifications for selector analysis. */
export type LeadingRootAttributeKind = "bare" | "html-prefixed";

/** Options for classifying one leading root attribute. */
type LeadingRootAttributeOptions = Readonly<{
    allowRootPseudo?: boolean;
}>;

/** Find the nearest ancestor selector node for one selector-parser node. */
function getContainingSelectorNode(
    node: Readonly<Node>
): ParsedSelector | undefined {
    let currentNode: Node | undefined = node.parent as Node | undefined;

    while (isDefined(currentNode)) {
        if (currentNode.type === "selector") {
            return currentNode as ParsedSelector;
        }

        currentNode = currentNode.parent as Node | undefined;
    }

    return undefined;
}

/** Find the direct selector child that contains one nested selector-parser node. */
function getDirectChildUnderSelector(
    node: Readonly<Node>,
    selector: Readonly<ParsedSelector>
): Node | undefined {
    let currentNode: Node = node as Node;
    let parentNode: Node | undefined = currentNode.parent as Node | undefined;

    while (isDefined(parentNode) && parentNode !== selector) {
        currentNode = parentNode;
        parentNode = currentNode.parent as Node | undefined;
    }

    return parentNode === selector ? currentNode : undefined;
}

/**
 * Classify whether one attribute node sits in a leading root selector context,
 * optionally treating `:root` as a valid explicit root prefix.
 */
export function classifyLeadingRootAttributeNode(
    attributeNode: Readonly<Attribute>,
    { allowRootPseudo = false }: LeadingRootAttributeOptions = {}
): LeadingRootAttributeKind | undefined {
    let currentNode: Node = attributeNode as Node;
    let hasHtmlPrefix = false;

    while (true) {
        const containingSelector = getContainingSelectorNode(currentNode);

        if (!isDefined(containingSelector)) {
            return undefined;
        }

        const directChild = getDirectChildUnderSelector(
            currentNode,
            containingSelector
        );

        if (!isDefined(directChild)) {
            return undefined;
        }

        const leadingNodes = getLeadingSimpleSelectorNodes(containingSelector);
        const directChildIndex = leadingNodes.findIndex(
            (leadingNode) => leadingNode === directChild
        );

        if (directChildIndex === -1) {
            return undefined;
        }

        for (const leadingNode of leadingNodes.slice(0, directChildIndex + 1)) {
            if (leadingNode === directChild || leadingNode.type === "comment") {
                continue;
            }

            if (leadingNode.type === "tag") {
                if (leadingNode.value.toLowerCase() !== "html") {
                    return undefined;
                }

                hasHtmlPrefix = true;
                continue;
            }

            if (leadingNode.type === "attribute") {
                continue;
            }

            if (
                allowRootPseudo &&
                leadingNode.type === "pseudo" &&
                leadingNode.value === ":root"
            ) {
                continue;
            }

            return undefined;
        }

        const parentNode = containingSelector.parent as Node | undefined;

        if (!isDefined(parentNode) || parentNode.type !== "pseudo") {
            return hasHtmlPrefix ? "html-prefixed" : "bare";
        }

        if (parentNode.value !== ":is" && parentNode.value !== ":where") {
            return undefined;
        }

        currentNode = parentNode;
    }
}

/** Match details for one class-attribute fragment selector outside
`:global(...)`. */
export type ClassAttributeFragmentMatch = Readonly<{
    attributeSelector: string;
    fragment: string;
}>;

/** Options for curated class-attribute fragment matching. */
type ClassAttributeFragmentMatchOptions = Readonly<{
    includeGlobal?: boolean;
}>;

/** Normalize one attribute value for fragment comparisons. */
function normalizeAttributeComparisonValue(
    attributeNode: Readonly<Attribute>
): string | undefined {
    const attributeValue = attributeNode.value;

    if (typeof attributeValue !== "string") {
        return undefined;
    }

    return attributeNode.insensitive
        ? attributeValue.toLowerCase()
        : attributeValue;
}

/** Check whether one class attribute node matches one exact authored fragment. */
function classAttributeMatchesFragment(
    attributeNode: Readonly<Attribute>,
    fragment: string
): boolean {
    if (attributeNode.attribute.toLowerCase() !== "class") {
        return false;
    }

    const normalizedAttributeValue =
        normalizeAttributeComparisonValue(attributeNode);

    if (!isDefined(normalizedAttributeValue)) {
        return false;
    }

    const comparisonFragment = attributeNode.insensitive
        ? fragment.toLowerCase()
        : fragment;

    if (attributeNode.operator === "*=" || attributeNode.operator === "^=") {
        return normalizedAttributeValue === comparisonFragment;
    }

    return false;
}

/** Find the first class attribute selector that matches one curated fragment. */
export function findClassAttributeFragmentMatch(
    selectorContainer: Readonly<SelectorContainer>,
    fragments: Iterable<string>,
    { includeGlobal = false }: ClassAttributeFragmentMatchOptions = {}
): ClassAttributeFragmentMatch | undefined {
    const attributeNodes = includeGlobal
        ? (() => {
              const collectedAttributeNodes: Attribute[] = [];

              selectorContainer.walkAttributes((attributeNode) => {
                  collectedAttributeNodes.push(attributeNode);
              });

              return collectedAttributeNodes;
          })()
        : getAttributeNodesOutsideGlobal(selectorContainer);

    for (const attributeNode of attributeNodes) {
        for (const fragment of fragments) {
            if (!classAttributeMatchesFragment(attributeNode, fragment)) {
                continue;
            }

            return {
                attributeSelector: attributeNode.toString(),
                fragment,
            };
        }
    }

    return undefined;
}

/** Check whether a selector contains the CSS nesting token `&`. */
export function selectorHasNesting(
    selectorContainer: Readonly<SelectorContainer>
): boolean {
    let hasNesting = false;

    selectorContainer.walk((node) => {
        if (node.type !== "nesting") {
            return;
        }

        hasNesting = true;

        return false;
    });

    return hasNesting;
}

/** Check whether a selector has a matching class name outside `:global(...)`. */
export function selectorHasClassOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (className: string) => boolean
): boolean {
    let hasMatchingClass = false;

    selectorContainer.walkClasses((classNode) => {
        if (isInsideGlobalPseudo(classNode)) {
            return;
        }

        if (!predicate(classNode.value)) {
            return;
        }

        hasMatchingClass = true;

        return false;
    });

    return hasMatchingClass;
}

/** Check whether a selector has a matching class name in any scope. */
export function selectorHasClass(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (className: string) => boolean
): boolean {
    let hasMatchingClass = false;

    selectorContainer.walkClasses((classNode) => {
        if (!predicate(classNode.value)) {
            return;
        }

        hasMatchingClass = true;

        return false;
    });

    return hasMatchingClass;
}

/** Check whether a selector has a matching class in positive selector scope. */
export function selectorHasClassInPositiveScope(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (className: string) => boolean,
    { includeGlobal = true }: PositiveSelectorMatchOptions = {}
): boolean {
    let hasMatchingClass = false;

    selectorContainer.walkClasses((classNode) => {
        if (shouldIgnorePositiveSelectorMatchNode(classNode, includeGlobal)) {
            return;
        }

        if (!predicate(classNode.value)) {
            return;
        }

        hasMatchingClass = true;

        return false;
    });

    return hasMatchingClass;
}

/** Check whether a selector has a matching id name outside `:global(...)`. */
export function selectorHasIdOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (idName: string) => boolean
): boolean {
    let hasMatchingId = false;

    selectorContainer.walkIds((idNode) => {
        if (isInsideGlobalPseudo(idNode)) {
            return;
        }

        if (!predicate(idNode.value)) {
            return;
        }

        hasMatchingId = true;

        return false;
    });

    return hasMatchingId;
}

/** Check whether a selector has a matching id name in any scope. */
export function selectorHasId(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (idName: string) => boolean
): boolean {
    let hasMatchingId = false;

    selectorContainer.walkIds((idNode) => {
        if (!predicate(idNode.value)) {
            return;
        }

        hasMatchingId = true;

        return false;
    });

    return hasMatchingId;
}

/** Check whether a selector has a matching attribute outside `:global(...)`. */
export function selectorHasAttributeOutsideGlobal(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (attributeNode: Readonly<Attribute>) => boolean
): boolean {
    let hasMatchingAttribute = false;

    selectorContainer.walkAttributes((attributeNode) => {
        if (isInsideGlobalPseudo(attributeNode)) {
            return;
        }

        if (!predicate(attributeNode)) {
            return;
        }

        hasMatchingAttribute = true;

        return false;
    });

    return hasMatchingAttribute;
}

/** Check whether a selector has a matching attribute in any scope. */
export function selectorHasAttribute(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (attributeNode: Readonly<Attribute>) => boolean
): boolean {
    let hasMatchingAttribute = false;

    selectorContainer.walkAttributes((attributeNode) => {
        if (!predicate(attributeNode)) {
            return;
        }

        hasMatchingAttribute = true;

        return false;
    });

    return hasMatchingAttribute;
}

/** Check whether a selector has a matching attribute in positive selector scope. */
export function selectorHasAttributeInPositiveScope(
    selectorContainer: Readonly<SelectorContainer>,
    predicate: (attributeNode: Readonly<Attribute>) => boolean,
    { includeGlobal = true }: PositiveSelectorMatchOptions = {}
): boolean {
    let hasMatchingAttribute = false;

    selectorContainer.walkAttributes((attributeNode) => {
        if (
            shouldIgnorePositiveSelectorMatchNode(attributeNode, includeGlobal)
        ) {
            return;
        }

        if (!predicate(attributeNode)) {
            return;
        }

        hasMatchingAttribute = true;

        return false;
    });

    return hasMatchingAttribute;
}

/** Collect the leading simple-selector nodes before the first combinator. */
export function getLeadingSimpleSelectorNodes(
    selector: Readonly<ParsedSelector>
): readonly Node[] {
    const leadingNodes: Node[] = [];

    for (const selectorNode of selector.nodes) {
        if (selectorNode.type === "comment") {
            continue;
        }

        if (selectorNode.type === "combinator") {
            if (leadingNodes.length === 0) {
                continue;
            }

            break;
        }

        leadingNodes.push(selectorNode);
    }

    return leadingNodes;
}

/** Collect the trailing simple-selector nodes after the last combinator. */
export function getTrailingSimpleSelectorNodes(
    selector: Readonly<ParsedSelector>
): readonly Node[] {
    const trailingNodes: Node[] = [];

    for (let index = selector.nodes.length - 1; index >= 0; index -= 1) {
        const selectorNode = selector.nodes[index];

        if (!isDefined(selectorNode) || selectorNode.type === "comment") {
            continue;
        }

        if (selectorNode.type === "combinator") {
            if (trailingNodes.length === 0) {
                continue;
            }

            break;
        }

        trailingNodes.unshift(selectorNode);
    }

    return trailingNodes;
}

/**
 * Check whether one trailing-compound node contributes a matching class to the
 * selected element itself.
 */
function trailingSimpleSelectorNodeHasMatchingClass(
    selectorNode: Readonly<Node>,
    predicate: (className: string) => boolean
): boolean {
    if (selectorNode.type === "class") {
        return predicate(selectorNode.value);
    }

    if (selectorNode.type !== "pseudo") {
        return false;
    }

    const pseudoNode: Readonly<Pseudo> = selectorNode;

    if (
        !positiveTrailingCompoundPseudoNames.has(pseudoNode.value) ||
        !Array.isArray(pseudoNode.nodes) ||
        pseudoNode.nodes.length === 0
    ) {
        return false;
    }

    return pseudoNode.nodes.some(
        (nestedNode) =>
            nestedNode.type === "selector" &&
            selectorTrailingCompoundHasClass(nestedNode, predicate)
    );
}

/**
 * Check whether the selected element's trailing compound contains one matching
 * class, including positive selector wrappers like `:is(...)` and
 * `:global(...)`.
 */
export function selectorTrailingCompoundHasClass(
    selector: Readonly<ParsedSelector>,
    predicate: (className: string) => boolean
): boolean {
    return getTrailingSimpleSelectorNodes(selector).some((selectorNode) =>
        trailingSimpleSelectorNodeHasMatchingClass(selectorNode, predicate)
    );
}
