function normalizeText(text) {
  return String(text || "").trim();
}

export function getSafeAIMessage(status, fallback = "AI is temporarily unavailable. Please try again in a few minutes.") {
  if (status === 429) {
    return "AI is busy right now. Please try again in a few minutes.";
  }
  if (status === 408) {
    return "The request timed out. Please try again in a few minutes.";
  }
  if (status >= 500) {
    return "AI is temporarily unavailable. Please try again in a few minutes.";
  }
  return fallback;
}

export async function getSafeAIMessageFromResponse(response, fallback) {
  const safeFallback = getSafeAIMessage(response?.status || 0, fallback);

  try {
    const data = await response.json();
    const directMessage = normalizeText(data?.error?.message || data?.message);
    return directMessage || safeFallback;
  } catch {
    return safeFallback;
  }
}

export function getSafeAIMessageFromError(error, fallback) {
  const safeFallback = normalizeText(fallback) || "AI is temporarily unavailable. Please try again in a few minutes.";
  const message = normalizeText(error?.message);

  if (!message) return safeFallback;
  if (/backend server was unreachable|Failed to fetch|NetworkError|network/i.test(message)) {
    return "AI is temporarily unavailable. Please try again in a few minutes.";
  }
  if (/rate limit|too large|tpm|llama|gemma|groq|model/i.test(message)) {
    return "AI is busy right now. Please try again in a few minutes.";
  }

  return safeFallback;
}
