import { useState } from "react";
import type { ReactNode } from "react";

import { Accordion, AccordionItem } from "../components/Accordion";
import { Alert } from "../components/Alert";
import { Avatar, AvatarGroup } from "../components/Avatar";
import { Breadcrumb, BreadcrumbItem } from "../components/Breadcrumb";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Chip } from "../components/Chip";
import { Dialog } from "../components/Dialog";
import { Drawer } from "../components/Drawer";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "../components/Dropdown";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { InputOtp } from "../components/InputOtp";
import { MinMaxSlider } from "../components/MinMaxSlider";
import type { MinMaxValue } from "../components/MinMaxSlider";
import { Pagination } from "../components/Pagination";
import { ProgressBar } from "../components/ProgressBar";
import { Radio, RadioGroup } from "../components/Radio";
import { SegmentedControl } from "../components/SegmentedControl";
import { Select } from "../components/Select";
import { Skeleton } from "../components/Skeleton";
import { Spinner } from "../components/Spinner";
import { Step, Stepper } from "../components/Stepper";
import { Switch } from "../components/Switch";
import { Tag } from "../components/Tag";
import { Text } from "../components/Text";
import { Tooltip } from "../components/Tooltip";
import { ArrowRightIcon, SearchIcon, SparkIcon } from "./icons";
import { STORYBOOK_URL } from "./links";

type DemoProps = {
  title: string;
  description: string;
  /** Rendered top-right — the components this demo is built from. */
  parts: string[];
  /** Lets a demo with a tall control claim two columns. */
  wide?: boolean;
  children: ReactNode;
};

function Demo({ title, description, parts, wide = false, children }: DemoProps) {
  return (
    <article className={["demo", wide && "demo--wide"].filter(Boolean).join(" ")}>
      <header className="demo__head">
        <div>
          <Text variant="heading-4" as="h3">
            {title}
          </Text>
          <Text variant="body-sm" color="subtle">
            {description}
          </Text>
        </div>
      </header>

      <div className="demo__stage">{children}</div>

      <footer className="demo__parts">
        {parts.map((part) => (
          <Tag key={part} variant="outline">
            {part}
          </Tag>
        ))}
      </footer>
    </article>
  );
}

export function Showcase() {
  const [page, setPage] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [density, setDensity] = useState("comfortable");
  const [otp, setOtp] = useState("");
  const [budget, setBudget] = useState<MinMaxValue>([20, 70]);
  const [loading, setLoading] = useState(false);

  return (
    <section className="section" id="components">
      <div className="section__head">
        <Text variant="heading-2">Everything in the box</Text>
        <Text variant="body-lg" color="subtle">
          A live sample — these are the real components, not screenshots. Each one has its own
          page in{" "}
          <a className="text-link" href={STORYBOOK_URL}>
            Storybook
          </a>{" "}
          with every prop, state, and accessibility note.
        </Text>
      </div>

      <div className="showcase">
        <Demo
          title="Buttons"
          description="Five variants, three sizes, with icon and loading states."
          parts={["Button"]}
        >
          <div className="stack">
            <div className="row">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="row">
              <Button
                size="sm"
                icon={<SparkIcon />}
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  window.setTimeout(() => setLoading(false), 1600);
                }}
              >
                {loading ? "Working…" : "Try loading"}
              </Button>
              <Button size="sm" variant="outline" disabled>
                Disabled
              </Button>
              <Tooltip content="Icon buttons still need a name">
                <Button variant="icon" size="sm" aria-label="Search" icon={<SearchIcon />} />
              </Tooltip>
            </div>
          </div>
        </Demo>

        <Demo
          title="Form fields"
          description="Labels, helper text and validation wired up for you."
          parts={["Input", "Select"]}
        >
          <div className="stack">
            <Input
              label="Workspace"
              placeholder="acme-inc"
              icon={<SearchIcon />}
              helperText="Lowercase letters and dashes."
            />
            <Select
              label="Plan"
              defaultValue="team"
              options={[
                { value: "solo", label: "Solo" },
                { value: "team", label: "Team" },
                { value: "enterprise", label: "Enterprise" },
              ]}
            />
          </div>
        </Demo>

        <Demo
          title="Choices"
          description="Checkbox, radio and switch, all keyboard-complete."
          parts={["Checkbox", "RadioGroup", "Switch"]}
        >
          <div className="stack">
            <Checkbox label="Email me about releases" defaultChecked />
            <RadioGroup name="visibility" defaultValue="private" label="Visibility">
              <Radio value="public" label="Public" />
              <Radio value="private" label="Private" />
            </RadioGroup>
            <Switch label="Enable beta features" />
          </div>
        </Demo>

        <Demo
          title="Segmented control"
          description="A radio group that reads as a toolbar."
          parts={["SegmentedControl"]}
        >
          <div className="stack">
            <SegmentedControl
              label="Density"
              value={density}
              onChange={setDensity}
              fullWidth
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ]}
            />
            <Text variant="body-sm" color="subtle">
              Selected: {density}
            </Text>
          </div>
        </Demo>

        <Demo
          title="Feedback"
          description="Four alert tones, each with the right ARIA role."
          parts={["Alert"]}
        >
          <div className="stack">
            <Alert variant="success" title="Published">
              sonahang-ui@1.0.0 is live.
            </Alert>
            <Alert variant="warning">Your token expires in three days.</Alert>
          </div>
        </Demo>

        <Demo
          title="Progress"
          description="Determinate, indeterminate, and placeholder loading."
          parts={["ProgressBar", "Spinner", "Skeleton"]}
        >
          <div className="stack">
            <ProgressBar label="Uploading" value={62} showValue />
            <div className="row row--center">
              <Spinner size="sm" showLabel label="Fetching" />
            </div>
            <Skeleton lines={2} />
          </div>
        </Demo>

        <Demo
          title="People"
          description="Initials fall back automatically, and groups collapse."
          parts={["Avatar", "AvatarGroup", "Chip", "Tag"]}
        >
          <div className="stack">
            <AvatarGroup max={4}>
              <Avatar name="Sonahang Rai" />
              <Avatar name="Ada Lovelace" />
              <Avatar name="Grace Hopper" />
              <Avatar name="Alan Turing" />
              <Avatar name="Katherine Johnson" />
              <Avatar name="Barbara Liskov" />
            </AvatarGroup>
            <div className="row">
              <Tag>Design system</Tag>
              <Tag variant="secondary">React 19</Tag>
              <Chip action="remove" onAction={() => undefined}>
                Vite
              </Chip>
            </div>
          </div>
        </Demo>

        <Demo
          title="Overlays"
          description="Focus trap, scroll lock and Escape handled for you."
          parts={["Dialog", "Drawer", "Dropdown"]}
        >
          <div className="stack">
            <div className="row">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                Open dialog
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
                Open drawer
              </Button>
            </div>

            {/* .row rather than a bare child: the dropdown root is
                inline-block and would stretch to the stack's full width. */}
            <div className="row">
              <Dropdown>
                <DropdownTrigger>Actions</DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Rename</DropdownItem>
                  <DropdownItem>Duplicate</DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem destructive>Delete</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Publish this release?"
            description="It will be tagged latest on npm."
            footer={
              <>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Publish</Button>
              </>
            }
          >
            <Text variant="body-sm" color="subtle">
              Anyone installing sonahang-ui without a version tag will get this build.
            </Text>
          </Dialog>

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filters"
            side="right"
            footer={<Button onClick={() => setDrawerOpen(false)}>Apply</Button>}
          >
            <div className="stack">
              <Checkbox label="Accessible by default" defaultChecked />
              <Checkbox label="Themeable" defaultChecked />
              <Checkbox label="Zero dependencies" />
            </div>
          </Drawer>
        </Demo>

        <Demo
          title="Navigation"
          description="Breadcrumbs, pagination and a step indicator."
          parts={["Breadcrumb", "Pagination", "Stepper"]}
          wide
        >
          <div className="stack">
            <Breadcrumb>
              <BreadcrumbItem href="#top">Home</BreadcrumbItem>
              <BreadcrumbItem href="#components">Components</BreadcrumbItem>
              <BreadcrumbItem current>Pagination</BreadcrumbItem>
            </Breadcrumb>

            <Stepper activeStep={1}>
              <Step title="Install" description="Add the package" />
              <Step title="Import" description="Load the stylesheet" />
              <Step title="Ship" description="Build something" />
            </Stepper>

            <Pagination count={12} page={page} onChange={setPage} showFirstLast />
          </div>
        </Demo>

        <Demo
          title="One-time codes"
          description="Paste-aware, grouped, and masked on request."
          parts={["InputOtp"]}
          wide
        >
          <InputOtp
            label="Verification code"
            length={6}
            groupSize={3}
            value={otp}
            onChange={setOtp}
            helperText="Try pasting a six-digit code."
          />
        </Demo>

        <Demo
          title="Ranges"
          description="A two-handle slider that keeps its handles in order."
          parts={["MinMaxSlider"]}
        >
          <MinMaxSlider
            label="Budget"
            value={budget}
            onChange={setBudget}
            formatValue={(value) => `$${value}`}
            showValue
          />
        </Demo>

        <Demo
          title="Disclosure"
          description="Accordion sections with proper heading levels."
          parts={["Accordion"]}
        >
          <Accordion defaultValue={["a"]} collapsible>
            <AccordionItem value="a" title="Does it need a provider?">
              <Text variant="body-sm" color="subtle">
                No. Theming is CSS variables on the root element.
              </Text>
            </AccordionItem>
            <AccordionItem value="b" title="Can I restyle a component?">
              <Text variant="body-sm" color="subtle">
                Yes — override the semantic tokens, or pass your own className.
              </Text>
            </AccordionItem>
          </Accordion>
        </Demo>

        <Demo
          title="Empty states"
          description="The screen you reach for when there's nothing to show."
          parts={["EmptyState"]}
          wide
        >
          <EmptyState
            size="sm"
            title="No components pinned yet"
            description="Pin the ones you use most and they'll show up here."
            action={{
              label: "Browse Storybook",
              href: STORYBOOK_URL,
              variant: "primary",
              icon: <ArrowRightIcon />,
            }}
          />
        </Demo>
      </div>
    </section>
  );
}
