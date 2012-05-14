self.onmessage = function(e) {
	var data = JSON.parse(e.data);
	var tracks = [];
	data.collection.forEach(function (track) {
		if (data.filter.indexOf(track.album.artist.uri) != -1 && data.filter.indexOf(track.album.uri) != -1) {
			tracks.push(track.uri);
		}
	});
	postMessage(JSON.stringify(tracks));
};