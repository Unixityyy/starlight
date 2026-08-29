window.ITUNES_SEARCH_CONFIG = {
  country: 'us'
};

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

  if (!searchInput || !resultsEl) return;

  var config = window.ITUNES_SEARCH_CONFIG || {};
  var debounceTimer = null;

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
        '<img src="' + track.artworkUrl60 + '" alt="" class="am-result-art">' +
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
    titleField.value = track.trackName || '';
    artistField.value = track.artistName || '';
    linkField.value = track.trackViewUrl || '';

    displayTitle.textContent = track.trackName || '';
    displayArtist.textContent = track.artistName || '';
    displayArt.src = track.artworkUrl100 || track.artworkUrl60 || '';
    displayExplicit.style.display = isExplicit ? 'inline-flex' : 'none';

    if (previewEl) previewEl.classList.remove('d-none');
    if (submitBtn) submitBtn.disabled = false;

    clearResults();
    searchInput.value = '';
  }

  function runSearch(term) {
    var country = config.country || 'us';
    var url = 'https://itunes.apple.com/search'
      + '?term=' + encodeURIComponent(term)
      + '&entity=song'
      + '&limit=20'
      + '&country=' + encodeURIComponent(country)
      + '&explicit=Yes';

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderResults(data.results || []);
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
