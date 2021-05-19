var net, socket, tSocket, lastOutPut;

const express = require("express");
const app = express();

net = require("net");

const {TelnetSocket} = require("telnet-stream");


socket = net.createConnection(25639, "localhost");


tSocket = new TelnetSocket(socket);


tSocket.on("close", function() {
  return process.exit();
});


tSocket.on("data", function(buffer) {
  let x = buffer.toString("utf8").replace(/\|/g,"\\x").replace(/\\s/g," ").replace(/\\p/g,"|");
  /*let r = [];
  if(!x.startsWith("TS3")) {
    console.log(x);

    r = x.split("\n\r")
    r.map(e => e.split("|")
     .map(z => z.split(" ")
     .map((k) => {
           let z = k.split("=");
           if (z.length == 1) return { [z[0]] : false}
           return { [z[0]] : z[1]}
       })));
    r.filter(z => z !== "");
  } else {
    r = x;
  }*/


  //process.stdout.write(x);
  console.log(x);
  lastOutPut = x;
  return x;
});


tSocket.on("do", function(option) {
  const x = tSocket.writeWont(option);
  console.log(x);

});


tSocket.on("will", function(option) {
  return tSocket.writeDont(option);
});


process.stdin.on("data", function(buffer) {
  return tSocket.write(buffer.toString("utf8"));
});

app.get("/api/:id",(req,res) => {
    console.log(req.query);
    let para = Object.keys(req.query).map((k,i) => k+(Object.values(req.query)[i] ? ("="+(Object.values(req.query)[i].replace(/ /g,"\\s").replace(/\|/g,"\\p"))) : "")).join(" ");
    console.log(`${req.params.id} ${para}`); //`${k}=${req.query[i]}`
    tSocket.write(`${req.params.id} ${para}\n`.toString("utf8"));
    setTimeout(() =>
        res.send(
            lastOutPut
            .replace(/\n\r/g,"<br>")
            .replace(/\\x/g," |<br>")
            )
    ,100);
    //res.send(lastOutPut)
})

app.listen(process.env.PORT | 5006);
console.log("http://localhost:" + process.env.PORT | 5006);