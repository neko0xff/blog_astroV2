/**
 * 測試： Deno Dev
 */
async function Data1() {
  const source = "https://dev-blog.nekolab.deno.net/assets/myLinks.json";
  const jsonResponse = await fetch(source);
  const jsonData = await jsonResponse.json();

  //console.log(jsonData);
  return jsonData;
}

/**
 * 測試： 本地站點
 */
async function Data2() {
  const source = "http://localhost:8085/assets/myLinks.json";
  const jsonResponse = await fetch(source);
  const jsonData = await jsonResponse.json();

  //console.log(jsonData);
  return jsonData;
}

Deno.bench("[Data1] Deno Deploy Json", { baseline: true }, async () => {
  await Data1();
});

Deno.bench("[Data2] local Json", async () => {
  await Data2();
});
