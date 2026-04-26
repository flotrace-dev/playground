import { Bug1Cascade } from "./components/Bug1Cascade";
import { Bug2PropDrilling } from "./components/Bug2PropDrilling";
import { Bug3MemoBypass } from "./components/Bug3MemoBypass";
import { Bug4DuplicateApi } from "./components/Bug4DuplicateApi";
import { Bug5UnmemoContext } from "./components/Bug5UnmemoContext";

export function App() {
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px" }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>FloTrace Playground</h1>
        <p style={{ color: "#9ca3af", fontSize: 14, margin: "8px 0 0 0" }}>
          Five common React perf bugs in one app. Open{" "}
          <a href="https://flotrace.dev/download">FloTrace</a> and watch each
          one light up.
        </p>
      </header>

      <main style={{ display: "grid", gap: 24 }}>
        <Bug1Cascade />
        <Bug2PropDrilling />
        <Bug3MemoBypass />
        <Bug4DuplicateApi />
        <Bug5UnmemoContext />
      </main>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid #1f2429",
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        <p>
          MIT licensed ·{" "}
          <a href="https://github.com/flotracedev/playground">GitHub</a> ·
          PRs adding more bugs welcome.
        </p>
      </footer>
    </div>
  );
}
