import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { CONTACT_EMAIL } from "../src/lib/contact";

const ROOT = new File(import.meta.url).dirname + "/..";
const SCAN_DIRS = ["src", "public"];
const SCAN_FILES = ["index.html"];
/** Old spellings that must never come back. */
const BANNED = ["key4uimport@", "key4u_import@"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe("contact email", () => {
  test("shared constant is the official address", () => {
    expect(CONTACT_EMAIL).toBe("key4u.import@gmail.com");
  });

  test("no banned email spelling anywhere in the site", () => {
    const files = [
      ...SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))),
      ...SCAN_FILES.map((f) => join(ROOT, f)),
    ];
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const bad of BANNED) {
        if (text.includes(bad)) offenders.push(`${file}: ${bad}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
