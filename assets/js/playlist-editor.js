(function () {
  var catalog = window.STARLIGHT_SONGS || [];
  var editorLibraryList = document.getElementById('editorLibraryList');
  var editorPlaylistList = document.getElementById('editorPlaylistList');
  var editorPlaylistCount = document.getElementById('editorPlaylistCount');
  var importInput = document.getElementById('importInput');
  var exportBtn = document.getElementById('exportBtn');

  var playlist = [];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function findSong(id) {
    return catalog.find(function (s) { return String(s.id) === String(id); });
  }

  function renderLibrary() {
    editorLibraryList.innerHTML = '';
    catalog.forEach(function (song) {
      var inPlaylist = playlist.some(function (id) { return String(id) === String(song.id); });
      var row = document.createElement('div');
      row.className = 'library-row' + (inPlaylist ? ' playing' : '');

      row.innerHTML =
        '<div class="row-cover"><img src="' + song.cover + '" alt="" loading="lazy"></div>' +
        '<div class="row-text">' +
          '<p class="row-title">' + escapeHtml(song.title) + '</p>' +
          '<p class="row-artist">' + escapeHtml(song.artist) + '</p>' +
        '</div>' +
        (song.isExplicit ? '<span class="row-explicit" title="Explicit">E</span>' : '') +
        '<button type="button" class="row-add-btn">' + (inPlaylist ? 'Added' : 'Add') + '</button>';

      row.querySelector('.row-add-btn').addEventListener('click', function () {
        if (inPlaylist) {
          removeAt(playlist.findIndex(function (id) { return String(id) === String(song.id); }));
        } else {
          playlist.push(song.id);
          render();
        }
      });

      editorLibraryList.appendChild(row);
    });
  }

  function renderPlaylistRows() {
    editorPlaylistList.innerHTML = '';
    editorPlaylistCount.textContent = playlist.length + (playlist.length === 1 ? ' song' : ' songs');

    if (!playlist.length) {
      editorPlaylistList.innerHTML = "<div class='empty-note'>There isn't anything here yet. Try adding some music!</div>";
      return;
    }

    playlist.forEach(function (id, index) {
      var song = findSong(id);
      var row = document.createElement('div');
      row.className = 'library-row';

      var textHtml = song
        ? '<div class="row-cover"><img src="' + song.cover + '" alt="" loading="lazy"></div>' +
          '<div class="row-text"><p class="row-title">' + escapeHtml(song.title) + '</p>' +
          '<p class="row-artist">' + escapeHtml(song.artist) + '</p></div>'
        : '<div class="row-text"><p class="row-title">Unknown song</p></div>';

      row.innerHTML =
        textHtml +
        '<div class="reorder-btns">' +
          '<button type="button" class="reorder-btn up-btn" title="Move up">\u2191</button>' +
          '<button type="button" class="reorder-btn down-btn" title="Move down">\u2193</button>' +
        '</div>' +
        '<button type="button" class="row-remove-btn">Remove</button>';

      row.querySelector('.up-btn').addEventListener('click', function () { move(index, -1); });
      row.querySelector('.down-btn').addEventListener('click', function () { move(index, 1); });
      row.querySelector('.row-remove-btn').addEventListener('click', function () { removeAt(index); });

      editorPlaylistList.appendChild(row);
    });
  }

  function move(index, dir) {
    var newIndex = index + dir;
    if (newIndex < 0 || newIndex >= playlist.length) return;
    var tmp = playlist[index];
    playlist[index] = playlist[newIndex];
    playlist[newIndex] = tmp;
    render();
  }

  function removeAt(index) {
    if (index < 0) return;
    playlist.splice(index, 1);
    render();
  }

  function render() {
    renderLibrary();
    renderPlaylistRows();
  }

  importInput.addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      playlist = String(reader.result).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      render();
    };
    reader.readAsText(file);
    importInput.value = '';
  });

  exportBtn.addEventListener('click', function () {
    var blob = new Blob([playlist.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.slp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  render();
})();
