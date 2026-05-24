const p = "dist/server/entry.mjs";
const t = Deno.readTextFileSync(p);
const fixed = t.replaceAll("../../client/", "../client/");
if (t !== fixed) {
  Deno.writeTextFileSync(p, fixed);
  console.log("patched relativeClientPath in entry.mjs");
} else {
  console.log("no patch needed (entry.mjs relativeClientPath already correct)");
}
