// Thin wrappers around free public APIs so FloTrace's network panel has real
// traffic to dissect — no signup, no API keys, CORS-friendly.
//
//   JSONPlaceholder  https://jsonplaceholder.typicode.com   (REST mock)
//   DummyJSON        https://dummyjson.com                  (rich mock data)
//   GitHub Zen       https://api.github.com/zen             (plain-text quote)
//
// We intentionally do *not* set headers / caches here — the runtime patches
// `fetch` so each call shows up in FloTrace exactly as written.

const JSON_PLACEHOLDER = "https://jsonplaceholder.typicode.com";
const DUMMY_JSON = "https://dummyjson.com";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PublicUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
}

export interface Product {
  id: number;
  title: string;
  price: number;
  rating: number;
  thumbnail: string;
  category: string;
}

export async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`${JSON_PLACEHOLDER}/posts/${id}`);
  if (!res.ok) throw new Error(`fetchPost(${id}) failed: ${res.status}`);
  return res.json();
}

export async function fetchUser(id: number): Promise<PublicUser> {
  const res = await fetch(`${JSON_PLACEHOLDER}/users/${id}`);
  if (!res.ok) throw new Error(`fetchUser(${id}) failed: ${res.status}`);
  return res.json();
}

export async function fetchUsers(): Promise<PublicUser[]> {
  const res = await fetch(`${JSON_PLACEHOLDER}/users`);
  if (!res.ok) throw new Error(`fetchUsers failed: ${res.status}`);
  return res.json();
}

export async function fetchProducts(limit = 12): Promise<{ products: Product[] }> {
  const res = await fetch(`${DUMMY_JSON}/products?limit=${limit}`);
  if (!res.ok) throw new Error(`fetchProducts failed: ${res.status}`);
  return res.json();
}

export async function fetchGitHubZen(): Promise<string> {
  const res = await fetch("https://api.github.com/zen");
  if (!res.ok) throw new Error(`fetchGitHubZen failed: ${res.status}`);
  return res.text();
}

// Deliberately broken endpoint so FloTrace's network panel renders a red status
// dot + "lib" badge on the consumer.
export async function fetchBroken404(): Promise<unknown> {
  const res = await fetch(`${JSON_PLACEHOLDER}/this-endpoint-does-not-exist`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Slow real request — `_delay` is a JSONPlaceholder feature that holds the
// response open for N milliseconds. Useful for the "slow API" demo.
export async function fetchSlow(delayMs = 2500): Promise<Post[]> {
  const res = await fetch(
    `${JSON_PLACEHOLDER}/posts?_limit=3&_delay=${delayMs}`
  );
  if (!res.ok) throw new Error(`fetchSlow failed: ${res.status}`);
  return res.json();
}
