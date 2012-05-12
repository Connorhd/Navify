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

// Backbone setup
var Artist = Backbone.Model.extend({
	idAttribute: 'uri'
});
var Artists = Backbone.Collection.extend({
	model: Artist
});

var Column = Backbone.View.extend({
	tagName: "div",
	className: "column",
	events: {
	},
	initialize: function () {
		var self = this;
		this.collection.on('add', function (added) {
			self.$el.find('.column-inner').append('<div class="item">'+added.get('name')+'</div>');
		});
	},
	render: function () {
		this.$el.attr('tabindex', 0);
		this.$el.append('<div class="column-inner"></div>');
		return this;
	}
});


$(function(){
	console.log('Loaded.');

	artistsCollection = new Artists();
	var artistsView = new Column({
		collection: artistsCollection
	});
	artistsView.render();
	$('#columns').append(artistsView.el);
	
	// Run on application load
	handleLinks();
	
	var tempPlaylist = new models.Playlist();
	
	// Load in users library
	models.library.tracks.forEach(function (track) {
		artistsCollection.add(new Artist(track.data.artists[0]));

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
});