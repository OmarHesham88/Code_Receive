const MIN_INTERVAL_MS = Number(process.env.IMAP_MIN_INTERVAL_MS || "8000");

const perEmailCache = new Map();
const perEmailInFlight = new Map();
let allCache = null;
let allInFlight = null;

function isFresh(entry) {
  if (!entry) {
    return false;
  }
  return Date.now() - entry.fetchedAt < MIN_INTERVAL_MS;
}

export async function getCachedCodes(email, fetcher) {
  const cached = perEmailCache.get(email);
  if (isFresh(cached)) {
    return cached;
  }
  if (perEmailInFlight.has(email)) {
    return perEmailInFlight.get(email);
  }

  const promise = (async () => {
    const data = await fetcher(email);
    const entry = {
      items: data.items || [],
      checkedAt: data.checkedAt || new Date().toISOString(),
      fetchedAt: Date.now()
    };
    perEmailCache.set(email, entry);
    return entry;
  })().finally(() => {
    perEmailInFlight.delete(email);
  });

  perEmailInFlight.set(email, promise);
  return promise;
}

export async function getCachedAllCodes(fetcher) {
  if (isFresh(allCache)) {
    return allCache;
  }
  if (allInFlight) {
    return allInFlight;
  }

  allInFlight = (async () => {
    const data = await fetcher();
    allCache = {
      items: data.items || [],
      checkedAt: data.checkedAt || new Date().toISOString(),
      fetchedAt: Date.now()
    };
    return allCache;
  })().finally(() => {
    allInFlight = null;
  });

  return allInFlight;
}
