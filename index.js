"use strict";
const ecstatic = require("ecstatic");
const fs = require("fs");
const http = require("http");
const url = require("url");

const fileHandler = ecstatic({ root: __dirname + "/client", baseDir: "client"});

function save(buffer, filename="/tmp/foo.opus") {
  fs.writeFile(filename, buffer, "binary", (err) => {
    if (err) { console.log(`DOOM ${err}`); }
    console.log(`saved to ${filename}`);
  });
}

function api(req, res) {
  if (req.method !== "POST") {
    res.end();
  }
  const chunks = [];
  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => {
    console.log(`saving`);
    save(Buffer.concat(chunks));
    res.writeHead(200);
    res.end();
  });
}

function split(req, res) {
  const pathname = url.parse(req.url).pathname;
  if (pathname.startsWith("/client")) {
    return fileHandler(req, res);
  } else {
    return api(req, res);
  }
}


const server = http.createServer(
  split
);
server.listen(8666);
