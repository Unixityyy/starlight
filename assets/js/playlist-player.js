(function () {
  var audio = document.getElementById('audio');

  var npCover = document.getElementById('npCover');
  var npTitle = document.getElementById('npTitle');
  var npArtist = document.getElementById('npArtist');

  var progressTrack = document.getElementById('progressTrack');
  var progressFill = document.getElementById('progressFill');
  var progressHandle = document.getElementById('progressHandle');
  var timeCurrent = document.getElementById('timeCurrent');
  var timeDuration = document.getElementById('timeDuration');

  var playBtn = document.getElementById('playBtn');
  var repeatBtn = document.getElementById('repeatBtn');
  var uploadBtn = document.getElementById('uploadBtn');
  var uploadInput = document.getElementById('uploadInput');
  var promptUploadInput = document.getElementById('promptUploadInput');

  var libraryList = document.getElementById('libraryList');
  var libraryCount = document.getElementById('libraryCount');
  var uploadPrompt = document.getElementById('playlistUploadPrompt');

  var ICON_PLAY = '<img src="/assets/img/play.svg" alt="">';
  var ICON_PAUSE = '<img src="/assets/img/pause.svg" alt="">';

  var catalog = window.STARLIGHT_SONGS || [];
  var playlist = [];
  var currentSong = null;
  var isDragging = false;

  var currentAudioBlobUrl = null;
  var currentArtworkBlobUrl = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderLibrary() {
    libraryList.innerHTML = '';
    if (!playlist.length) return;

    playlist.forEach(function (song) {
      var row = document.createElement('div');
      row.className = 'library-row';
      if (currentSong && String(currentSong.id) === String(song.id)) row.classList.add('playing');

      var eq = (currentSong && String(currentSong.id) === String(song.id) && !audio.paused)
        ? '<span class="now-playing-eq"><span></span><span></span><span></span></span>'
        : '';

      row.innerHTML =
        '<div class="row-cover"><img src="' + song.cover + '" alt="" loading="lazy"></div>' +
        '<div class="row-text">' +
          '<p class="row-title">' + escapeHtml(song.title) + eq + '</p>' +
          '<p class="row-artist">' + escapeHtml(song.artist) + '</p>' +
        '</div>' +
        (song.isExplicit ? '<span class="row-explicit" title="Explicit">E</span>' : '');

      row.addEventListener('click', function () { loadSong(song, true); });
      libraryList.appendChild(row);
    });
  }

  function fetchPlayableSource(fileUrl) {
    if (fileUrl.indexOf('blob:') === 0 || fileUrl.indexOf('data:') === 0) {
      return Promise.resolve(fileUrl);
    }
    return fetch(fileUrl).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + fileUrl);
      return res.blob();
    }).then(function (blob) {
      return URL.createObjectURL(blob);
    });
  }

  function getSquareArtwork(imageUrl, size) {
    if (!imageUrl) return Promise.resolve(null);
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
      return Promise.resolve(imageUrl);
    }

    return fetch(imageUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) { return createImageBitmap(blob); })
      .then(function (bitmap) {
        var side = Math.min(bitmap.width, bitmap.height);
        var sx = (bitmap.width - side) / 2;
        var sy = (bitmap.height - side) / 2;

        var canvas = new OffscreenCanvas(size, size);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

        return canvas.convertToBlob({ type: 'image/png' });
      })
      .then(function (blob) { return URL.createObjectURL(blob); })
      .catch(function (err) {
        console.error('Could not prepare square artwork, falling back to the original image', err);
        return imageUrl;
      });
  }

  function updateMediaSessionMetadata(song) {
    if (!('mediaSession' in navigator)) return;

    getSquareArtwork(song.cover, 512).then(function (artworkUrl) {
      if (currentArtworkBlobUrl) {
        URL.revokeObjectURL(currentArtworkBlobUrl);
        currentArtworkBlobUrl = null;
      }
      if (artworkUrl && artworkUrl.indexOf('blob:') === 0) {
        currentArtworkBlobUrl = artworkUrl;
      }

      if (!currentSong || String(currentSong.id) !== String(song.id)) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: 'Starlight Sound Library',
        artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }] : []
      });
    });
  }

  function updateMediaSessionPositionState() {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    if (!isFinite(audio.duration) || audio.duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(audio.currentTime, audio.duration)
      });
    } catch (e) {}
  }

  function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', function () {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    });
    navigator.mediaSession.setActionHandler('pause', function () {
      audio.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);

    try {
      navigator.mediaSession.setActionHandler('seekto', function (details) {
        if (!isFinite(audio.duration)) return;
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(details.seekTime);
        } else {
          audio.currentTime = details.seekTime;
        }
        updateMediaSessionPositionState();
      });
    } catch (e) {}
  }

  function currentIndex() {
    if (!currentSong) return -1;
    return playlist.findIndex(function (s) { return String(s.id) === String(currentSong.id); });
  }

  function playNext() {
    var idx = currentIndex();
    if (idx === -1 || idx + 1 >= playlist.length) return;
    loadSong(playlist[idx + 1], true);
  }

  function playPrevious() {
    var idx = currentIndex();
    if (idx <= 0) return;
    loadSong(playlist[idx - 1], true);
  }

  function loadSong(song, autoplay) {
    currentSong = song;
    npCover.src = song.cover || '';
    npTitle.textContent = song.title;
    npArtist.textContent = song.artist;

    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
    timeCurrent.textContent = '0:00';
    timeDuration.textContent = '0:00';

    renderLibrary();
    updateMediaSessionMetadata(song);

    playBtn.classList.add('buffering');
    playBtn.title = 'Loading\u2026';

    fetchPlayableSource(song.file).then(function (resolvedUrl) {
      if (currentAudioBlobUrl) {
        URL.revokeObjectURL(currentAudioBlobUrl);
        currentAudioBlobUrl = null;
      }
      if (resolvedUrl !== song.file) {
        currentAudioBlobUrl = resolvedUrl;
      }

      if (!currentSong || String(currentSong.id) !== String(song.id)) return;

      audio.src = resolvedUrl;
      playBtn.classList.remove('buffering');
      playBtn.title = 'Play';

      if (autoplay) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      }
    }).catch(function (err) {
      playBtn.classList.remove('buffering');
      playBtn.title = 'Play';
      console.error('Could not load', song.file, err);
    });
  }

  function setPlayIcon(playing) {
    playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    playBtn.title = playing ? 'Pause' : 'Play';
  }

  playBtn.addEventListener('click', function () {
    if (!currentSong) return;
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', function () {
    setPlayIcon(true);
    renderLibrary();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  audio.addEventListener('pause', function () {
    setPlayIcon(false);
    renderLibrary();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  });
  audio.addEventListener('ended', function () {
    if (audio.loop) return;
    setPlayIcon(false);
    renderLibrary();
    playNext();
  });

  audio.addEventListener('error', function () {
    console.error('Audio element error for', currentSong && currentSong.file, audio.error);
  });

  audio.addEventListener('timeupdate', function () {
    if (isDragging) return;
    updateProgressUI();
    updateMediaSessionPositionState();
  });

  audio.addEventListener('loadedmetadata', function () {
    updateDurationDisplay();
    updateMediaSessionPositionState();
  });

  audio.addEventListener('durationchange', function () {
    updateDurationDisplay();
  });

  function updateDurationDisplay() {
    var d = audio.duration;
    timeDuration.textContent = (isFinite(d) && d > 0) ? formatTime(d) : '0:00';
  }

  function updateProgressUI() {
    var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = pct + '%';
    progressHandle.style.left = pct + '%';
    timeCurrent.textContent = formatTime(audio.currentTime);
    updateDurationDisplay();
  }

  function seekFromClientX(clientX) {
    var rect = progressTrack.getBoundingClientRect();
    var pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    progressFill.style.width = (pct * 100) + '%';
    progressHandle.style.left = (pct * 100) + '%';
    if (audio.duration) timeCurrent.textContent = formatTime(pct * audio.duration);
    return pct;
  }

  progressTrack.addEventListener('pointerdown', function (e) {
    if (!currentSong) return;
    isDragging = true;
    progressTrack.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });

  progressTrack.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    seekFromClientX(e.clientX);
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    if (!audio.duration) return;

    var pct = seekFromClientX(e.clientX);
    audio.currentTime = Math.min(pct * audio.duration, audio.duration - 0.1);
    updateMediaSessionPositionState();
  }

  progressTrack.addEventListener('pointerup', endDrag);
  progressTrack.addEventListener('pointercancel', function () { isDragging = false; });

  repeatBtn.addEventListener('click', function () {
    audio.loop = !audio.loop;
    repeatBtn.classList.toggle('active', audio.loop);
    repeatBtn.setAttribute('aria-pressed', audio.loop ? 'true' : 'false');
  });

  function handlePlaylistFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var ids = String(reader.result).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var resolved = ids
        .map(function (id) { return catalog.find(function (s) { return String(s.id) === String(id); }); })
        .filter(Boolean);

      playlist = resolved;
      uploadPrompt.style.display = 'none';
      libraryList.style.display = '';

      if (!playlist.length) {
        libraryCount.textContent = 'No songs matched this playlist';
        libraryList.innerHTML = '<div class="empty-note">None of the song IDs in this file matched the library.</div>';
        return;
      }

      var mismatchNote = resolved.length < ids.length ? ' (some IDs in the file didn\u2019t match)' : '';
      libraryCount.textContent = playlist.length + (playlist.length === 1 ? ' song' : ' songs') + mismatchNote;

      renderLibrary();
      loadSong(playlist[0], true);
    };
    reader.readAsText(file);
  }

  uploadBtn.addEventListener('click', function () { uploadInput.click(); });
  uploadInput.addEventListener('change', function (e) {
    handlePlaylistFile(e.target.files && e.target.files[0]);
    uploadInput.value = '';
  });
  promptUploadInput.addEventListener('change', function (e) {
    handlePlaylistFile(e.target.files && e.target.files[0]);
    promptUploadInput.value = '';
  });

  setupMediaSessionHandlers();

  libraryList.style.display = 'none';
})();
