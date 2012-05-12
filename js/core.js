// Initialize the Spotify objects
var sp = getSpotifyApi(1),
	models = sp.require("sp://import/scripts/api/models"),
	views = sp.require("sp://import/scripts/api/views"),
	ui = sp.require("sp://import/scripts/ui");
	player = models.player,
	library = models.library,
	application = models.application

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
	
// Handle items 'dropped' on your icon
application.observe(models.EVENT.LINKSCHANGED, handleLinks);

function handleLinks() {
	var links = models.application.links;
	// Deal with new playlist
}

// Backbone setup
var Item = Backbone.Model.extend({
	idAttribute: 'uri'
});
var Set = Backbone.Collection.extend({
	model: Item
});

var Column = Backbone.View.extend({
	tagName: "div",
	className: "column",
	events: {
		"click .item": "itemClick",
		"dblclick .item": "itemDblClick"
	},
	itemClick: function (e) {
		if (e.shiftKey && $(e.target).parent().find('.lastclicked').length == 1) {
			var selected = $(e.target).parent().find('.lastclicked').hasClass('selected');
			var start = Math.min($(e.target).index(), $(e.target).parent().find('.lastclicked').index());
			var end = Math.max($(e.target).index(), $(e.target).parent().find('.lastclicked').index());
			$(e.target).parent().children().each(function (i, x) {
				if (i >= start && i <= end) {
					if (selected) {
						$(x).addClass('selected');
					} else {
						$(x).removeClass('selected');
					}
				}
			});
			$(e.target).parent().find('.item').removeClass('lastclicked');
			$(e.target).addClass('lastclicked');
		} else {
			$(e.target).parent().find('.item').removeClass('lastclicked');
			$(e.target).toggleClass('selected').addClass('lastclicked');
		}
	},
	itemDblClick: function (e) {
		$(e.target).parent().find('.item').removeClass('selected').removeClass('lastclicked');
		$(e.target).addClass('selected').addClass('lastclicked');
	},
	initialize: function () {
		var self = this;
		this.collection.on('add', function (added) {
			// TODO: ordering, other events?
			var element = $('<div class="item"></div>').html(added.get('name'));
			self.$el.find('.column-inner').append(element);
		});
	},
	render: function () {
		this.$el.attr('tabindex', 0);
		this.$el.append('<div class="column-inner"></div>');
		return this;
	}
});

var TrackList = Backbone.View.extend({
	tagName: "div",
	events: {
	},
	initialize: function () {
		var self = this;
		this.collection.on('all', function (added) {
			// TODO: be cleverer
			self.render();
		});
	},
	render: function () {
		var tempPlaylist = new models.Playlist();
		this.collection.forEach(function (track) {
			tempPlaylist.add(models.Track.fromURI(track.id));
		});
		var playlistList = new views.List(tempPlaylist, function (track) { return new views.Track(track, FIELD.ALBUM | FIELD.NAME | FIELD.ARTIST | FIELD.STAR | FIELD.DURATION);});
		this.$el.empty().append(playlistList.node);
		return this;
	}
});


$(function(){
	console.log('Loaded.');

	// Run on application load
	handleLinks();
	
	artistsCollection = new Set();
	var artistsView = new Column({
		collection: artistsCollection
	});
	artistsView.render();
	$('#columns').append(artistsView.el);
	
	albumsCollection = new Set();
	var albumsView = new Column({
		collection: albumsCollection
	});
	albumsView.render();
	albumsView.$el.addClass('lastcolumn');
	$('#columns').append(albumsView.el);
	
	tracksCollection = new Set();
	var tracksView = new TrackList({
		collection: tracksCollection
	});
	tracksView.render();
	$('body').append(tracksView.el);
	
	// Load in users library
	models.library.tracks.forEach(function (track) {
		artistsCollection.add(new Item(track.data.artists[0]));
		albumsCollection.add(new Item(track.data.album));
		// Silent because adding is pretty slow if we do a lot at once
		tracksCollection.add(new Item(track.data), {silent: true});
	});
	// Force a track list update
	tracksCollection.trigger('update');
});