export function normalizeUrl(input: string): string {
  let url = input.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const parsed = new URL(url);
  return parsed.origin;
}

export function extractDomain(url: string): string {
  const parsed = new URL(url);
  return parsed.hostname.replace(/^www\./, '');
}

export function extractHostname(url: string): string {
  const parsed = new URL(url);
  return parsed.hostname;
}

export function isValidUrl(input: string): boolean {
  try {
    let url = input.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
