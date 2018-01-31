"use strict";
const cheerio = require("cheerio");
const express = require('express');

var request = require('request');
request = request.defaults({jar: true});

const app = express();

let movies = {};

app.get('/', (req, res) => {
    getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk", res)
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

let getMovieUrl = function (url) {
    request(url, (error, response, html) => {
        const $ = cheerio.load(html);
        const url = $('iframe').filter(function (i, el) {
            // this === el
            return $(this).attr('src').indexOf('drive.google.com') > -1;
        }).attr('src');
        console.log(url);
    });
};

let getDriveUrl = function (id, res) {
    const url = "https://drive.google.com/uc?export=download&id=" + id;
    let jar = request.jar();
    request({url, jar}, (error, response, html) => {
        const $ = cheerio.load(html);
        const url1 = "https://drive.google.com" + $('#uc-download-link').attr('href');
        var cookie_string = jar.getCookieString(url); // "key1=value1; key2=value2; ..."
        var cookies = jar.getCookies(url);
        console.log(url1);
        request({url: url1, jar}).pipe(res);
    });
};

const crawl = (sezon = 22) => {
    request("http://simpsonsua.com.ua/sezon-" + sezon +"/", (error, response, html) => {
        const $ = cheerio.load(html);
        $('.movie_item figure a').each(function(i, elem) {
            let url = $(this).attr('href');
            console.log(url);
            console.log("--> " + getMovieUrl(url))
        });
    });
};

//
// crawl();

// getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk");
// getDriveUrl("https://drive.google.com/file/d/0ByhbuWRNNPUyaGhhb2RGWHA3SEk");