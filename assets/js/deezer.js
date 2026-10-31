function selectSong(track, isExplicit) {
  var token = ++lookupToken;

  titleField.value = track.trackName || '';
  artistField.value = track.artistName || '';
  linkField.value = track.trackViewUrl || '';
  if (cleanField) cleanField.value = '';

  displayTitle.textContent = track.trackName || '';
  displayArtist.textContent = track.artistName || '';
  displayArt.src = track.artworkUrl100 || track.artworkUrl60 || '';
  displayExplicit.style.display = isExplicit ? 'inline-flex' : 'none';

  if (previewEl) previewEl.classList.remove('d-none');

  if (!isExplicit) {
    // no lookup needed
    if (cleanField) cleanField.value = 'Non-explicit song';
    if (submitBtn) submitBtn.disabled = false;
  } else {
    // block submit until the lookup finishes so the field is never empty
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