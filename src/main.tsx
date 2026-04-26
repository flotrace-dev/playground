import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FloTraceProvider } from "@flotrace/runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { useUserStore } from "./store/userStore";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FloTraceProvider
        config={{ appName: "FloTrace Playground" }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stores={{ userStore: useUserStore } as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient={queryClient as any}
      >
        <App />
      </FloTraceProvider>
    </QueryClientProvider>
  </StrictMode>
);
