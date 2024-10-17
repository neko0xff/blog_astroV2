---
title: node-使用swagger快速產生API文件
pubDatetime: 2023-09-24 12:22:17
tags:
  - "node"
description: "swagger可提供自動化的互動式API文件於網頁上，使相關人員(ex:QA)輕鬆在上面進行測試&查看API的相關參數&路徑。"
---

## 00 緒論

swagger可提供自動化的互動式API文件於網頁上，使相關人員(ex:QA)輕鬆在上面進行測試&查看API的相關參數&路徑。

<!--more-->

## 01 環境建置

1. 加入到Node專案
   - 安裝相関套件: `$ npm install swagger-autogen swagger-jsdoc swagger-ui-express --save`
2. 請手動或使用`swagger-autogen`來建立`swagger.json`等檔案
3. 在負責express路由中加入如下程式碼
   ```javascript=
      var swaggerUi = require('swagger-ui-express');
      const swaggerDocument = require('./config/swagger.json');
      ...
      express.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //API Docs
   ```
4. 打開`http://[IP Address]:[Port]/docs`來檢視生成結果

## 02 手動生成文件

- 請手動建立供給swagger呈現的json檔案: `./config/swagger.json`
  ```json=
     {
        "openapi": "3.0.0",
        "info": {
           "title": "User API",
           "description": "Simple RESTful API in Node.js with TypeScript",
           "version": "0.0.1"
         },
        "servers": [
           {
             "url": "http://localhost:3000/api",
             "description": "Local server"
           }
        ],
      }
  ```

## 03 把寫好的API功能自動轉成文件

1. 建立自動建立的程式: `./swaggerAutoGen.js`

   ```javascript=
     const swaggerAutogen = require("swagger-autogen")();

     /*需加入定義的API路由規則*/
     const file1="./rules/crawler.js";
     const file2="./rules/sensor.js";
     const file3="./rules/test.js";
     const file4="./rules/users.js";
     const file5="./rules/switch.js";
     const file6="./rules/customValue.js";
     const file7="./rules/mqttPub.js";

    /*文件內部的相關說明*/
    const doc = {
        info: {
        "version": "1.0.5",
        "title": "REST API Test Docs",
        "description": "該文件可提供在該專案中所需提供的功能"
        },
        host: 'localhost:3095',
        basePath: "/",
        schemes: [
          "http"
        ],
    };

    /*輸出對應文件*/
    const endpointsFiles = [file1,file2,file3,file4,file5,file6,file7];
    const outputFile = "./modules/config/swagger.json"; // 輸出的生成結果
    swaggerAutogen(outputFile, endpointsFiles,doc);
   ```

2. 加入指定啟動的指令到`package.json`的scrpits
   ```json=
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "node --max-semi-space-size=128 index.js",
        "swagger-autogen": "node ./tools/swagger.js"
       },
   ```
3. 自動生成: `$ npm run swagger-autogen`

## REF

- https://jimmyswebnote.com/swagger-node-js-tutorial/
- https://jasmine880809.medium.com/swagger-%E8%87%AA%E5%8B%95%E7%94%A2%E7%94%9Fapi%E6%96%87%E4%BB%B6-node-js-%E5%AF%A6%E4%BD%9C-e39f2bde57ce
- https://israynotarray.com/nodejs/20201229/1974873838/
- [開發同時附加文檔｜Node.js Swagger API 文件建置｜六角學院｜2023 鐵人賽 #5](https://www.youtube.com/watch?v=L-MYeWFpXWE)
  {%youtube L-MYeWFpXWE %}
