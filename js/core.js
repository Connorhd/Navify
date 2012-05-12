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
	idAttribute: 'uri',
	addToFilter: function () {
		filter.add(this);
	},
	removeFromFilter: function () {
		filter.remove(this);
	}
});
var Set = Backbone.Collection.extend({
	model: Item
});

var filter = new Set();

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
						$(x).data('model').addToFilter();
					} else {
						$(x).removeClass('selected');
						$(x).data('model').removeFromFilter();
					}
				}
			});
			$(e.target).parent().find('.item').removeClass('lastclicked');
			$(e.target).addClass('lastclicked');
		} else {
			$(e.target).parent().find('.item').removeClass('lastclicked');
			if ($(e.target).hasClass('selected')) {
				$(e.target).removeClass('selected').addClass('lastclicked');
				$(e.target).data('model').removeFromFilter();
			} else {
				$(e.target).addClass('selected').addClass('lastclicked');
				$(e.target).data('model').addToFilter();
			}
		}
		filter.trigger('update');
	},
	itemDblClick: function (e) {
		$(e.target).parent().find('.item').each(function (i, element) {
			$(element).removeClass('selected').removeClass('lastclicked');
			$(element).data('model').removeFromFilter();
		});
		$(e.target).addClass('selected').addClass('lastclicked');
		$(e.target).data('model').addToFilter();
		filter.trigger('update');
	},
	initialize: function () {
		var self = this;
		this.collection.on('add', function (added) {
			// TODO: ordering, other events?
			var element = $('<div class="item"></div>').html(added.get('name'));
			element.data('model', added);
			self.$el.find('.column-inner').append(element);
		});
	},
	render: function () {
		this.$el.attr('tabindex', 0);
		this.$el.append('<div class="title">'+this.options.title+'</div>');
		this.$el.append('<div class="column-scroll"><div class="column-inner"></div></div>');
		return this;
	}
});

var TrackList = Backbone.View.extend({
	tagName: "div",
	events: {
	},
	initialize: function () {
		var self = this;
		// TODO: be cleverer
		this.collection.on('all', function () {
			self.render();
		});
		filter.on('update', function () {
			self.render();
		});
	},
	render: function () {
		var tempPlaylist = new models.Playlist();
		this.collection.filter(function (track) { 
			if (filter.get(track.get('artists')[0].uri)) {
				return true; 
			} else {
				return false;
			}
		}).forEach(function (track) {
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
	
	albumsCollection = new Set();
	var albumsView = new Column({
		collection: albumsCollection,
		title: "Albums"
	});
	albumsView.render();
	albumsView.$el.addClass('lastcolumn');
	$('#columns').append(albumsView.el);
	
	artistsCollection = new Set();
	var artistsView = new Column({
		collection: artistsCollection,
		title: "Artists"
	});
	artistsView.render();
	$('#columns').append(artistsView.el);
	
	playlistCollection = new Set();
	var playlistView = new Column({
		collection: playlistCollection,
		title: "Playlists"
	});
	playlistView.render();
	$('#columns').append(playlistView.el);
	
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