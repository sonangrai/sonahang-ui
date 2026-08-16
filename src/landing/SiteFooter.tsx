import { Logo } from "../components/Logo";
import { Text } from "../components/Text";
import { ButtonLink } from "./ButtonLink";
import { ArrowRightIcon, PackageIcon } from "./icons";
import { GITHUB_URL, NPM_URL, PACKAGE_NAME, STORYBOOK_URL } from "./links";

export function SiteFooter() {
  return (
    <>
      <section className="cta">
        <Text variant="heading-2" align="center">
          The docs live in Storybook
        </Text>
        <Text variant="body-lg" color="subtle" align="center" className="cta__body">
          Every component, every prop, every state — with live controls and an accessibility
          panel. The package itself is on npm as{" "}
          <code className="inline-code">{PACKAGE_NAME}</code>.
        </Text>
        <div className="cta__actions">
          <ButtonLink
            size="lg"
            href={STORYBOOK_URL}
            icon={<ArrowRightIcon />}
            iconPosition="right"
          >
            Open Storybook
          </ButtonLink>
          <ButtonLink
            size="lg"
            variant="outline"
            href={NPM_URL}
            target="_blank"
            rel="noreferrer noopener"
            icon={<PackageIcon />}
          >
            npm package
          </ButtonLink>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <Logo className="site-footer__logo" />
          <Text variant="body-sm" color="subtle">
            A React component library and design system.
          </Text>
        </div>

        <nav className="site-footer__links" aria-label="Footer">
          <a href={STORYBOOK_URL}>Storybook</a>
          <a href={NPM_URL} target="_blank" rel="noreferrer noopener">
            npm
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
          <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer noopener">
            Issues
          </a>
        </nav>

        <Text variant="caption" color="subtle">
          © {new Date().getFullYear()} {PACKAGE_NAME} · MIT
        </Text>
      </footer>
    </>
  );
}
