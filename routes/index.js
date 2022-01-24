var express = require('express');
var models = require('../models/models.js');


var router = express.Router();


router.get('/addToWatchList/:filmName', async function(req, res, next) {
	let filmName = req.params.filmName;

	let filmObj = await models.Film.findOne({
		where: {
			title: filmName
		}
	});

	//fetch the watch list object
	let watchListObj = await models.ToWatchList.findOne({
		where: {
			name: "My Watch List"
		}
	})
	//create the join table object to add the film to the watch list
	let addedFilm = await watchListObj.addFilm(filmObj);
  res.json({'success': 'success'});
});





/*
ROUTER TO MARK A FILM AS 'WATCHED' --- 

one thing you could also do here is check to see if the watched film is 
in the 'TO WATCH' list and remove it from there
*/
router.get('/markAsWatched/:filmName', async function(req, res, next) {
	let filmName = req.params.filmName;

	let filmObj = await models.Film.findOne({
		where: {
			title: filmName
		}
	});

	let watchedListObj = await models.WatchedList.findOne({
		where: {
			name: "Already Seen"
		}
	})

	//create the join table object to add the film to the list
	let addedFilm = await watchedListObj.addFilm(filmObj);

  res.json({'success': 'success'});
});


/* GET home page. */
router.get('/', async function(req, res, next) {
	let ff = await models.Film.findAll()
		.then(films => {
			return films
		});
		console.log(ff);
  res.render('index', { title: 'Horror Films' , films: ff});
});

module.exports = router;
