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
  const loadEnhancements = () => {
    if (document.querySelector('script[data-fields-v6]')) return;
    [
      ['topic-practice-v5.js?v=5','fields-v5'],
      ['sim-challenges-v5.js?v=5','fields-v5'],
      ['v6-upgrades.js?v=6','fields-v6']
    ].forEach(([src,tag]) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset[tag === 'fields-v6' ? 'fieldsV6' : 'fieldsV5'] = 'true';
      document.body.appendChild(s);
    });
  };
  if (document.readyState === 'complete') loadEnhancements();
  else window.addEventListener('load', loadEnhancements, { once:true });
})();