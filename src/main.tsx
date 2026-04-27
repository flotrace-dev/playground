import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FloTraceProvider } from "@flotrace/runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { App } from "./App";
import { useUserStore } from "./store/userStore";
import { useCounterStore } from "./store/counterStore";
import { reduxStore } from "./store/reduxStore";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={reduxStore}>
      <QueryClientProvider client={queryClient}>
        <FloTraceProvider
          config={{ appName: "FloTrace Playground" }}
          // Two Zustand stores tracked independently — userStore for Bug 4,
          // counterStore for Bug 16 (watch demo) + Bug 9 (effect bugs).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stores={{ userStore: useUserStore, counterStore: useCounterStore } as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reduxStore={reduxStore as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryClient={queryClient as any}
        >
          <App />
        </FloTraceProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>
);
