import Link from "@docusaurus/Link";

import styles from "./GitHubStats.module.css";

type GitHubStatsProps = {
    readonly className?: string;
};

type LiveBadge = {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
};

const liveBadges = [
    {
        alt: "npm license",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/blob/main/LICENSE",
        src: "https://flat.badgen.net/npm/license/stylelint-plugin-docusaurus?color=purple",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/stylelint-plugin-docusaurus",
        src: "https://flat.badgen.net/npm/dt/stylelint-plugin-docusaurus?color=pink",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/releases",
        src: "https://flat.badgen.net/github/release/Nick2bad4u/stylelint-plugin-docusaurus?color=cyan",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/stargazers",
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/stylelint-plugin-docusaurus?color=yellow",
    },
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/forks",
        src: "https://flat.badgen.net/github/forks/Nick2bad4u/stylelint-plugin-docusaurus?color=green",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/issues",
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/stylelint-plugin-docusaurus?color=red",
    },
    {
        alt: "Codecov",
        href: "https://app.codecov.io/gh/Nick2bad4u/stylelint-plugin-docusaurus",
        src: "https://flat.badgen.net/codecov/github/Nick2bad4u/stylelint-plugin-docusaurus?color=blue",
    },
] as const satisfies readonly LiveBadge[];

/**
 * Renders live repository and package badges for the docs homepage.
 */
export default function GitHubStats({ className = "" }: GitHubStatsProps) {
    const badgeListClassName = [styles.liveBadgeList, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
            {liveBadges.map((badge) => (
                <li key={badge.src} className={styles.liveBadgeListItem}>
                    <Link
                        className={styles.liveBadgeAnchor}
                        href={badge.href}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            alt={badge.alt}
                            className={styles.liveBadgeImage}
                            decoding="async"
                            loading="lazy"
                            src={badge.src}
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
