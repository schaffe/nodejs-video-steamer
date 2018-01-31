"use strict";
const cheerio = require("cheerio");
const request = require('request').defaults({jar: true});

const self = (() => {
    const movies = {};

    for(let i = 1; i <= 28; i++) {
        movies[i] = undefined;
    }

    return {
        getMovieUrl: function (url) {
            return new Promise((resolve, reject) => {
                request(url, (error, response, html) => {
                    const $ = cheerio.load(html);
                    const url = $('iframe').filter(function (i, el) {
                        // this === el
                        return $(this).attr('src').indexOf('drive.google.com') > -1;
                    }).attr('src');
                    if (!url)
                        reject("Movie URL is null");

                    return resolve(url);
                })
            })
        },

        getDriveUrl: function (id, res) {
            const url = "https://drive.google.com/uc?export=download&id=" + id;
            let jar = request.jar();
            request({url, jar}, (error, response, html) => {
                const $ = cheerio.load(html);
                const url1 = "https://drive.google.com" + $('#uc-download-link').attr('href');
                console.log(url1);
                request({url: url1, jar}).pipe(res);
            });
        },

        crawl: (sezon = 22) => {
            if (!movies[sezon]) {
                let seasonMovie = {};
                movies[sezon] = seasonMovie;
                return Promise.resolve(seasonMovie);
                // return new Promise((resolve, reject) => {
                //     request("http://simpsonsua.com.ua/sezon-" + sezon + "/", (error, response, html) => {
                //         const $ = cheerio.load(html);
                //         const promises = [];
                //         $('.movie_item figure a').map(function (i, elem) {
                //             let url = $(this).attr('href');
                //             console.log(url);
                //             promises.push(self.getMovieUrl(url)
                //                 .then((url) => seasonMovie[i] = url)
                //                 .then(console.log)
                //                 .catch(err => console.error(err)));
                //         });
                //         return Promise.all(promises).then(() => resolve(movies[sezon])).catch(reject);
                //     })
                // }).catch(console.error);
            } else {
                return Promise.resolve(movies[sezon]);
            }
        },

        all: () => {
            movies[1] = {
                1: "lol",
                2: "lol"
            };
            movies[2] = {
                1: "lol",
                2: "lol"
            };

            return movies;
        }
    }
})();

module.exports = self;
