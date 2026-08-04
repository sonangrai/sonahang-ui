import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "../Switch";
import { SwitchGroup } from "../SwitchGroup";

describe("Switch", () => {
  describe("semantics", () => {
    it("exposes the switch role, not checkbox", () => {
      // Screen readers announce a switch as on/off rather than checked.
      render(<Switch label="Email notifications" />);

      expect(screen.getByRole("switch", { name: "Email notifications" })).toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("is a real checkbox input underneath", () => {
      render(<Switch label="Email notifications" />);

      expect(screen.getByRole("switch")).toHaveAttribute("type", "checkbox");
    });

    it("supports an aria-label with no visible label", () => {
      render(<Switch aria-label="Email notifications" />);

      expect(screen.getByRole("switch", { name: "Email notifications" })).toBeInTheDocument();
    });

    it("hides the painted track from assistive tech", () => {
      const { container } = render(<Switch label="Email notifications" />);

      expect(container.querySelector(".sh-switch__track")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("toggling", () => {
    it("is off by default", () => {
      render(<Switch label="Email notifications" />);

      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("honours defaultChecked", () => {
      render(<Switch label="Email notifications" defaultChecked />);

      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("turns on when clicked", async () => {
      const user = userEvent.setup();
      render(<Switch label="Email notifications" />);

      await user.click(screen.getByRole("switch"));

      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("turns back off", async () => {
      const user = userEvent.setup();
      render(<Switch label="Email notifications" defaultChecked />);

      await user.click(screen.getByRole("switch"));

      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("wraps the input so clicking the label toggles it", async () => {
      const user = userEvent.setup();
      render(<Switch label="Email notifications" />);

      await user.click(screen.getByText("Email notifications"));

      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("fires onChange with the new state", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Switch label="Email notifications" onChange={onChange} />);

      await user.click(screen.getByRole("switch"));

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0].target.checked).toBe(true);
    });

    it("reflects a controlled checked prop", () => {
      const { rerender } = render(<Switch label="Email notifications" checked onChange={vi.fn()} />);
      expect(screen.getByRole("switch")).toBeChecked();

      rerender(<Switch label="Email notifications" checked={false} onChange={vi.fn()} />);

      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Switch label="Email notifications" checked={false} onChange={onChange} />);

      await user.click(screen.getByRole("switch"));

      expect(onChange).toHaveBeenCalledOnce();
      expect(screen.getByRole("switch")).not.toBeChecked();
    });
  });

  describe("keyboard", () => {
    it("is reachable by tab and toggles with space", async () => {
      const user = userEvent.setup();
      render(<Switch label="Email notifications" />);

      await user.tab();
      expect(screen.getByRole("switch")).toHaveFocus();

      await user.keyboard(" ");
      expect(screen.getByRole("switch")).toBeChecked();
    });
  });

  describe("disabled", () => {
    it("disables the control", () => {
      render(<Switch label="Email notifications" disabled />);

      expect(screen.getByRole("switch")).toBeDisabled();
    });

    it("does not toggle or fire onChange when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Switch label="Email notifications" disabled onChange={onChange} />);

      await user.click(screen.getByRole("switch"));

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("flags the disabled state on the wrapper", () => {
      const { container } = render(<Switch label="Email notifications" disabled />);

      expect(container.querySelector(".sh-switch")).toHaveClass("sh-switch--disabled");
    });
  });

  describe("label position", () => {
    it("defaults to the right", () => {
      const { container } = render(<Switch label="Email notifications" />);

      expect(container.querySelector(".sh-switch")).toHaveClass("sh-switch--label-right");
    });

    it("flips to the left when asked", () => {
      const { container } = render(<Switch label="Email notifications" labelPosition="left" />);

      expect(container.querySelector(".sh-switch")).toHaveClass("sh-switch--label-left");
      expect(container.querySelector(".sh-switch")).not.toHaveClass("sh-switch--label-right");
    });

    it("renders no label element when none is given", () => {
      const { container } = render(<Switch aria-label="Email notifications" />);

      expect(container.querySelector(".sh-switch__label")).not.toBeInTheDocument();
    });
  });

  describe("inside a group", () => {
    const NOTIFICATIONS = [
      { value: "email", label: "Email" },
      { value: "push", label: "Push" },
      { value: "digest", label: "Digest" },
    ];

    const Notifications = (props: Record<string, unknown>) => (
      <SwitchGroup label="Notifications" {...props}>
        {NOTIFICATIONS.map((item) => (
          <Switch key={item.value} value={item.value} label={item.label} />
        ))}
      </SwitchGroup>
    );

    it("exposes a group with an accessible name", () => {
      render(<Notifications />);

      expect(screen.getByRole("group", { name: "Notifications" })).toBeInTheDocument();
    });

    it("falls back to aria-label with no visible label", () => {
      render(
        <SwitchGroup aria-label="Notifications">
          <Switch value="email" label="Email" />
        </SwitchGroup>,
      );

      expect(screen.getByRole("group", { name: "Notifications" })).toBeInTheDocument();
    });

    it("keeps every switch a switch", () => {
      render(<Notifications />);

      expect(screen.getAllByRole("switch")).toHaveLength(3);
    });

    it("gives every switch the same field name", () => {
      render(<Notifications />);

      const names = screen.getAllByRole("switch").map((s) => s.getAttribute("name"));

      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it("keeps separate groups in separate fields", () => {
      render(
        <>
          <SwitchGroup label="One">
            <Switch value="a" label="A" />
          </SwitchGroup>
          <SwitchGroup label="Two">
            <Switch value="a" label="A2" />
          </SwitchGroup>
        </>,
      );

      const names = screen.getAllByRole("switch").map((s) => s.getAttribute("name"));

      expect(new Set(names).size).toBe(2);
    });

    it("uses a caller-supplied group name", () => {
      render(<Notifications name="notifications" />);

      for (const control of screen.getAllByRole("switch")) {
        expect(control).toHaveAttribute("name", "notifications");
      }
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<Notifications defaultValue={["push"]} />);

      expect(screen.getByRole("switch", { name: "Push" })).toBeChecked();
      expect(screen.getByRole("switch", { name: "Email" })).not.toBeChecked();
    });

    it("allows more than one switch on at a time", async () => {
      const user = userEvent.setup();
      render(<Notifications />);

      await user.click(screen.getByRole("switch", { name: "Email" }));
      await user.click(screen.getByRole("switch", { name: "Digest" }));

      expect(screen.getByRole("switch", { name: "Email" })).toBeChecked();
      expect(screen.getByRole("switch", { name: "Digest" })).toBeChecked();
    });

    it("reports the whole set, not a delta", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Notifications defaultValue={["email"]} onChange={onChange} />);

      await user.click(screen.getByRole("switch", { name: "Digest" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["email", "digest"]);
    });

    it("removes a value when switched off", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Notifications defaultValue={["email", "digest"]} onChange={onChange} />);

      await user.click(screen.getByRole("switch", { name: "Email" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["digest"]);
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Notifications value={[]} onChange={onChange} />);

      await user.click(screen.getByRole("switch", { name: "Email" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["email"]);
      expect(screen.getByRole("switch", { name: "Email" })).not.toBeChecked();
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(<Notifications value={["email"]} />);
      expect(screen.getByRole("switch", { name: "Email" })).toBeChecked();

      rerender(<Notifications value={["push"]} />);

      expect(screen.getByRole("switch", { name: "Push" })).toBeChecked();
      expect(screen.getByRole("switch", { name: "Email" })).not.toBeChecked();
    });

    it("disables every switch when the group is disabled", () => {
      render(<Notifications disabled />);

      for (const control of screen.getAllByRole("switch")) {
        expect(control).toBeDisabled();
      }
    });

    it("lets a switch opt out of a disabled group", () => {
      render(
        <SwitchGroup label="Notifications" disabled>
          <Switch value="email" label="Email" disabled={false} />
        </SwitchGroup>,
      );

      expect(screen.getByRole("switch", { name: "Email" })).toBeEnabled();
    });

    it("applies the group's labelPosition to its switches", () => {
      const { container } = render(<Notifications labelPosition="left" />);

      for (const item of container.querySelectorAll(".sh-switch")) {
        expect(item).toHaveClass("sh-switch--label-left");
      }
    });

    it("lets a switch override the group's labelPosition", () => {
      const { container } = render(
        <SwitchGroup label="Notifications" labelPosition="left">
          <Switch value="email" label="Email" labelPosition="right" />
        </SwitchGroup>,
      );

      expect(container.querySelector(".sh-switch")).toHaveClass("sh-switch--label-right");
    });

    it("links helper text to the group", () => {
      render(<Notifications helperText="These apply immediately." />);

      expect(screen.getByRole("group")).toHaveAccessibleDescription(
        "These apply immediately.",
      );
    });

    it("shows the error and marks the group invalid", () => {
      render(<Notifications error="Turn on at least one." />);

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription("Turn on at least one.");
    });

    it("is not marked invalid without an error", () => {
      render(<Notifications helperText="These apply immediately." />);

      expect(screen.getByRole("group")).not.toHaveAttribute("aria-invalid");
    });

    it("applies the orientation class", () => {
      const { container } = render(<Notifications orientation="horizontal" />);

      expect(container.querySelector(".sh-switch-group__options")).toHaveClass(
        "sh-switch-group__options--horizontal",
      );
    });

    it("defaults to vertical", () => {
      const { container } = render(<Notifications />);

      expect(container.querySelector(".sh-switch-group__options")).toHaveClass(
        "sh-switch-group__options--vertical",
      );
    });
  });

  describe("forwarding and styling hooks", () => {
    it("forwards arbitrary input attributes", () => {
      render(<Switch label="Email notifications" name="email" value="on" required />);

      const control = screen.getByRole("switch");
      expect(control).toHaveAttribute("name", "email");
      expect(control).toHaveAttribute("value", "on");
      expect(control).toBeRequired();
    });

    it("puts className on the label wrapper and inputClassName on the input", () => {
      const { container } = render(
        <Switch label="Email notifications" className="wrap" inputClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-switch")).toHaveClass("wrap");
      expect(screen.getByRole("switch")).toHaveClass("sh-switch__input", "ctrl");
      expect(screen.getByRole("switch")).not.toHaveClass("wrap");
    });
  });
});
