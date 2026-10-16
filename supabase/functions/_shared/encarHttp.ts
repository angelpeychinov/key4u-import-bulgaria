// Shared proxy client + browser headers for all *.encar.com requests (Encar blocks cloud IPs).
// deno-lint-ignore-file no-explicit-any
export const HEADERS = {
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "ko-KR,ko;q=0.9",
  origin: "https://www.encar.com",
  referer: "https://www.encar.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

export function makeClient(proxyUrl: string) {
  const u = new URL(proxyUrl);
  const username = decodeURIComponent(u.username);
  const password = decodeURIComponent(u.password);
  u.username = ""; u.password = "";
  const proxy: any = { url: u.toString().replace(/\/$/, "") };
  if (username) proxy.basicAuth = { username, password };
  return (Deno as any).createHttpClient({ proxy });
}
