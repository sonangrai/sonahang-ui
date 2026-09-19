import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Carousel } from "../Carousel";
import type { CarouselProps } from "../Carousel";
import { CarouselDots } from "../CarouselDots";
import { CarouselNext } from "../CarouselNext";
import { CarouselPlayPause } from "../CarouselPlayPause";
import { CarouselPrevious } from "../CarouselPrevious";
import { CarouselSlide } from "../CarouselSlide";
import { CarouselSlides } from "../CarouselSlides";
import { resolveIndex } from "../carousel.context";

const Basic = (props: Partial<CarouselProps>) => (
  <Carousel aria-label="Photos" {...props}>
    <CarouselSlides>
      <CarouselSlide>First slide</CarouselSlide>
      <CarouselSlide>Second slide</CarouselSlide>
      <CarouselSlide>Third slide</CarouselSlide>
    </CarouselSlides>
    <CarouselPrevious />
    <CarouselNext />
    <CarouselDots />
  </Carousel>
);

const carousel = () => screen.getByRole("region", { name: "Photos" });
const slides = () => screen.getAllByRole("group", { name: /\d of \d/ });
const dot = (n: number) => screen.getByRole("button", { name: `Slide ${n}` });
const next = () => screen.getByRole("button", { name: "Next slide" });
const previous = () => screen.getByRole("button", { name: "Previous slide" });
const viewport = (container: HTMLElement) =>
  container.querySelector(".sh-carousel__viewport") as HTMLElement;
const track = (container: HTMLElement) =>
  container.querySelector(".sh-carousel__track") as HTMLElement;
const offset = (container: HTMLElement) =>
  track(container).style.getPropertyValue("--sh-carousel-index");

describe("Carousel", () => {
  describe("structure", () => {
    it("exposes a named carousel region", () => {
      render(<Basic />);

      expect(carousel()).toHaveAttribute("aria-roledescription", "carousel");
    });

    it("describes each slide by its position in the set", () => {
      render(<Basic />);

      expect(slides()).toHaveLength(3);
      expect(slides()[1]).toHaveAttribute("aria-label", "2 of 3");
      expect(slides()[1]).toHaveAttribute("aria-roledescription", "slide");
    });

    it("lets a slide name itself", () => {
      render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide aria-label="Sunrise over the bay">One</CarouselSlide>
          </CarouselSlides>
        </Carousel>,
      );

      expect(screen.getByRole("group", { name: "Sunrise over the bay" })).toBeInTheDocument();
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Basic />
          <Basic />
        </>,
      );

      const ids = slides().map((slide) => slide.id);
      expect(new Set(ids).size).toBe(6);
    });

    it("gives every control type=button so none of them submit a form", () => {
      render(<Basic />);

      expect(next()).toHaveAttribute("type", "button");
      expect(dot(1)).toHaveAttribute("type", "button");
    });

    it("counts only the slides that actually render", () => {
      const show = false;
      render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
            {show && <CarouselSlide>Two</CarouselSlide>}
            <CarouselSlide>Three</CarouselSlide>
          </CarouselSlides>
          <CarouselDots />
        </Carousel>,
      );

      expect(screen.getAllByRole("button", { name: /^Slide/ })).toHaveLength(2);
      expect(slides()[1]).toHaveAttribute("aria-label", "2 of 2");
    });
  });

  describe("off-screen slides", () => {
    // They're still laid out, just translated away — without inert their
    // contents stay focusable and tabbing drags the viewport sideways.
    it("makes every slide but the current one inert", () => {
      render(<Basic />);

      expect(slides()[0]).not.toHaveAttribute("inert");
      expect(slides()[1]).toHaveAttribute("inert");
      expect(slides()[2]).toHaveAttribute("inert");
    });

    it("moves inertness with the selection", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(next());

      expect(slides()[0]).toHaveAttribute("inert");
      expect(slides()[1]).not.toHaveAttribute("inert");
    });
  });

  describe("navigation", () => {
    it("starts on the first slide", () => {
      const { container } = render(<Basic />);

      expect(offset(container)).toBe("0");
    });

    it("honours a default index", () => {
      const { container } = render(<Basic defaultIndex={2} />);

      expect(offset(container)).toBe("2");
    });

    it("advances and retreats", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      await user.click(next());
      expect(offset(container)).toBe("1");

      await user.click(previous());
      expect(offset(container)).toBe("0");
    });

    it("reports the new index", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Basic onChange={onChange} />);

      await user.click(next());

      expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
    });

    it("jumps from a dot", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      await user.click(dot(3));

      expect(offset(container)).toBe("2");
    });

    it("marks the current dot", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      expect(dot(1)).toHaveAttribute("aria-current", "true");

      await user.click(dot(2));

      expect(dot(1)).not.toHaveAttribute("aria-current");
      expect(dot(2)).toHaveAttribute("aria-current", "true");
    });

    it("points each dot at the slide it shows", () => {
      render(<Basic />);

      expect(dot(2)).toHaveAttribute("aria-controls", slides()[1].id);
    });

    it("hides the dots when there is nothing to choose between", () => {
      render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>Only</CarouselSlide>
          </CarouselSlides>
          <CarouselDots />
        </Carousel>,
      );

      expect(screen.queryByRole("group", { name: "Choose slide" })).not.toBeInTheDocument();
    });
  });

  describe("looping", () => {
    it("wraps past the end by default", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic defaultIndex={2} />);

      await user.click(next());

      expect(offset(container)).toBe("0");
    });

    it("wraps back past the start", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      await user.click(previous());

      expect(offset(container)).toBe("2");
    });

    it("disables the arrows at the ends when looping is off", async () => {
      const user = userEvent.setup();
      render(<Basic loop={false} />);

      expect(previous()).toBeDisabled();
      expect(next()).toBeEnabled();

      await user.click(next());
      await user.click(next());

      expect(next()).toBeDisabled();
      expect(previous()).toBeEnabled();
    });

    it("disables both arrows with a single slide", () => {
      render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>Only</CarouselSlide>
          </CarouselSlides>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>,
      );

      expect(next()).toBeDisabled();
      expect(previous()).toBeDisabled();
    });
  });

  describe("controlled", () => {
    it("reflects the given index", () => {
      const { container } = render(<Basic index={1} />);

      expect(offset(container)).toBe("1");
    });

    it("does not self-update", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Basic index={0} onChange={onChange} />);

      await user.click(next());

      expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
      expect(offset(container)).toBe("0");
    });

    it("follows a change from the caller", () => {
      const { container, rerender } = render(<Basic index={0} />);

      rerender(<Basic index={2} />);

      expect(offset(container)).toBe("2");
    });

    it("clamps an out-of-range index instead of wrapping to the far end", () => {
      const { container } = render(<Basic index={9} />);

      expect(offset(container)).toBe("2");
    });
  });

  describe("keyboard", () => {
    it("moves with the arrow keys", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      viewport(container).focus();
      await user.keyboard("{ArrowRight}");
      expect(offset(container)).toBe("1");

      await user.keyboard("{ArrowLeft}");
      expect(offset(container)).toBe("0");
    });

    it("jumps to the ends with Home and End", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      viewport(container).focus();
      await user.keyboard("{End}");
      expect(offset(container)).toBe("2");

      await user.keyboard("{Home}");
      expect(offset(container)).toBe("0");
    });

    it("makes the viewport focusable so a tall slide can be scrolled", () => {
      const { container } = render(<Basic />);

      expect(viewport(container)).toHaveAttribute("tabindex", "0");
    });
  });

  describe("announcements", () => {
    it("announces changes when nothing is rotating on its own", () => {
      const { container } = render(<Basic />);

      expect(viewport(container)).toHaveAttribute("aria-live", "polite");
    });

    // Talking over the reader every few seconds, about a change they didn't
    // ask for, is worse than staying quiet.
    it("stays silent while auto-rotating", () => {
      const { container } = render(<Basic autoPlay />);

      expect(viewport(container)).toHaveAttribute("aria-live", "off");
    });

    it("starts announcing once rotation stops", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic autoPlay />);

      await user.click(next());

      expect(viewport(container)).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("auto-rotation", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

    /*
     * These reach for fireEvent rather than userEvent: userEvent's pointer
     * APIs await their own timers, which never resolve against Vitest's fake
     * clock here, and the test hangs until it times out. fireEvent is
     * synchronous, and React derives enter/leave from mouseover/mouseout, so
     * the relatedTarget is what makes these land.
     */

    it("stays put unless asked to rotate", () => {
      const { container } = render(<Basic />);

      tick(10_000);

      expect(offset(container)).toBe("0");
    });

    it("advances on the interval", () => {
      const { container } = render(<Basic autoPlay interval={1000} />);

      tick(1000);
      expect(offset(container)).toBe("1");

      tick(1000);
      expect(offset(container)).toBe("2");
    });

    it("wraps around", () => {
      const { container } = render(<Basic autoPlay interval={1000} defaultIndex={2} />);

      tick(1000);

      expect(offset(container)).toBe("0");
    });

    it("reports each automatic move", () => {
      const onChange = vi.fn();
      render(<Basic autoPlay interval={1000} onChange={onChange} />);

      tick(1000);

      expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
    });

    it("pauses while the pointer rests on it", () => {
      const { container } = render(<Basic autoPlay interval={1000} />);

      fireEvent.mouseOver(carousel(), { relatedTarget: document.body });
      tick(3000);
      expect(offset(container)).toBe("0");

      fireEvent.mouseOut(carousel(), { relatedTarget: document.body });
      tick(1000);
      expect(offset(container)).toBe("1");
    });

    it("pauses while focus is inside it", () => {
      const { container } = render(<Basic autoPlay interval={1000} />);

      act(() => next().focus());
      tick(3000);
      expect(offset(container)).toBe("0");

      act(() => next().blur());
      tick(1000);
      expect(offset(container)).toBe("1");
    });

    // focusout fires on every internal hop too; treating those as "focus left"
    // would restart rotation under someone tabbing through the controls.
    it("stays paused as focus moves between its own controls", () => {
      const { container } = render(<Basic autoPlay interval={1000} />);

      act(() => next().focus());
      fireEvent.focusOut(next(), { relatedTarget: previous() });
      tick(3000);

      expect(offset(container)).toBe("0");
    });

    // Once someone takes the wheel, moving the slide out from under them a
    // few seconds later is hostile.
    it("gives up rotating for good once navigated by hand", () => {
      const { container } = render(<Basic autoPlay interval={1000} />);

      fireEvent.click(dot(3));
      expect(offset(container)).toBe("2");

      tick(5000);

      expect(offset(container)).toBe("2");
    });
  });

  describe("play/pause", () => {
    const WithPlayPause = (props: Partial<CarouselProps>) => (
      <Carousel aria-label="Photos" {...props}>
        <CarouselSlides>
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </CarouselSlides>
        <CarouselPlayPause />
      </Carousel>
    );

    it("renders nothing without auto-rotation to control", () => {
      render(<WithPlayPause />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("offers to stop while rotating", () => {
      render(<WithPlayPause autoPlay />);

      expect(screen.getByRole("button", { name: "Stop slide rotation" })).toBeInTheDocument();
    });

    it("toggles between stopping and starting", async () => {
      const user = userEvent.setup();
      render(<WithPlayPause autoPlay />);

      await user.click(screen.getByRole("button", { name: "Stop slide rotation" }));

      expect(screen.getByRole("button", { name: "Start slide rotation" })).toBeInTheDocument();
    });

    it("restarts rotation that hand navigation stopped", async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Photos" autoPlay>
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </CarouselSlides>
          <CarouselNext />
          <CarouselPlayPause />
        </Carousel>,
      );

      await user.click(next());
      expect(screen.getByRole("button", { name: "Start slide rotation" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Start slide rotation" }));
      expect(screen.getByRole("button", { name: "Stop slide rotation" })).toBeInTheDocument();
    });

    it("takes custom labels", () => {
      render(
        <Carousel aria-label="Photos" autoPlay>
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </CarouselSlides>
          <CarouselPlayPause labels={{ pause: "Halt" }} />
        </Carousel>,
      );

      expect(screen.getByRole("button", { name: "Halt" })).toBeInTheDocument();
    });
  });

  describe("composition", () => {
    it("fires a caller's own click handler alongside navigation", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </CarouselSlides>
          <CarouselNext onClick={onClick} />
        </Carousel>,
      );

      await user.click(next());

      expect(onClick).toHaveBeenCalledOnce();
      expect(offset(container)).toBe("1");
    });

    it("lets a caller cancel a move", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </CarouselSlides>
          <CarouselNext onClick={(event) => event.preventDefault()} />
        </Carousel>,
      );

      await user.click(next());

      expect(offset(container)).toBe("0");
    });

    it("takes a custom arrow icon", () => {
      render(
        <Carousel aria-label="Photos">
          <CarouselSlides>
            <CarouselSlide>One</CarouselSlide>
          </CarouselSlides>
          <CarouselNext>Onwards</CarouselNext>
        </Carousel>,
      );

      expect(next()).toHaveTextContent("Onwards");
    });

    it("merges custom classNames", () => {
      const { container } = render(<Basic className="custom" />);

      expect(container.querySelector(".sh-carousel")).toHaveClass("custom");
    });
  });

  describe("misuse", () => {
    it("says so when a part is rendered outside the carousel", () => {
      const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<CarouselNext />)).toThrow(
        "<CarouselNext> must be rendered inside <Carousel>.",
      );

      quiet.mockRestore();
    });

    it("says so when a slide is rendered outside the slides", () => {
      const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        render(
          <Carousel aria-label="Photos">
            <CarouselSlide>Stray</CarouselSlide>
          </Carousel>,
        ),
      ).toThrow("<CarouselSlide> must be rendered inside <CarouselSlides>.");

      quiet.mockRestore();
    });
  });
});

describe("resolveIndex", () => {
  it("wraps past both ends when looping", () => {
    expect(resolveIndex(3, 3, true)).toBe(0);
    expect(resolveIndex(-1, 3, true)).toBe(2);
    expect(resolveIndex(7, 3, true)).toBe(1);
  });

  it("clamps to the ends when not looping", () => {
    expect(resolveIndex(3, 3, false)).toBe(2);
    expect(resolveIndex(-4, 3, false)).toBe(0);
  });

  it("has nowhere to go with no slides", () => {
    expect(resolveIndex(2, 0, true)).toBe(0);
  });
});
