const ICON_IMAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="9" cy="10" r="1.7"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>';
  const ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
  const EQ_BARS = '<span></span><span></span><span></span>';

  // To add real cover art, set "cover" to an image path or URL, e.g. cover: "covers/track-01.jpg"
  // To add a song, set "song" to an audio file path or URL, e.g. song: "songs/track-01.mp3"
  // Leave either as null to keep the placeholder behavior.
  const cds = [
    { id: 1,  title: "ABOUT ME", role: "A Couple Minutes - Olivia Dean", year: "[Year]", medium: "[Medium]", label: "TR-01", cover: "covers/track01.png", song: "songs/A-Couple-Minutes.mp3" },
    { id: 2,  title: "Why I want to be Co-Pres", role: "Make Your Own Kind of Music - Cass Elliot", year: "[Year]", medium: "[Medium]", label: "TR-02", cover: "covers/track02.png", song: "songs/Make-Your-Own.mp3" },
    { id: 3,  title: "2025 Subcommittee", role: "Saturn - SZA", year: "[Year]", medium: "[Medium]", label: "TR-03", cover: "covers/track03.png", song: "songs/saturn.mp3" },
    { id: 4,  title: "2026 Director", role: "For One In My Life - Stevie Wonder", year: "[Year]", medium: "[Medium]", label: "TR-04", cover: "covers/track04.png", song: "songs/for-once-in-my-life.mp3" },
    { id: 5,  title: "2026 Camp Leader", role: "Time of Our Lives - Pitbull", year: "[Year]", medium: "[Medium]", label: "TR-05", cover: "covers/track05.png", song: "songs/time-of-our-lives.mp3" },
    { id: 6,  title: "Visions and Goals", role: "Blessed - Daniel Caesar", year: "[Year]", medium: "[Medium]", label: "TR-06", cover: "covers/track06.png", song: "songs/blessed.mp3" },
    { id: 7,  title: "Contact", role: "Ring Ring Ring - Tyler the Creator", year: "[Year]", medium: "[Medium]", label: "TR-07", cover: "covers/track07.png", song: "songs/ring.mp3" },
    { id: 8,  title: "Playlist", role: "Forrest Gump - Frank Ocean", year: "[Year]", medium: "[Medium]", label: "TR-08", cover: "covers/track08.png", song: "songs/forrest-gump.mp3" }
  ];

  const shelfEl = document.getElementById('shelf');
  const shelfView = document.getElementById('view-shelf');
  const detailView = document.getElementById('view-detail');
  const audioEl = document.getElementById('bgAudio');

  const pauseBtn = document.getElementById('pauseBtn');

  pauseBtn.addEventListener('click', () => {
    if (audioEl.paused) {
      audioEl.play().catch(() => {});
      pauseBtn.textContent = 'Pause music';
      pauseBtn.classList.remove('paused');
    } else {
      audioEl.pause();
      pauseBtn.textContent = 'Play music';
      pauseBtn.classList.add('paused');
    }
  });


  const ROTATIONS = [-7, 5, -9, 6, -4, 8, -6, 4, -8, 6];
  const OFFSETS   = [-14, 10, -6, 16, -10, 14, -8, 12, -16, 8];
  const DELAYS    = [0, 0.6, 1.1, 0.3, 1.6, 0.8, 0.2, 1.3, 0.5, 1.0];
  const HUE_START = [120, 200, 60, 280, 160, 40, 220, 100, 300, 180];

  // --- Audio helpers ---------------------------------------------------
  let detailOpenId = null; // id of the CD currently shown on the detail page, if any

  function playSong(cd, btnEl) {
    document.querySelectorAll('.cd-btn.is-playing').forEach(el => el.classList.remove('is-playing'));
    if (!cd || !cd.song) return;
    if (audioEl.getAttribute('data-src') !== cd.song) {
      audioEl.src = cd.song;
      audioEl.setAttribute('data-src', cd.song);
    }
    audioEl.play().catch(() => {});
    if (btnEl) btnEl.classList.add('is-playing');
  }

  function stopSong() {
    audioEl.pause();
    document.querySelectorAll('.cd-btn.is-playing').forEach(el => el.classList.remove('is-playing'));
  }

  function buildShelf() {
    shelfEl.innerHTML = cds.map((cd, i) => {
      const rot = ROTATIONS[i % ROTATIONS.length];
      const off = OFFSETS[i % OFFSETS.length];
      const delay = DELAYS[i % DELAYS.length];
      const hue = HUE_START[i % HUE_START.length];
      const labelInner = cd.cover
        ? `<div class="cd-hole" aria-hidden="true"></div>`
        : `<div class="cd-label"><span>${ICON_IMAGE}</span><span class="cover-label">Add cover art</span></div><div class="cd-hole" aria-hidden="true"></div>`;
      const discStyle = cd.cover
        ? `--hue-angle:${hue}deg; background-image:url('${cd.cover}'); background-size:cover; background-position:center;`
        : `--hue-angle:${hue}deg;`;
      return `
      <button class="cd-btn" data-id="${cd.id}" aria-label="Open ${cd.title}"
        style="--rot:${rot}deg; --offset:${off}px; --z:${i + 1};">
        <span class="cd-caption-float">${cd.title} — ${cd.role}</span>
        <div class="cd-anim" style="--delay:${delay}s;">
          <div class="cd-disc" style="${discStyle}">
            ${labelInner}
          </div>
        </div>
        <span class="now-playing" aria-hidden="true">${EQ_BARS}</span>
      </button>
    `;
    }).join('');

    shelfEl.querySelectorAll('.cd-btn').forEach((btn, i) => {
      const cd = cds[i];
      btn.addEventListener('click', () => openDetail(btn.dataset.id));

      btn.addEventListener('mouseenter', () => playSong(cd, btn));
      btn.addEventListener('focus', () => playSong(cd, btn));

      btn.addEventListener('mouseleave', () => {
        if (detailOpenId !== cd.id) stopSong();
      });
      btn.addEventListener('blur', () => {
        if (detailOpenId !== cd.id) stopSong();
      });
    });
  }

  function renderDetail(cd) {
    const galleryHTML = [1,2,3].map(() => `
      <div class="gallery-slot">${ICON_IMAGE}<span>Add photo</span></div>
    `).join('');

    const nowPlayingHTML = cd.song
      ? `<p class="now-playing-badge"><span class="now-playing" aria-hidden="true">${EQ_BARS}</span> Now playing</p>`
      : '';

    detailView.innerHTML = `
      <button class="back-btn" id="backBtn" type="button">${ICON_BACK} Back to shelf</button>
      <div class="detail-grid">
        <div class="detail-art" ${cd.cover ? `style="background-image:url('${cd.cover}');"` : ''}>
          ${cd.cover ? '' : ICON_IMAGE + '<span>Add cover image</span>'}
        </div>
        <div>
          <div class="detail-head">
            <p class="kicker">${cd.label}</p>
            <h2 class="display">${cd.title}</h2>
            <p class="role">${cd.role}</p>
          </div>
          ${nowPlayingHTML}
          <dl class="meta-strip">
            <div><dt>Year</dt><dd>${cd.year}</dd></div>
            <div><dt>Medium</dt><dd>${cd.medium}</dd></div>
            <div><dt>Role</dt><dd>${cd.role}</dd></div>
          </dl>
          <div class="placeholder-text">[Write the main description here — what this piece is, why it matters, and the story behind it. Two or three sentences is usually enough.]</div>
          <div class="placeholder-text">[Add a second paragraph here for more detail — process, context, or a specific moment worth mentioning.]</div>
          <p class="gallery-heading">// gallery</p>
          <div class="gallery">${galleryHTML}</div>
        </div>
      </div>
    `;

    document.getElementById('backBtn').addEventListener('click', () => {
      history.pushState({ view: 'shelf' }, '', '#');
      showShelf();
    });
  }

  function openDetail(id) {
    const cd = cds.find(c => String(c.id) === String(id));
    if (!cd) return;
    renderDetail(cd);
    detailOpenId = cd.id;
    playSong(cd, null);
    history.pushState({ view: 'detail', id }, '', '#cd-' + id);
    showDetail();
  }

  function showDetail() {
    shelfView.classList.add('hidden');
    detailView.classList.remove('hidden');
    requestAnimationFrame(() => detailView.classList.add('active'));
    window.scrollTo(0, 0);
  }

  function showShelf() {
    detailOpenId = null;
    stopSong();
    detailView.classList.remove('active');
    setTimeout(() => {
      detailView.classList.add('hidden');
      shelfView.classList.remove('hidden');
    }, 200);
  }

  window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (state && state.view === 'detail') {
      const cd = cds.find(c => String(c.id) === String(state.id));
      if (cd) {
        renderDetail(cd);
        detailOpenId = cd.id;
        playSong(cd, null);
        showDetail();
        return;
      }
    }
    showShelf();
  });

  const hashMatch = location.hash.match(/^#cd-(\d+)/);
  buildShelf();
  if (hashMatch) {
    const cd = cds.find(c => String(c.id) === hashMatch[1]);
    if (cd) {
      renderDetail(cd);
      detailOpenId = cd.id;
      playSong(cd, null);
      shelfView.classList.add('hidden'); detailView.classList.remove('hidden'); detailView.classList.add('active');
    }
  }
