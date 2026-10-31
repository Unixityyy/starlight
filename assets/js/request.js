(function () {
  var form = document.getElementById('requestForm');
  var success = document.getElementById('formSuccess');
  var errorEl = document.getElementById('formError');
  var submitBtn = document.getElementById('submitBtn');
  var previewEl = document.getElementById('selectedSongPreview');
  if (!form) return;

  var SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzYCW7BFxdADUpaQvVEeA2K1W58BZbIZAiSNXa5-HLmans5whxyws2Lmnu4u_tZcC1D/exec';

  var defaultErrorText = errorEl ? errorEl.textContent : '';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    success.classList.remove('visible');
    errorEl.classList.remove('visible');

    var songTitle = document.getElementById('songTitle').value.trim();
    var artistName = document.getElementById('artistName').value.trim();
    var linkUrl = document.getElementById('linkUrl').value.trim();
    var isExplicit = document.getElementById('isExplicit').value.trim();
    var cleanLink = document.getElementById('cleanVersion').value.trim();

    var originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting\u2026';

    var body = new URLSearchParams({
      'Song Name': songTitle,
      'Song Artist': artistName,
      'Is Explicit': isExplicit,
      'Clean Link': cleanLink,
      'Link': linkUrl
    });

    fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result && result.result === 'success') {
          success.classList.add('visible');
          form.reset();
          if (previewEl) previewEl.classList.add('d-none');
        } else {
          errorEl.textContent = (result && result.message)
            ? 'Something went wrong: ' + result.message
            : defaultErrorText;
          errorEl.classList.add('visible');
        }
      })
      .catch(function (err) {
        console.error('Song request failed to send:', err);
        errorEl.textContent = defaultErrorText;
        errorEl.classList.add('visible');
      })
      .finally(function () {
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = !previewEl || previewEl.classList.contains('d-none');
      });
  });
})();