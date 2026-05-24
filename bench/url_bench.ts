
Deno.bench("[Task 1] URL Parsing",() =>{
    const source =  "https://neko-0xff-blog.deno.dev/";
    new URL(source);
});
