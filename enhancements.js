(() => {
  'use strict';
  const head = document.head || document.documentElement;
  if (!document.querySelector('link[data-fields-v3]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'enhancements-v3.css?v=3';
    css.dataset.fieldsV3 = 'true';
    head.appendChild(css);
  }
  ['textbook-v3.js?v=3','sim-pro-v3.js?v=3'].forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.fieldsV3 = 'true';
    head.appendChild(s);
  });
})();