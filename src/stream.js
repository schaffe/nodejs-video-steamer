"use strict";
const fs = require("fs");
const http = require("http");
const url = require("url");
const path = require("path");

const videoRoot = '';
const folderMap = {
    19: '19'
};

const self = (() => {
    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    let findFile = (dir, season, series) => {
        return new Promise((resolve, reject) => fs.readdir(dir, function (err, items) {
            if (err)
                return reject(err);


            let pattern = new RegExp(pad(season, 2) + 'x' + pad(series, 2) + '.*');
            for (let i = 0; i < items.length; i++) {
                if (pattern.test(items[i]))
                    resolve(dir + "/" + items[i]);
            }
        }));
    };

    let stat = (file) => {
        return new Promise((resolve, reject) => {
            fs.stat(file, function (err, stats) {
                if (err)
                    reject(err);
                else
                    resolve({file, stats});
            });
        });
    };

    return {
        process: (req, res) => {
            let season = req.params.season;
            let series = req.params.series;
            let dir = videoRoot + folderMap[season];
            findFile(dir, season, series)
                .then(stat)
                .then(({file, stats}) => {
                    console.log(file);
                    if(file.endsWith(".avi")) {
                        res.writeHead(206, {
                            "Content-Type": "video/x-msvideo"
                        });
                        let stream = fs.createReadStream(file)
                            .on("open", function () {
                                stream.pipe(res);
                            }).on("error", function (err) {
                                res.end(err);
                            });
                    } else if (file.endsWith(".mp4")) {
                        let range = req.headers.range;
                        if (!range) {
                            // 416 Wrong range
                            return res.sendStatus(416);
                        }
                        let positions = range.replace(/bytes=/, "").split("-");
                        let start = parseInt(positions[0], 10);
                        let total = stats.size;
                        let end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                        let chunksize = (end - start) + 1;

                        res.writeHead(206, {
                            "Content-Range": "bytes " + start + "-" + end + "/" + total,
                            "Accept-Ranges": "bytes",
                            "Content-Length": chunksize,
                            "Content-Type": "video/mp4"
                        });
                        let stream = fs.createReadStream(file, {start: start, end: end})
                            .on("open", function () {
                                stream.pipe(res);
                            }).on("error", function (err) {
                                res.end(err);
                            });
                    } else {
                        res.sendStatus(400);
                        res.send("Unsupported media type");
                        return res.end();
                    }


                })
                .catch(err => {
                    console.error(err);
                    if (err.code === 'ENOENT') {
                        // 404 Error if file not found
                        return res.sendStatus(404);
                    }
                    res.end(err);
                });
        }
    };
})();

module.exports = self;