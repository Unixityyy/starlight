(function () {
  var searchInput = document.getElementById('songSearch');
  var resultsEl = document.getElementById('searchResults');
  var previewEl = document.getElementById('selectedSongPreview');
  var displayArt = document.getElementById('displayArt');
  var displayTitle = document.getElementById('displayTitle');
  var displayArtist = document.getElementById('displayArtist');
  var displayExplicit = document.getElementById('displayExplicit');
  var submitBtn = document.getElementById('submitBtn');

  var titleField = document.getElementById('songTitle');
  var artistField = document.getElementById('artistName');
  var linkField = document.getElementById('linkUrl');
  var cleanField = document.getElementById('cleanVersion');
  var explicitField = document.getElementById('isExplicit');

  if (!searchInput || !resultsEl) return;

  var USE_APPLE_FALLBACK = true;

  var debounceTimer = null;
  var lookupToken = 0;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clearResults() {
    resultsEl.innerHTML = '';
  }

  function jsonp(url) {
    return new Promise(function (resolve, reject) {
      var cb = 'dz_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      var s = document.createElement('script');

      function cleanup() {
        delete window[cb];
        s.remove();
      }

      window[cb] = function (data) { cleanup(); resolve(data); };
      s.onerror = function () { cleanup(); reject(new Error('JSONP request failed')); };
      s.src = url + '&output=jsonp&callback=' + cb;
      document.head.appendChild(s);
    });
  }

  function stripAccents(s) {
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function normName(s) {
    return stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function titleTokens(s) {
    return stripAccents(s).toLowerCase()
      .replace(/[\(\[].*?[\)\]]/g, '')
      .replace(/[^a-z0-9*\s]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function tokenToRegex(t) {
    return new RegExp('^' + t
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*+/g, '.*') + '$');
  }

  function tokenMatch(a, b) {
    if (a === b) return true;
    if (a.indexOf('*') === -1 && b.indexOf('*') === -1) return false;
    return tokenToRegex(a).test(b) || tokenToRegex(b).test(a);
  }

  function titlesMatch(a, b) {
    var x = titleTokens(a);
    var y = titleTokens(b);
    if (!x.length || x.length !== y.length) return false;
    return x.every(function (t, i) { return tokenMatch(t, y[i]); });
  }

  function searchTitle(s) {
    return titleTokens(s).filter(function (t) {
      return t.indexOf('*') === -1;
    }).join(' ');
  }

  var BAD_VERSION = /remix|live|instrumental|karaoke|acoustic/i;

  function findClean(track) {
    var wantArtist = normName(track.artistName);
    var words = searchTitle(track.trackName);

    var queries = [
      (wantArtist + ' ' + words).trim(),
      'artist:"' + wantArtist + '" track:"' + words + '"'
    ];

    function attempt(i) {
      if (i >= queries.length) return Promise.resolve(null);

      var url = 'https://api.deezer.com/search?limit=50&q=' + encodeURIComponent(queries[i]);
      return jsonp(url).then(function (data) {
        var results = data.data || [];

        var candidates = results.filter(function (t) {
          return !t.explicit_lyrics
            && t.artist && normName(t.artist.name) === wantArtist
            && titlesMatch(t.title, track.trackName)
            && !BAD_VERSION.test(t.title);
        });

        console.log('deezer clean lookup:', queries[i], '->', results.length + ' results,', candidates.length + ' matches');

        if (candidates.length) {
          var edited = candidates.find(function (t) {
            return t.explicit_content_lyrics === 3;
          });
          return edited || candidates[0];
        }
        return attempt(i + 1);
      });
    }

    return attempt(0);
  }

  function findCleanApple(track) {
    var wantArtist = normName(track.artistName);
    var words = searchTitle(track.trackName);

    var url = 'https://itunes.apple.com/search'
      + '?term=' + encodeURIComponent((wantArtist + ' ' + words).trim())
      + '&entity=song&limit=25&country=us';

    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var results = data.results || [];

        var candidates = results.filter(function (t) {
          return t.trackExplicitness !== 'explicit'
            && normName(t.artistName) === wantArtist
            && titlesMatch(t.trackName, track.trackName)
            && !BAD_VERSION.test(t.trackName);
        });

        console.log('apple clean lookup ->', results.length + ' results,', candidates.length + ' matches');

        var cleaned = candidates.find(function (t) {
          return t.trackExplicitness === 'cleaned';
        });
        return cleaned || candidates[0] || null;
      });
  }

  function renderResults(tracks) {
    resultsEl.innerHTML = '';

    if (!tracks.length) {
      resultsEl.innerHTML = '<p class="am-empty">No results.</p>';
      return;
    }

    tracks.forEach(function (track) {
      var isExplicit = track.trackExplicitness === 'explicit';
      var row = document.createElement('div');
      row.className = 'am-result-row';
      row.innerHTML =
        '<img src="' + escapeHtml(track.artworkUrl60) + '" alt="" class="am-result-art">' +
        '<div class="am-result-text">' +
          '<p class="am-result-title">' + escapeHtml(track.trackName) +
            (isExplicit ? ' <span class="explicit-tag">E</span>' : '') +
          '</p>' +
          '<p class="am-result-artist">' + escapeHtml(track.artistName) + '</p>' +
        '</div>';

      row.addEventListener('click', function () {
        selectSong(track, isExplicit);
      });

      resultsEl.appendChild(row);
    });
  }

  function selectSong(track, isExplicit) {
    var token = ++lookupToken;

    titleField.value = track.trackName || '';
    artistField.value = track.artistName || '';
    linkField.value = track.trackViewUrl || '';
    if (cleanField) cleanField.value = '';
    if (explicitField) explicitField.value = isExplicit ? 'Yes' : 'No';

    displayTitle.textContent = track.trackName || '';
    displayArtist.textContent = track.artistName || '';
    displayArt.src = track.artworkUrl100 || track.artworkUrl60 || '';
    displayExplicit.style.display = isExplicit ? 'inline-flex' : 'none';

    if (previewEl) previewEl.classList.remove('d-none');

    if (!isExplicit) {
      if (cleanField) cleanField.value = 'Non-explicit song';
      if (submitBtn) submitBtn.disabled = false;
    } else {
      if (submitBtn) submitBtn.disabled = true;

      findClean(track)
        .then(function (m) {
          if (m) return m.link;
          if (!USE_APPLE_FALLBACK) return '';
          return findCleanApple(track).then(function (a) {
            return a ? a.trackViewUrl : '';
          });
        })
        .catch(function (err) {
          console.error('clean lookup failed:', err);
          return '';
        })
        .then(function (link) {
          if (token !== lookupToken) return;
          if (cleanField) cleanField.value = link;
          if (submitBtn) submitBtn.disabled = false;
        });
    }

    clearResults();
    searchInput.value = '';
  }

  function runSearch(term) {
    var url = 'https://api.deezer.com/search?limit=20&q=' + encodeURIComponent(term);

    jsonp(url)
      .then(function (data) {
        var tracks = (data.data || []).map(function (t) {
          return {
            trackName: t.title,
            artistName: t.artist.name,
            artworkUrl60: t.album.cover_small,
            artworkUrl100: t.album.cover_medium,
            trackExplicitness: t.explicit_lyrics ? 'explicit' : 'notExplicit',
            trackViewUrl: t.link
          };
        });
        renderResults(tracks);
      })
      .catch(function (err) {
        resultsEl.innerHTML = '<p class="am-empty">Couldn\u2019t reach the search service right now.</p>';
        console.error(err);
      });
  }

  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var term = searchInput.value.trim();

    if (term.length < 2) {
      clearResults();
      return;
    }

    debounceTimer = setTimeout(function () { runSearch(term); }, 400);
  });
})();