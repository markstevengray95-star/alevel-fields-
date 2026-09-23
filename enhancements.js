(() => {
  'use strict';
  const head = document.head || document.documentElement;
  if (!document.querySelector('link[data-fields-v5]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'enhancements-v5.css?v=5';
    css.dataset.fieldsV5 = 'true';
    head.appendChild(css);
  }
  const loadV5 = () => {
    if (document.querySelector('script[data-fields-v5]')) return;
    ['topic-practice-v5.js?v=5','sim-challenges-v5.js?v=5'].forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset.fieldsV5 = 'true';
      document.body.appendChild(s);
    });
  };
  if (document.readyState === 'complete') loadV5();
  else window.addEventListener('load', loadV5, { once:true });
})();