// Lazy-loaded child for Bug 14. Lives in its own file so React.lazy() actually
// produces a separate chunk; FloTrace's network panel will show the chunk
// fetch alongside the API call.

import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/jsonPlaceholder";

export default function LazyProductGrid() {
  const { data } = useSuspenseQuery({
    queryKey: ["dummyjson", "products"],
    queryFn: () => fetchProducts(8),
    staleTime: 60_000,
  });

  return (
    <ul className="list">
      {data.products.map((p) => (
        <li key={p.id}>
          <strong>{p.title}</strong>{" "}
          <span className="muted">
            ${p.price} · {p.category} · ★ {p.rating}
          </span>
        </li>
      ))}
    </ul>
  );
}
