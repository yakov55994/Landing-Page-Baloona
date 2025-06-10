function setupAccessibility() {
  const toggle = document.getElementById('accessibility-toggle');
  const bar = document.getElementById('accessibility-bar');
  const elementsWithCustomFont = new Map();

  if (!toggle || !bar) return;

  toggle.onclick = (e) => {
    e.stopPropagation();
    bar.style.display = (bar.style.display === 'block') ? 'none' : 'block';
  };

  document.addEventListener('click', (e) => {
    if (!bar.contains(e.target) && !toggle.contains(e.target)) {
      bar.style.display = 'none';
    }
  });

  window.increaseFont = function () {
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const currentSize = parseFloat(style.fontSize);
      if (currentSize) {
        if (!elementsWithCustomFont.has(el)) {
          elementsWithCustomFont.set(el, el.style.fontSize || '');
        }
        el.style.fontSize = (currentSize * 1.2) + 'px';
      }
    });
  };

  window.toggleContrast = function () {
    document.body.classList.toggle('high-contrast');
  };

  window.highlightLinks = function () {
    document.body.classList.toggle('highlight-links');
  };

  window.resetAccessibility = function () {
    elementsWithCustomFont.forEach((originalSize, el) => {
      el.style.fontSize = originalSize;
    });
    elementsWithCustomFont.clear();
    document.body.classList.remove('high-contrast', 'highlight-links');
  };
}
