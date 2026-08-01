import "./App.css";
import { Text } from "./components/Text";

function App() {
  return (
    <main className="landing">
      <span className="landing__badge">
        <span className="landing__badge-dot" aria-hidden="true" />
        <Text variant="caption" color="subtle">
          On construction
        </Text>
      </span>

      <Text variant="display" className="landing__title">
        sonahang-ui
      </Text>

      <Text variant="body-lg" color="subtle" className="landing__subtitle">
        A React component library and design system — built for consistency,
        documented in Storybook. Still under construction.
      </Text>

      <a href="/storybook/" className="landing__cta">
        Preview under components components in Storybook
      </a>

      <Text variant="caption" color="subtle" className="landing__footer">
        © {new Date().getFullYear()} sonahang-ui
      </Text>
    </main>
  );
}

export default App;
