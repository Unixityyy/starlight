(function () {
  var pool = window.randomTextPool || [];
  var taglineEl = document.getElementById('tagline');
  if (taglineEl && pool.length) {
    taglineEl.innerHTML = pool[Math.floor(Math.random() * pool.length)];
  }

  var grid = document.getElementById('songGrid');
  var songs = window.STARLIGHT_SONGS || [];

  function svgPlay() {
    return '<img src="/assets/img/play.svg" alt="">';
  }

  var requestCard = document.createElement('a');
  requestCard.href = '/request/';
  requestCard.className = 'card request-card';
  requestCard.innerHTML =
    '<div class="plus">+</div>' +
    '<h3>Missing Something?</h3>' +
    '<p>Request a song through our form.</p>';
  grid.appendChild(requestCard);

  songs.forEach(function (song) {
    var card = document.createElement('div');
    card.className = 'card song-card';

    var explicitBadge = song.isExplicit
      ? '<span class="explicit-tag" title="Explicit">E</span>'
      : '';

    card.innerHTML =
      '<div class="cover-wrap">' +
        '<img src="' + song.cover + '" alt="' + escapeHtml(song.title) + ' cover art" loading="lazy">' +
      '</div>' +
      '<h3><span class="title-text">' + escapeHtml(song.title) + '</span>' + explicitBadge + '</h3>' +
      '<p class="artist">' + escapeHtml(song.artist) + '</p>' +
      '<button class="listen-btn" type="button">' + svgPlay() + ' Listen</button>';

    card.querySelector('.listen-btn').addEventListener('click', function () {
      try {
        sessionStorage.setItem('starlight_now_playing_id', String(song.id));
      } catch (e) {}
      window.location.href = '/player/';
    });

    grid.appendChild(card);
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
