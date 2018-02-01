"use strict";
const cheerio = require("cheerio");
const express = require('express');
const movie = require("./movie");
const exphbs = require('express-handlebars');

const app = express();

app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(express.static('views/scripts'));


// app.get('/', (req, res) => {
//     movie.getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk", res)
// });

app.get('/all', (req, res) => {
    res.render("all", {seasons: movie.all()})
});

app.get('/load/:season/', (req, res) => {
    movie.crawl(req.params["season"]).then((result) => res.send(result))
});

app.get('/view/:season/:series', (req, res) => {
    movie.getSeriesInfo(req.params["season"], req.params["series"])
        .then(movie => res.render("movie_view", movie));
});



app.listen(3000, () => console.log('Example app listening on port 3000!'));

//movie.getSeriesInfo(1,1).then(console.log);

//
// movie.crawl().then((movies) => console.log(movies));
// movie.crawl(22);

// getDriveUrl("0ByhbuWRNNPUyaGhhb2RGWHA3SEk");
// getDriveUrl("https://drive.google.com/file/d/0ByhbuWRNNPUyaGhhb2RGWHA3SEk");