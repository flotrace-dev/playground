// Bug 18 — TanStack Query mutations.
// Bug 6 covered the QUERY side of the TanStack panel (useQuery refetch
// storms). This bug covers the MUTATION side — `useMutation`,
// `MutationCache.subscribe`, optimistic updates, invalidation cascades.
// In FloTrace: TanStack panel shows mutations distinctly from queries; the
// "Add (optimistic)" button surfaces the optimistic cache write + rollback.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface TodoItem {
  id: number;
  title: string;
}

// Module-local store — the "fake server" so we don't need a real backend.
// (The real-fetch alternative would POST to JSONPlaceholder, which 201s but
// doesn't actually persist; using local state keeps the demo deterministic.)
let nextId = 4;
const fakeServer: TodoItem[] = [
  { id: 1, title: "Drink coffee" },
  { id: 2, title: "Read PR review" },
  { id: 3, title: "Ship FloTrace" },
];

async function listTodos(): Promise<TodoItem[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [...fakeServer];
}

async function addTodo(title: string): Promise<TodoItem> {
  await new Promise((r) => setTimeout(r, 500));
  const created = { id: nextId++, title };
  fakeServer.push(created);
  return created;
}

async function addTodoFailing(_title: string): Promise<TodoItem> {
  await new Promise((r) => setTimeout(r, 300));
  throw new Error("Server-side validation failed");
}

export function Bug18TanstackMutations() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: todos, isFetching } = useQuery({
    queryKey: ["bug18-todos"],
    queryFn: listTodos,
  });

  // Standard mutation: invalidates the list on success → triggers a refetch
  // cascade visible in the desktop's TanStack panel.
  const standardAdd = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug18-todos"] });
    },
  });

  // Optimistic mutation: writes to the cache BEFORE the server responds, then
  // rolls back on error. Exercises onMutate / onError / onSettled — the full
  // cache-rollback lifecycle the desktop's panel renders.
  const optimisticAdd = useMutation({
    mutationFn: addTodo,
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ["bug18-todos"] });
      const snapshot = queryClient.getQueryData<TodoItem[]>(["bug18-todos"]);
      const optimistic = { id: Date.now(), title: `${title} (optimistic)` };
      queryClient.setQueryData<TodoItem[]>(
        ["bug18-todos"],
        (prev) => [...(prev ?? []), optimistic],
      );
      return { snapshot };
    },
    onError: (_err, _title, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(["bug18-todos"], ctx.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bug18-todos"] });
    },
  });

  // Failing mutation: always throws so the error + rollback path runs.
  const failingAdd = useMutation({
    mutationFn: addTodoFailing,
    onMutate: async (title) => {
      const snapshot = queryClient.getQueryData<TodoItem[]>(["bug18-todos"]);
      queryClient.setQueryData<TodoItem[]>(
        ["bug18-todos"],
        (prev) => [...(prev ?? []), { id: Date.now(), title: `${title} (will fail)` }],
      );
      return { snapshot };
    },
    onError: (_err, _title, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(["bug18-todos"], ctx.snapshot);
    },
  });

  const submitTitle = draft.trim() || `Todo ${nextId}`;

  return (
    <section className="bug">
      <span className="label">Bug 18 · TanStack mutations</span>
      <h2>useMutation, optimistic updates, rollback on error</h2>
      <p className="description">
        Bug 6 stressed <code>useQuery</code>; this stresses{" "}
        <code>useMutation</code>. The standard add invalidates the list (you
        should see a refetch in the desktop's TanStack panel). The optimistic
        add writes the cache before the server replies. The failing add
        rolls back.
      </p>
      <div className="demo">
        <input
          className="input"
          value={draft}
          placeholder="New todo title..."
          onChange={(e) => setDraft(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button
            className="btn"
            onClick={() => standardAdd.mutate(submitTitle)}
            disabled={standardAdd.isPending}
          >
            Add item
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => optimisticAdd.mutate(submitTitle)}
            disabled={optimisticAdd.isPending}
          >
            Add (optimistic)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => failingAdd.mutate(submitTitle)}
            disabled={failingAdd.isPending}
          >
            Force fail
          </button>
        </div>

        <ul className="list">
          {(todos ?? []).map((t) => (
            <li key={t.id}>
              <strong>#{t.id}</strong> {t.title}
            </li>
          ))}
          {isFetching && (
            <li>
              <span className="muted">refetching…</span>
            </li>
          )}
        </ul>

        <div className="kv" style={{ marginTop: 8 }}>
          standard: {mutationStatus(standardAdd.status)} · optimistic:{" "}
          {mutationStatus(optimisticAdd.status)} · failing:{" "}
          {mutationStatus(failingAdd.status)}
        </div>
      </div>
    </section>
  );
}

function mutationStatus(s: "idle" | "pending" | "success" | "error"): string {
  switch (s) {
    case "idle":
      return "—";
    case "pending":
      return "⌛";
    case "success":
      return "✓";
    case "error":
      return "✗";
  }
}
