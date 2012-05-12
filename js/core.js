// Initialize the Spotify objects
var sp = getSpotifyApi(1),
	models = sp.require("sp://import/scripts/api/models"),
	views = sp.require("sp://import/scripts/api/views"),
	ui = sp.require("sp://import/scripts/ui");
	player = models.player,
	library = models.library,
	application = models.application

// Handle items 'dropped' on your icon
application.observe(models.EVENT.LINKSCHANGED, handleLinks);

function handleLinks() {
	var links = models.application.links;
	// Deal with new playlist
}

$(function(){
	console.log('Loaded.');
	
	// Run on application load
	handleLinks();
	
	var tempPlaylist = new models.Playlist();
	
	var artists = [];
	// Load in users library
	models.library.tracks.forEach(function (track) {
		if (artists.indexOf(track.data.artists[0].name) == -1) {
			artists.push(track.data.artists[0].name);
		}
		tempPlaylist.add(track);
	});
	var FIELD = {
		ALBUM:      1 << 0,
		ARTIST:     1 << 1,
		DOWNLOAD:   1 << 2,
		DURATION:   1 << 3,
		IMAGE:      1 << 4,
		NAME:       1 << 5,
		NUMBER:     1 << 6,
		POPULARITY: 1 << 7,
		PURCHASE:   1 << 8,
		SHARE:      1 << 9,
		STAR:       1 << 10,
		TRACK:      1 << 11,
		USER:       1 << 12
	};
	var playlistList = new views.List(tempPlaylist, function (track) { return new views.Track(track, FIELD.ALBUM | FIELD.NAME | FIELD.ARTIST | FIELD.STAR | FIELD.DURATION);});
	$("#tracks").empty();
	$("#tracks").append(playlistList.node);
	$("#artists").empty();
	artists.forEach(function (artist) {
		$("#artists").append('<div class="item">'+artist+'</div>');
	});
});