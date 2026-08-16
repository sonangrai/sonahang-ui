import { CodeBlock } from "../components/CodeBlock";
import { Tag } from "../components/Tag";
import { Text } from "../components/Text";
import { ButtonLink } from "./ButtonLink";
import { ArrowRightIcon, PackageIcon } from "./icons";
import { NPM_URL, PACKAGE_NAME, STORYBOOK_URL } from "./links";

const stats = [
  { value: "31", label: "components" },
  { value: "0", label: "runtime dependencies" },
  { value: "2", label: "themes, light and dark" },
  { value: "100%", label: "TypeScript" },
];

export function Hero() {
  return (
    <section className="hero" id="top">
      <Tag variant="secondary" className="hero__badge">
        v1.0.0 · React 19
      </Tag>

      <Text variant="display" className="hero__title">
        A small design system that <span className="hero__accent">stays out of the way</span>
      </Text>

      <Text variant="body-lg" color="subtle" className="hero__subtitle">
        {PACKAGE_NAME} is a React component library built on semantic CSS variables — no
        styling framework, no runtime dependencies, no provider to wrap your app in. Every
        component is documented, with live controls, in Storybook.
      </Text>

      <div className="hero__actions">
        <ButtonLink
          size="lg"
          href={STORYBOOK_URL}
          icon={<ArrowRightIcon />}
          iconPosition="right"
        >
          Browse the Storybook
        </ButtonLink>

        <ButtonLink
          size="lg"
          variant="outline"
          href={NPM_URL}
          target="_blank"
          rel="noreferrer noopener"
          icon={<PackageIcon />}
        >
          View on npm
        </ButtonLink>
      </div>

      <CodeBlock language="bash" className="hero__install" copyLabel="Copy install command">
        {`npm install ${PACKAGE_NAME}`}
      </CodeBlock>

      <dl className="hero__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="hero__stat">
            <dt className="hero__stat-value">{stat.value}</dt>
            <dd className="hero__stat-label">
              <Text variant="body-sm" color="subtle" as="span">
                {stat.label}
              </Text>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
