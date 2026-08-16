import "./landing/landing.css";

import { GetStarted } from "./landing/GetStarted";
import { Hero } from "./landing/Hero";
import { Showcase } from "./landing/Showcase";
import { SiteFooter } from "./landing/SiteFooter";
import { SiteHeader } from "./landing/SiteHeader";
import { Tokens } from "./landing/Tokens";

/**
 * The home route — a landing page built out of the library's own components,
 * which doubles as the smoke test for them. Nothing here is published: the
 * npm build entry is `src/index.ts`.
 */
function App() {
  return (
    <>
      <SiteHeader />
      <main className="page">
        <Hero />
        <GetStarted />
        <Showcase />
        <Tokens />
      </main>
      <SiteFooter />
    </>
  );
}

export default App;
