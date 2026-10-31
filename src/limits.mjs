// Approximate location-wide gate; no identifiers collected. Not a global cost ceiling.
export async function limitPublicRequest(binding) {
  if (!binding || typeof binding.limit !== "function") return new Response("Rate limit binding unavailable", { status: 503 });
  try {
    const { success } = await binding.limit({ key: "all-public-requests" });
    return success ? null : new Response("Temporarily rate limited", { status: 429, headers: { "Retry-After": "60" } });
  } catch {
    return new Response("Rate limit binding unavailable", { status: 503 });
  }
}
