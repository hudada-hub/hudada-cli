import express from "express";

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer sk-lRcfRuVzKMuvzay60vOdWwsyDGuWfXOvedG8Y5ncvDD7KHdh");
  
app.get("/get", async (req, res) => {
   
   
    var raw = JSON.stringify({
       "model": "tts-1",
       "input": "你好,你叫什么名字.",
       "voice": "alloy"
    });
    
    var requestOptions = {
       method: 'POST',
       headers: myHeaders,
       body: raw,
       redirect: 'follow'
    };
    
    const response = await fetch("https://xiaohumini.site/v1/audio/speech", requestOptions);

    const audioBuffer = await response.arrayBuffer();



    // 设置正确的响应头

    res.setHeader('Content-Type', 'audio/mpeg');

    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));
});

app.get("/mj", async (req, res) => {
   

var raw = JSON.stringify({
   "base64Array": [],
   "notifyHook": "",
   "prompt": "Imagine a world with robots and humans living together as if they are in the futuristic world",
   "state": "",
   "botType": "MID_JOURNEY"
});

var requestOptions = {
   method: 'POST',
   headers: myHeaders,
   body: raw,
   redirect: 'follow'
};

    const response = await fetch("https://xiaohumini.site/mj/submit/imagine", requestOptions);

    const audioBuffer = await response.json();


    res.send(audioBuffer);
});


app.get("/mj-s", async (req, res) => {
   
    var formdata = new FormData();
   
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
     };
    
        const response = await fetch("https://xiaohumini.site/mj/task/1737814651234330/fetch", requestOptions);
    
        const audioBuffer = await response.json();
    
    
        res.send(audioBuffer);
    });

app.listen(3000);