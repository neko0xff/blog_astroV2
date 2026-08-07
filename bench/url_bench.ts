Deno.bench("[Task 1] URL Parsing", () => {
  const source = "https://dev-blog.nekolab.deno.net//";

  new URL(source);
});
