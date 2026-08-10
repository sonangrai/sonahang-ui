import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Dropdown } from "../Dropdown";
import { DropdownItem } from "../DropdownItem";
import { DropdownMenu } from "../DropdownMenu";
import { DropdownSeparator } from "../DropdownSeparator";
import { DropdownTrigger } from "../DropdownTrigger";
import type { DropdownProps } from "../Dropdown";

const Basic = (props: Partial<DropdownProps> & { onSelect?: (value: string) => void }) => {
  const { onSelect, ...rest } = props;

  return (
    <Dropdown {...rest}>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onSelect={() => onSelect?.("edit")}>Edit</DropdownItem>
        <DropdownItem onSelect={() => onSelect?.("duplicate")}>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem onSelect={() => onSelect?.("delete")} destructive>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const trigger = () => screen.getByRole("button", { name: "Actions" });
const item = (name: string) => screen.getByRole("menuitem", { name });

describe("Dropdown", () => {
  describe("closed state", () => {
    it("renders only the trigger", () => {
      render(<Basic />);

      expect(trigger()).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("advertises that it opens a menu", () => {
      render(<Basic />);

      expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("points at no menu while there isn't one", () => {
      // aria-controls referencing a missing id is a dangling reference.
      render(<Basic />);

      expect(trigger()).not.toHaveAttribute("aria-controls");
    });

    it("leaves no menu items in the tab order", () => {
      render(<Basic />);

      expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
    });
  });

  describe("opening and closing", () => {
    it("opens on click", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
    });

    it("ties the menu to its trigger", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());

      expect(trigger()).toHaveAttribute("aria-controls", screen.getByRole("menu").id);
      expect(screen.getByRole("menu")).toHaveAttribute("aria-labelledby", trigger().id);
    });

    it("closes on a second click", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.click(trigger());

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on Escape and returns focus to the trigger", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    });

    it("closes on Escape even when focus never entered the menu", async () => {
      // `defaultOpen` opens without moving focus, so a menu that only listens
      // on its own element would ignore Escape here and trap the user.
      const user = userEvent.setup();
      render(<Basic defaultOpen />);
      expect(document.body).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on an outside press", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Basic />
          <button type="button">Elsewhere</button>
        </>,
      );

      await user.click(trigger());
      await user.click(screen.getByRole("button", { name: "Elsewhere" }));

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("stays open when pressing inside the menu", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.click(screen.getByRole("menu"));

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("reports open state changes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Basic onOpenChange={onOpenChange} />);

      await user.click(trigger());
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      await user.keyboard("{Escape}");
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("honours defaultOpen", () => {
      render(<Basic defaultOpen />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("reflects a controlled open prop", () => {
      const { rerender } = render(<Basic open={false} />);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      rerender(<Basic open />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("does not self-close when controlled", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Basic open onOpenChange={onOpenChange} />);

      await user.keyboard("{Escape}");

      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });

  describe("keyboard on the trigger", () => {
    it("opens with ArrowDown, focusing the first item", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      trigger().focus();
      await user.keyboard("{ArrowDown}");

      expect(item("Edit")).toHaveFocus();
    });

    it("opens with ArrowUp, focusing the last item", async () => {
      // Reaching the last command without walking the whole menu.
      const user = userEvent.setup();
      render(<Basic />);

      trigger().focus();
      await user.keyboard("{ArrowUp}");

      expect(item("Delete")).toHaveFocus();
    });

    it("focuses the first item when opened by click", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());

      expect(item("Edit")).toHaveFocus();
    });
  });

  describe("keyboard in the menu", () => {
    it("moves down and up", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.keyboard("{ArrowDown}");
      expect(item("Duplicate")).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(item("Edit")).toHaveFocus();
    });

    it("wraps at both ends", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.keyboard("{ArrowUp}");
      expect(item("Delete")).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(item("Edit")).toHaveFocus();
    });

    it("jumps with Home and End", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.keyboard("{End}");
      expect(item("Delete")).toHaveFocus();

      await user.keyboard("{Home}");
      expect(item("Edit")).toHaveFocus();
    });

    it("skips disabled items", async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem disabled>Duplicate</DropdownItem>
            <DropdownItem>Delete</DropdownItem>
          </DropdownMenu>
        </Dropdown>,
      );

      await user.click(trigger());
      await user.keyboard("{ArrowDown}");

      expect(item("Delete")).toHaveFocus();
    });

    it("closes on Tab rather than trapping focus", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.tab();

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("selecting", () => {
    it("runs onSelect and closes", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Basic onSelect={onSelect} />);

      await user.click(trigger());
      await user.click(item("Duplicate"));

      expect(onSelect).toHaveBeenCalledExactlyOnceWith("duplicate");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("returns focus to the trigger after selecting", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(trigger());
      await user.click(item("Edit"));

      expect(trigger()).toHaveFocus();
    });

    it("selects with Enter", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Basic onSelect={onSelect} />);

      await user.click(trigger());
      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenCalledExactlyOnceWith("edit");
    });

    it("stays open when closeOnSelect is false", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem closeOnSelect={false} onSelect={onSelect}>
              Toggle
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>,
      );

      await user.click(trigger());
      await user.click(item("Toggle"));

      expect(onSelect).toHaveBeenCalledOnce();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("does not fire for a disabled item", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem disabled onSelect={onSelect}>
              Edit
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>,
      );

      await user.click(item("Edit"));

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("items", () => {
    it("gives every item the menuitem role", () => {
      render(<Basic defaultOpen />);

      expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    });

    it("keeps items out of the page tab order", () => {
      // Arrow keys move between them; Tab leaves the menu entirely.
      render(<Basic defaultOpen />);

      for (const menuItem of screen.getAllByRole("menuitem")) {
        expect(menuItem).toHaveAttribute("tabindex", "-1");
      }
    });

    it("gives items type=button so none submits a form", () => {
      render(<Basic defaultOpen />);

      for (const menuItem of screen.getAllByRole("menuitem")) {
        expect(menuItem).toHaveAttribute("type", "button");
      }
    });

    it("exposes the separator to assistive tech", () => {
      // It conveys grouping, so it's a separator rather than aria-hidden.
      render(<Basic defaultOpen />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("hides an item's icon from assistive tech", () => {
      const { container } = render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem icon={<svg data-testid="icon" />}>Edit</DropdownItem>
          </DropdownMenu>
        </Dropdown>,
      );

      expect(container.querySelector(".sh-dropdown__item-icon")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("flags a destructive item", () => {
      const { container } = render(<Basic defaultOpen />);

      expect(container.querySelector(".sh-dropdown__item--destructive")).toHaveTextContent(
        "Delete",
      );
    });
  });

  describe("placement", () => {
    it("defaults to bottom start", () => {
      const { container } = render(<Basic defaultOpen />);
      const menu = container.querySelector(".sh-dropdown__menu");

      expect(menu).toHaveClass("sh-dropdown__menu--bottom", "sh-dropdown__menu--start");
    });

    it("applies top and end", () => {
      const { container } = render(<Basic defaultOpen placement="top" align="end" />);
      const menu = container.querySelector(".sh-dropdown__menu");

      expect(menu).toHaveClass("sh-dropdown__menu--top", "sh-dropdown__menu--end");
    });
  });

  describe("misuse", () => {
    it.each([
      ["DropdownTrigger", <DropdownTrigger>X</DropdownTrigger>],
      ["DropdownMenu", <DropdownMenu>X</DropdownMenu>],
      ["DropdownItem", <DropdownItem>X</DropdownItem>],
    ])("fails loudly when %s is used outside Dropdown", (name, element) => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(element)).toThrow(`<${name}> must be rendered inside <Dropdown>.`);

      spy.mockRestore();
    });
  });
});
