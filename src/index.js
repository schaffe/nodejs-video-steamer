"use strict";
const cheerio = require("cheerio");
const express = require('express');
const movie = require("./movie");

var request = require('request');
request = request.defaults({jar: true});

const app = express();

app.get('/', (req, res) => {
    movie.getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk", res)
});

app.get('/:season/', (req, res) => {
    movie.crawl(req.param("season")).then((result) => res.send(result))
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

//
movie.crawl().then((movies) => console.log(movies));
// crawl().then(() => console.log(movies));

// getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk");
// getDriveUrl("https://drive.google.com/file/d/0ByhbuWRNNPUyaGhhb2RGWHA3SEk");