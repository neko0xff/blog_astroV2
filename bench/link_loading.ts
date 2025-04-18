async function Data1(){
    const source = "https://neko-0xff-blog.deno.dev/assets/myLinks.json";
    const jsonResponse = await fetch(source);
    const jsonData = await jsonResponse.json();
    //console.log(jsonData);
    return jsonData;
};

async function Data2(){
    const source = "http://localhost:8085/assets/myLinks.json";
    const jsonResponse = await fetch(source);
    const jsonData = await jsonResponse.json();
    //console.log(jsonData);
    return jsonData;
};


Deno.bench("Data1: Deno.dev Json", { baseline : true },async() => {
    await Data1();
});

Deno.bench("Data2: local Json", async() => {
    await Data2();
});