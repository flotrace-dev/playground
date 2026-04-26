// Fake /api/me endpoint — simulates a network round-trip with a 400ms delay.
// In FloTrace's Network panel you'll see this fire twice when both <Header>
// and <UserProfile> mount, even though the response is identical.

export interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function fetchMe(): Promise<MeResponse> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: 42,
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "engineer",
  };
}
