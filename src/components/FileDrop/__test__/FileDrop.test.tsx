import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FileDrop } from "../FileDrop";

const makeFile = (name: string, type = "text/plain", size = 4) => {
  const file = new File(["x".repeat(size)], name, { type });
  return file;
};

const dropzone = (container: HTMLElement) =>
  container.querySelector(".sh-filedrop__dropzone") as HTMLElement;

/** jsdom has no real drag session, so the transfer is supplied directly. */
const dropFiles = (zone: HTMLElement, files: File[]) =>
  fireEvent.drop(zone, { dataTransfer: { files, types: ["Files"] } });

const pickFiles = (input: HTMLElement, files: File[]) =>
  fireEvent.change(input, { target: { files } });

describe("FileDrop", () => {
  describe("rendering", () => {
    it("renders a file input", () => {
      render(<FileDrop label="Attachments" />);

      expect(screen.getByLabelText("Attachments")).toHaveAttribute("type", "file");
    });

    it("links the label to the input", () => {
      render(<FileDrop label="Attachments" />);

      expect(screen.getByLabelText("Attachments")).toBeInstanceOf(HTMLInputElement);
    });

    it("supports an aria-label with no visible label", () => {
      render(<FileDrop aria-label="Attachments" />);

      expect(screen.getByLabelText("Attachments")).toBeInTheDocument();
    });

    it("shows a default placeholder", () => {
      render(<FileDrop label="Attachments" />);

      expect(screen.getByText("Drag files here, or click to browse")).toBeInTheDocument();
    });

    it("shows a custom placeholder", () => {
      render(<FileDrop label="Attachments" placeholder="Drop your CV here" />);

      expect(screen.getByText("Drop your CV here")).toBeInTheDocument();
    });

    it("shows the accepted types when given", () => {
      render(<FileDrop label="Attachments" accept=".pdf,image/*" />);

      expect(screen.getByText(".pdf,image/*")).toBeInTheDocument();
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          <FileDrop label="First" />
          <FileDrop label="Second" />
        </>,
      );

      expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
    });
  });

  describe("accept and multiple", () => {
    it("passes accept to the input so the picker filters too", () => {
      render(<FileDrop label="Attachments" accept=".pdf" />);

      expect(screen.getByLabelText("Attachments")).toHaveAttribute("accept", ".pdf");
    });

    it("is single-file by default", () => {
      render(<FileDrop label="Attachments" />);

      expect(screen.getByLabelText("Attachments")).not.toHaveAttribute("multiple");
    });

    it("sets multiple when asked", () => {
      render(<FileDrop label="Attachments" multiple />);

      expect(screen.getByLabelText("Attachments")).toHaveAttribute("multiple");
    });

    it("keeps only the last file when not multiple", () => {
      const onChange = vi.fn();
      render(<FileDrop label="Attachments" onChange={onChange} />);

      pickFiles(screen.getByLabelText("Attachments"), [makeFile("a.txt"), makeFile("b.txt")]);

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0]).toHaveLength(1);
      expect(onChange.mock.calls[0][0][0].name).toBe("a.txt");
    });

    it("appends to the existing files when multiple", () => {
      const onChange = vi.fn();
      render(<FileDrop label="Attachments" multiple onChange={onChange} />);

      const input = screen.getByLabelText("Attachments");
      pickFiles(input, [makeFile("a.txt")]);
      pickFiles(input, [makeFile("b.txt")]);

      expect(onChange.mock.calls[1][0].map((f: File) => f.name)).toEqual(["a.txt", "b.txt"]);
    });
  });

  describe("choosing via the picker", () => {
    it("reports the chosen files", () => {
      const onChange = vi.fn();
      render(<FileDrop label="Attachments" onChange={onChange} />);

      pickFiles(screen.getByLabelText("Attachments"), [makeFile("a.txt")]);

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0][0].name).toBe("a.txt");
    });

    /*
     * Not covered: the handler resets `event.target.value` so that re-picking
     * a previously-removed file still fires `change` — a real browser
     * suppresses the event when the value is unchanged. jsdom neither
     * populates `value` for a file input nor suppresses the event, so there's
     * no way to make an assertion here that could fail. Verified manually.
     */

    it("fires again when a second selection is made", () => {
      const onChange = vi.fn();
      render(<FileDrop label="Attachments" multiple onChange={onChange} />);

      const input = screen.getByLabelText("Attachments");
      pickFiles(input, [makeFile("a.txt")]);
      pickFiles(input, [makeFile("b.txt")]);

      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("dropping", () => {
    it("accepts dropped files", () => {
      const onChange = vi.fn();
      const { container } = render(<FileDrop label="Attachments" onChange={onChange} />);

      dropFiles(dropzone(container), [makeFile("a.txt")]);

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0][0].name).toBe("a.txt");
    });

    it("filters dropped files by accept", () => {
      // The browser applies `accept` to the picker but not to drops, so this
      // has to be enforced in code or anything can be dropped in.
      const onChange = vi.fn();
      const { container } = render(
        <FileDrop label="Attachments" accept=".pdf" multiple onChange={onChange} />,
      );

      dropFiles(dropzone(container), [
        makeFile("keep.pdf", "application/pdf"),
        makeFile("drop.txt"),
      ]);

      expect(onChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["keep.pdf"]);
    });

    it("reports rejected files rather than dropping them silently", () => {
      const onReject = vi.fn();
      const { container } = render(
        <FileDrop label="Attachments" accept=".pdf" onReject={onReject} />,
      );

      dropFiles(dropzone(container), [makeFile("drop.txt")]);

      expect(onReject).toHaveBeenCalledOnce();
      expect(onReject.mock.calls[0][0][0].name).toBe("drop.txt");
    });

    it("does not fire onChange when everything is rejected", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileDrop label="Attachments" accept=".pdf" onChange={onChange} />,
      );

      dropFiles(dropzone(container), [makeFile("drop.txt")]);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("filters picked files by accept as well", () => {
      const onChange = vi.fn();
      render(<FileDrop label="Attachments" accept=".pdf" onChange={onChange} />);

      pickFiles(screen.getByLabelText("Attachments"), [makeFile("drop.txt")]);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("drag state", () => {
    it("is not dragging initially", () => {
      const { container } = render(<FileDrop label="Attachments" />);

      expect(container.querySelector(".sh-filedrop")).not.toHaveClass("sh-filedrop--dragging");
    });

    it("flags the zone while a drag is over it", () => {
      const { container } = render(<FileDrop label="Attachments" />);

      fireEvent.dragEnter(dropzone(container));

      expect(container.querySelector(".sh-filedrop")).toHaveClass("sh-filedrop--dragging");
    });

    it("stays flagged when the drag moves over a child element", () => {
      // dragenter/dragleave fire per element, so a naive boolean flickers.
      const { container } = render(<FileDrop label="Attachments" />);
      const zone = dropzone(container);

      fireEvent.dragEnter(zone);
      fireEvent.dragEnter(zone); // entering a child
      fireEvent.dragLeave(zone); // leaving that child

      expect(container.querySelector(".sh-filedrop")).toHaveClass("sh-filedrop--dragging");
    });

    it("clears once the drag has fully left", () => {
      const { container } = render(<FileDrop label="Attachments" />);
      const zone = dropzone(container);

      fireEvent.dragEnter(zone);
      fireEvent.dragLeave(zone);

      expect(container.querySelector(".sh-filedrop")).not.toHaveClass("sh-filedrop--dragging");
    });

    it("clears on drop", () => {
      const { container } = render(<FileDrop label="Attachments" />);
      const zone = dropzone(container);

      fireEvent.dragEnter(zone);
      dropFiles(zone, [makeFile("a.txt")]);

      expect(container.querySelector(".sh-filedrop")).not.toHaveClass("sh-filedrop--dragging");
    });
  });

  describe("file list", () => {
    it("lists the selected files with their size", () => {
      render(<FileDrop label="Attachments" defaultValue={[makeFile("a.txt", "text/plain", 2048)]} />);

      expect(screen.getByText("a.txt")).toBeInTheDocument();
      expect(screen.getByText("2 KB")).toBeInTheDocument();
    });

    it("can be hidden", () => {
      render(
        <FileDrop label="Attachments" hideFileList defaultValue={[makeFile("a.txt")]} />,
      );

      expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
    });

    it("removes a file", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FileDrop
          label="Attachments"
          multiple
          defaultValue={[makeFile("a.txt"), makeFile("b.txt")]}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Remove a.txt" }));

      expect(onChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["b.txt"]);
      expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
    });

    it("names each remove button after its file", () => {
      render(
        <FileDrop label="Attachments" multiple defaultValue={[makeFile("a.txt"), makeFile("b.txt")]} />,
      );

      expect(screen.getByRole("button", { name: "Remove a.txt" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove b.txt" })).toBeInTheDocument();
    });
  });

  describe("controlled", () => {
    it("reflects the value prop", () => {
      render(<FileDrop label="Attachments" value={[makeFile("given.txt")]} />);

      expect(screen.getByText("given.txt")).toBeInTheDocument();
    });

    it("does not self-update when controlled", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileDrop label="Attachments" value={[]} onChange={onChange} />,
      );

      dropFiles(dropzone(container), [makeFile("a.txt")]);

      expect(onChange).toHaveBeenCalledOnce();
      expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("disables the input", () => {
      render(<FileDrop label="Attachments" disabled />);

      expect(screen.getByLabelText("Attachments")).toBeDisabled();
    });

    it("ignores drops", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileDrop label="Attachments" disabled onChange={onChange} />,
      );

      dropFiles(dropzone(container), [makeFile("a.txt")]);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not flag a drag", () => {
      const { container } = render(<FileDrop label="Attachments" disabled />);

      fireEvent.dragEnter(dropzone(container));

      expect(container.querySelector(".sh-filedrop")).not.toHaveClass("sh-filedrop--dragging");
    });

    it("disables the remove buttons", () => {
      render(<FileDrop label="Attachments" disabled defaultValue={[makeFile("a.txt")]} />);

      expect(screen.getByRole("button", { name: "Remove a.txt" })).toBeDisabled();
    });
  });

  describe("helper text and errors", () => {
    it("links helper text to the input", () => {
      render(<FileDrop label="Attachments" helperText="PDFs only, please." />);

      expect(screen.getByLabelText("Attachments")).toHaveAccessibleDescription(
        "PDFs only, please.",
      );
    });

    it("shows the error and marks the input invalid", () => {
      render(<FileDrop label="Attachments" error="Attach at least one file." />);

      const input = screen.getByLabelText("Attachments");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription("Attach at least one file.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<FileDrop label="Attachments" helperText="PDFs only." error="Required." />);

      expect(screen.getByText("Required.")).toBeInTheDocument();
      expect(screen.queryByText("PDFs only.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<FileDrop label="Attachments" helperText="PDFs only." />);

      expect(screen.getByLabelText("Attachments")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("styling hooks", () => {
    it("puts className on the wrapper and inputClassName on the input", () => {
      const { container } = render(
        <FileDrop label="Attachments" className="wrap" inputClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-filedrop")).toHaveClass("wrap");
      expect(screen.getByLabelText("Attachments")).toHaveClass("sh-filedrop__input", "ctrl");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<FileDrop label="Attachments" error="Nope." />);

      expect(container.querySelector(".sh-filedrop")).toHaveClass("sh-filedrop--invalid");
    });
  });
});
