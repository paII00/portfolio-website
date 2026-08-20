const dot = document.querySelector('.cursor-dot');
if (dot) {
  window.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  });
}

const clock = document.getElementById('clock');
if (clock) {
  const updateClock = () => {
    const now = new Date();
    clock.textContent = `${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Stuttgart`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

const modal = document.querySelector('.project-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.querySelector('.modal-close');
const projectTopButton = document.querySelector('.project-top-button');
const projectViews = document.querySelectorAll('[data-project-view]');

const closeProject = () => {
  if (!modal) return;
  modal.querySelectorAll('video').forEach((video) => {
    video.pause();
    delete video.dataset.visibleStarted;
  });
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { if (!modal.classList.contains('open')) modal.style.visibility = 'hidden'; }, 700);
  document.body.style.overflow = '';
};

if (modal && modalClose) {
  document.querySelectorAll('.work-card,.project-row').forEach((el) => {
    const openProject = () => {
      const projectId = el.dataset.projectId || 'placeholder';
      projectViews.forEach((view) => {
        view.hidden = view.dataset.projectView !== projectId;
      });
      if (projectId === 'placeholder' && modalTitle) {
        modalTitle.textContent = el.dataset.project || el.querySelector('.project-title')?.textContent || 'Projekt';
      }
      const activeView = Array.from(projectViews).find((view) => view.dataset.projectView === projectId);
      activeView?.querySelectorAll('video').forEach((video) => {
        video.currentTime = 0;
        delete video.dataset.visibleStarted;
        video.load();
        if (video.dataset.playWhenVisible === 'true') {
          video.pause();
          return;
        }
        video.play().catch(() => {});
      });
      modal.scrollTop = 0;
      modal.style.visibility = 'visible';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => modalClose.focus(), 700);
    };
    el.addEventListener('click', openProject);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject();
      }
    });
  });
  modalClose.addEventListener('click', closeProject);
  projectTopButton?.addEventListener('click', () => {
    modal.scrollTo({ top: 0, behavior: 'smooth' });
  });
  modal.querySelectorAll('.case-back').forEach((button) => button.addEventListener('click', closeProject));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeProject();
  });
}

const visibleVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    const projectView = video.closest('[data-project-view]');
    if (projectView?.hidden) {
      video.pause();
      return;
    }
    if (!entry.isIntersecting) return;
    if (video.dataset.visibleStarted !== 'true') {
      video.load();
      video.currentTime = Number(video.dataset.startTime || 0);
      video.dataset.visibleStarted = 'true';
    }
    video.play().catch(() => {});
  });
}, { threshold: 0.22, rootMargin: '160px 0px' });

document.querySelectorAll('video[data-play-when-visible="true"]').forEach((video) => {
  const markReady = () => video.closest('.ns-website-visual')?.classList.add('is-video-ready');
  const keepStartTime = () => {
    const startTime = Number(video.dataset.startTime || 0);
    if (startTime > 0 && video.dataset.visibleStarted === 'true' && video.currentTime < startTime) {
      video.currentTime = startTime;
    }
  };
  video.addEventListener('loadeddata', markReady, { once: true });
  video.addEventListener('canplay', markReady, { once: true });
  video.addEventListener('timeupdate', keepStartTime);
  visibleVideoObserver.observe(video);
});

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track?.children || []);
  const current = carousel.querySelector('[data-carousel-current]');
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  let index = 0;

  if (!track || slides.length === 0) return;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (current) current.textContent = String(index + 1).padStart(2, '0');
  };

  prev?.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  next?.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateCarousel();
  });

  updateCarousel();
});

document.querySelectorAll('.sb-fixed-poster-gif').forEach((posterGif) => {
  const frames = Array.from(posterGif.querySelectorAll('figure'));
  if (frames.length < 2) return;
  let activeIndex = Math.max(0, frames.findIndex((frame) => frame.classList.contains('is-active')));
  frames.forEach((frame, index) => {
    frame.classList.toggle('is-active', index === activeIndex);
    frame.classList.remove('is-leaving');
  });

  window.setInterval(() => {
    const previousIndex = activeIndex;
    activeIndex = (activeIndex + 1) % frames.length;
    frames.forEach((frame, index) => {
      frame.classList.toggle('is-active', index === activeIndex);
      frame.classList.toggle('is-leaving', index === previousIndex);
    });
    window.setTimeout(() => {
      frames[previousIndex]?.classList.remove('is-leaving');
    }, 520);
  }, 2200);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.animate(
        [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 850, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
      );
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.work-card,.project-row,.about-details,.image-placeholder').forEach((el) => io.observe(el));

document.querySelectorAll('.contact-stopmotion').forEach((button) => {
  const image = button.querySelector('img');
  const gifSrc = button.dataset.gifSrc;
  if (!image || !gifSrc) return;

  button.addEventListener('click', () => {
    image.src = `${gifSrc}?play=${Date.now()}`;
    button.classList.add('is-playing');
  });
});


// One-click opening, then a simple stationary fade once the envelope is open.
(() => {
  const scene = document.getElementById('mailScene');
  const hint = document.getElementById('envelopeHint');
  const reveal = document.getElementById('heroReveal');
  const description = reveal?.querySelector('.hero-description');
  const scroll = reveal?.querySelector('.hero-scroll');

  if (!scene || !reveal || !description || !scroll) return;

  // Explicit initial state prevents a first-paint flash.
  reveal.setAttribute('aria-hidden', 'true');
  description.classList.remove('is-visible');
  scroll.classList.remove('is-visible');

  scene.addEventListener('click', () => {
    scene.classList.add('is-opening');
    scene.setAttribute('aria-expanded', 'true');
    scene.setAttribute('aria-label', 'Geöffneter Brief');
    if (hint) hint.classList.add('is-hidden');

    // The envelope is visually open around here. Start the text immediately after.
    window.setTimeout(() => {
      scene.classList.add('is-open');
      scene.classList.remove('is-opening');
      reveal.setAttribute('aria-hidden', 'false');

      // One frame in the hidden state, then fade at the exact same position.
      requestAnimationFrame(() => {
        description.classList.add('is-visible');
      });
    }, 900);

    window.setTimeout(() => {
      scroll.classList.add('is-visible');
    }, 1250);
  }, { once: true });
})();
