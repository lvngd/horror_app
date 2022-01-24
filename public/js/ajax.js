
//NEED TO USE FUNCTION HERE, NOT ARROW FUNCTION
//OTHERWISE this REFERS TO THE WINDOW
$('button.addToWatchList').on('click', function(e){
	e.preventDefault();

	//this is hacky, we would do this in a better way
	let classes = this.className.split(' ');
	let currentFilm = classes[1];
	$.ajax({
		type: "GET",
		url: `/addToWatchList/${currentFilm}`,
		success: function(response,data){
			console.log(response);
		},
		error: function(rs,e){
			console.log("error");
		}
	})
})


$('button.addWatchedList').on('click', function(e){
	e.preventDefault();

	//this is hacky, we would do this in a better way
	let classes = this.className.split(' ');
	let currentFilm = classes[1];

	$.ajax({
		type: "GET",
		url: `/markAsWatched/${currentFilm}`,
		success: function(response,data){
			console.log(response);
		},
		error: function(rs,e){
			console.log("error");
		}
	})
})