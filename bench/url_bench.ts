// @ts-ignore
Deno.bench("URL Parsing",() =>{
    const source =  "https://neko-0xff-blog.deno.dev/";
    new URL(source);
});
