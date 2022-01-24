const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://horroruser:horrorpassword@localhost:5432/horror')


sequelize.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const Film = sequelize.define('film', { title: Sequelize.TEXT});
const ToWatchList = sequelize.define('watchlist', {name: Sequelize.TEXT, });
const WatchedList = sequelize.define('alreadywatchedlist', {name: Sequelize.TEXT})

//join table Films <-> ToWatchList
const FilmsToWatchTable = sequelize.define('filmstowatch', {
  FilmId: {
    type: Sequelize.INTEGER,
    references: {
      model: Film,
      key: 'id'
    }
  },
  ToWatchListId: {
    type: Sequelize.INTEGER,
    references: {
      model: ToWatchList, // 'Actors' would also work
      key: 'id'
    }
  }
});

//join table Films <-> WatchedList
const FilmsWatchedTable = sequelize.define('FilmsWatched', {
  FilmId: {
    type: Sequelize.INTEGER,
    references: {
      model: Film,
      key: 'id'
    }
  },
  WatchedListId: {
    type: Sequelize.INTEGER,
    references: {
      model: WatchedList, // 'Actors' would also work
      key: 'id'
    }
  }
});

Film.belongsToMany(ToWatchList, {through: FilmsToWatchTable});
ToWatchList.belongsToMany(Film, {through: FilmsToWatchTable});

Film.belongsToMany(WatchedList, {through: FilmsWatchedTable});
WatchedList.belongsToMany(Film, {through: FilmsWatchedTable});	


//FORCE: TRUE DROPS TABLES IF THEY EXIST AND CREATES THEM NEW
sequelize.sync({ force: true }).then(result => {
	Film.bulkCreate([
		{title: 'Caged'},
		{title: 'Legion'},
		{title: 'No One Gets Out Alive'},
		{title: 'The Exorcism'},
		{title: 'The Conjuring'},
		{title: 'Scream 4'}
		]).then(() => {
			return Film.findAll();
		}).then((films) => {
			//console.log(films);
		});
	ToWatchList.create({name: "My Watch List"})
		.then(() => {console.log('watch list created')});
	WatchedList.create({name: "Already Seen"})
		.then(() => {console.log('seen list created')});


}).catch(err => {
	console.log(err);
})



module.exports = {
	Film,
	ToWatchList,
	WatchedList
}
