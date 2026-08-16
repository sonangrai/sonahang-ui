import { Alert } from "../components/Alert";
import { CodeBlock } from "../components/CodeBlock";
import { Tab, TabList, TabPanel, Tabs } from "../components/Tabs";
import { Text } from "../components/Text";
import { ArrowRightIcon, BookIcon, PackageIcon } from "./icons";
import { NPM_URL, PACKAGE_NAME, STORYBOOK_URL } from "./links";

const installCommands = [
  { value: "npm", label: "npm", command: `npm install ${PACKAGE_NAME}` },
  { value: "pnpm", label: "pnpm", command: `pnpm add ${PACKAGE_NAME}` },
  { value: "yarn", label: "yarn", command: `yarn add ${PACKAGE_NAME}` },
  { value: "bun", label: "bun", command: `bun add ${PACKAGE_NAME}` },
];

const usage = `import { Button, Input, Alert } from '${PACKAGE_NAME}';
import '${PACKAGE_NAME}/style.css';

export function SignIn() {
  return (
    <form>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Alert variant="info">We'll email you a one-time code.</Alert>
      <Button type="submit" fullWidth>Send code</Button>
    </form>
  );
}`;

export function GetStarted() {
  return (
    <section className="section" id="get-started">
      <div className="section__head">
        <Text variant="heading-2">Get started</Text>
        <Text variant="body-lg" color="subtle">
          Install the package, import the stylesheet once, and you're done.
          Everything is tree-shakeable and typed.
        </Text>
      </div>

      <div className="get-started__grid">
        <div className="get-started__steps">
          <Tabs defaultValue="npm">
            <TabList aria-label="Package manager">
              {installCommands.map((entry) => (
                <Tab key={entry.value} value={entry.value}>
                  {entry.label}
                </Tab>
              ))}
            </TabList>

            {installCommands.map((entry) => (
              <TabPanel key={entry.value} value={entry.value}>
                <CodeBlock
                  language="bash"
                  copyLabel={`Copy the ${entry.label} command`}
                >
                  {entry.command}
                </CodeBlock>
              </TabPanel>
            ))}
          </Tabs>

          <CodeBlock filename="SignIn.tsx" language="tsx" showLineNumbers>
            {usage}
          </CodeBlock>
        </div>

        <div className="get-started__links">
          <a className="link-card" href={STORYBOOK_URL}>
            <span className="link-card__icon link-card__icon--accent">
              <BookIcon />
            </span>
            <Text variant="heading-4" as="span">
              Storybook
            </Text>
            <Text variant="body-sm" color="subtle">
              Every component with live controls, accessibility checks, and
              copyable source. This is the real documentation.
            </Text>
            <span className="link-card__cta">
              Open Storybook
              <ArrowRightIcon />
            </span>
          </a>

          <a
            className="link-card"
            href={NPM_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span className="link-card__icon">
              <PackageIcon />
            </span>
            <Text variant="heading-4" as="span">
              npm
            </Text>
            <Text variant="body-sm" color="subtle">
              Published as <code className="inline-code">{PACKAGE_NAME}</code>,
              with ESM and CJS builds and bundled type declarations.
            </Text>
            <span className="link-card__cta">
              View the package
              <ArrowRightIcon />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
