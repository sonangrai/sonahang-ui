import { Logo } from "../components/Logo";
import { SegmentedControl } from "../components/SegmentedControl";
import { GITHUB_URL, NPM_URL, STORYBOOK_URL } from "./links";
import { BookIcon, GithubIcon, PackageIcon } from "./icons";
import { useTheme } from "./useTheme";

/** Sticky top bar: wordmark, the two links that matter, and the theme switch. */
export function SiteHeader() {
  const [theme, setTheme] = useTheme();

  return (
    <header className="site-header">
      <a href="#top" className="site-header__brand" aria-label="sonahang-ui, home">
        <Logo className="site-header__logo" />
      </a>

      {/*
        The labels on the two outbound links collapse away on narrow screens
        (see landing.css), so each anchor carries its name in aria-label —
        icon-only, they'd otherwise be unnamed.
      */}
      <nav className="site-header__nav" aria-label="Primary">
        <a className="site-header__link" href={STORYBOOK_URL}>
          <span className="site-header__link-icon">
            <BookIcon />
          </span>
          <span className="site-header__link-label">Storybook</span>
        </a>
        <a
          className="site-header__link"
          href={NPM_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="npm"
        >
          <span className="site-header__link-icon">
            <PackageIcon />
          </span>
          <span className="site-header__link-label">npm</span>
        </a>
        <a
          className="site-header__link"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub"
        >
          <span className="site-header__link-icon">
            <GithubIcon />
          </span>
          <span className="site-header__link-label">GitHub</span>
        </a>
      </nav>

      <SegmentedControl
        className="site-header__theme"
        aria-label="Color theme"
        value={theme}
        onChange={(next) => setTheme(next as typeof theme)}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "Auto" },
        ]}
      />
    </header>
  );
}
