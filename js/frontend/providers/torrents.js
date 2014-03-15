App.getTorrentsCollection = function (options) {

    var url = 'http://yts.re/api/list.json?sort=seeds&limit=50';

    if (options.genre) {
        url += '?genre=' + options.genre;
    } else {
        if (options.keywords) {
            url += '?keywords=' + options.keywords;
        } 
    }

    if (options.page && options.page.match(/\d+/)) {
        var str = url.match(/\?/) ? '&' : '?';

        url += str + 'set=' + options.page;
    }
    var MovieTorrentCollection = Backbone.Collection.extend({
        url: url,
        model: App.Model.Movie,
        parse: function (data) {
            var movies = [];
            var memory = {};
                        
            if (data.error || typeof data.MovieList === 'undefined') {
                return movies;
            }

            data.MovieList.forEach(function (movie) {
                // Temporary object
                var movieModel = {
                    imdb:       movie.ImdbCode.replace('tt', ''),
                    year:       movie.MovieYear,
                    title:      movie.MovieTitleClean,
                    torrent:    movie.TorrentUrl,
                    torrents:   {},
                    quality:    movie.Quality,
                    seeders:    movie.TorrentSeeds,
                    leechers:   movie.TorrentPeers
                };
                
                var stored = memory[movieModel.imdb];
                
 
                var subtitles = {};
                movie.subtitles = []; //create empty list because this source does not have subtitles
              
                if (stored.quality !== movieModel.quality && movieModel.quality === '720p') {
                    stored.torrent = movieModel.torrent;
                    stored.quality = '720p';
                }

                
                // Set it's correspondent quality torrent URL.
                stored.torrents[movie.Quality] = movie.TorrentUrl;

                if( (typeof movie.subtitles == 'undefined' || movie.subtitles.length == 0) && (typeof movie.videos == 'undefined' || movie.videos.length == 0) ){ console.log('aaa'); }
                
                               // Push it if not currently on array.
                if (movies.indexOf(stored) === -1) {
                    movies.push(stored);
                }
            });
            
            console.log('Torrents found:', data.MovieList.length);
            
            return movies;
        }
    });

    return new MovieTorrentCollection();
};
