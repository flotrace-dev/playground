// Bug 6 — TanStack Query refetch storm.
// Three components ask for the same query (`["post", id]`) but with different
// refetch policies — one is well-behaved, two are noisy. The "noisy" ones
// re-fetch on every render via an unstable queryKey object literal.
// In FloTrace: TanStack Query panel shows wasted-refetch warnings, the state
// timeline shows the same key flashing repeatedly, network panel groups the
// duplicates with a DUP badge.

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchPost, type Post } from "../api/jsonPlaceholder";

export function Bug6TanStackRefetch() {
  const [postId, setPostId] = useState(1);

  return (
    <section className="bug">
      <span className="label">Bug 6 · TanStack refetch storm</span>
      <h2>Three components, one endpoint, runaway refetches</h2>
      <p className="description">
        <code>HealthyConsumer</code> uses a stable key. <code>NoisyConsumer</code>{" "}
        and <code>NoisyConsumerTwo</code> rebuild the key on every render — every
        commit triggers a fresh GET against{" "}
        <code>jsonplaceholder.typicode.com/posts/{postId}</code>.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className="btn"
            onClick={() => setPostId((id) => (id % 5) + 1)}
          >
            Switch post (id={postId})
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setPostId((id) => id)}
          >
            Re-render parent
          </button>
        </div>
        <HealthyConsumer postId={postId} />
        <NoisyConsumer postId={postId} />
        <NoisyConsumerTwo postId={postId} />
      </div>
    </section>
  );
}

function HealthyConsumer({ postId }: { postId: number }) {
  // Stable primitive key — TanStack dedupes correctly.
  const { data, isFetching } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    staleTime: 30_000,
  });
  return <PostPreview label="Healthy" data={data} loading={isFetching} />;
}

function NoisyConsumer({ postId }: { postId: number }) {
  // BUG: object literal in the key — new identity each render, refetch storm.
  const { data, isFetching } = useQuery({
    queryKey: ["post", { id: postId, v: Math.random() < 2 ? "x" : "y" }],
    queryFn: () => fetchPost(postId),
  });
  return <PostPreview label="Noisy" data={data} loading={isFetching} />;
}

function NoisyConsumerTwo({ postId }: { postId: number }) {
  // BUG: another unstable key — array literal containing an object means a
  // fresh identity every render, so the parent's "Re-render parent" button
  // triggers a refetch even though postId hasn't moved.
  const { data, isFetching } = useQuery({
    queryKey: ["post-v2", postId, [{ scope: "preview" }]],
    queryFn: () => fetchPost(postId),
  });
  return <PostPreview label="Noisy v2" data={data} loading={isFetching} />;
}

function PostPreview({
  label,
  data,
  loading,
}: {
  label: string;
  data: Post | undefined;
  loading: boolean;
}) {
  return (
    <div className="kv" style={{ marginTop: 6 }}>
      <strong style={{ color: "#e6e8eb" }}>{label}:</strong>{" "}
      {loading ? "fetching..." : data ? data.title : "—"}
    </div>
  );
}
