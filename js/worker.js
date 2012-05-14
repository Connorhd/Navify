self.onmessage = function(e) {
	var data = JSON.parse(e.data);
	var add = [];
	data.collection.forEach(function (track) {
		if (data.filter.indexOf(track.album.artist.uri) != -1 && data.filter.indexOf(track.album.uri) != -1) {
			if (data.tracks.indexOf(track.ui) != -1) {
				delete data.tracks[data.tracks.indexOf(track.ui)];
			} else {
				add.push(track.uri);
			}
		}
	});
	postMessage(JSON.stringify({
		add: add.filter(function (t) { return t != null }),
		remove: data.tracks.filter(function (t) { return t != null })
	}));
};