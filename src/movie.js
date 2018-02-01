"use strict";
const cheerio = require("cheerio");
const request = require('request').defaults({jar: true});

const self = (() => {
    const movies = {};

    for (let i = 1; i <= 28; i++) {
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

        getSeriesInfo: (season, series) => {
            return self.crawl(season)
                .then(season => season[series])
                .then(movie => {
                    if (!!movie.canonicalUrl) {
                        return movie;
                    }
                    return self.getMovieUrl(movie.url)
                        .then((url) => {
                            console.log(url);
                            movie.canonicalUrl = url;
                            return movie;
                        });
                });
        },

        crawl: (season) => {
            if (!movies[season]) {
                let seasonMovie = {};
                movies[season] = seasonMovie;
                // return Promise.resolve(movies[season]);
                return new Promise((resolve, reject) => {
                    request("http://simpsonsua.com.ua/sezon-" + season + "/", (error, response, html) => {
                        const $ = cheerio.load(html);
                        const promises = [];
                        $('.movie_item figure a').map(function (i, elem) {
                            const movie = {
                                url: $(this).attr('href'),
                                name: $(this).find('.nazva').text(),
                                description: $(this).find('.descr').last().text(),
                                viewUrl: "/view/" + season + "/" + i,
                                img: "http://simpsonsua.com.ua" + $(this).find('img').attr('src')
                            };
                            seasonMovie[i] = movie;
                            console.log(movie);
                            promises.push(Promise.resolve(seasonMovie));

                            //load real urls in background
                            // self.getMovieUrl(movie.url)
                            //     .then((url) => movie.canonicalUrl = url)
                            //     .then(console.log)
                            //     .catch(err => console.error(err));
                        });
                        return Promise.all(promises)
                            .then(() => resolve(movies[season]))
                            .then(() => console.log("Loaded season " + season))
                            .catch(reject);
                    })
                }).catch(console.error);
            } else {
                return Promise.resolve(movies[season]);
            }
        },

        all: () => {
            return movies;
        }
    }
})();

module.exports = self;
