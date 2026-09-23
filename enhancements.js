(() => {
  'use strict';
  const head = document.head || document.documentElement;
  const addCss = (href, key) => {
    if (document.querySelector(`link[data-${key}]`)) return;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = href;
    css.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())] = 'true';
    head.appendChild(css);
  };
  addCss('enhancements-v5.css?v=5','fields-v5');
  addCss('enhancements-v7.css?v=7.1','fields-v7');
  addCss('enhancements-v8.css?v=8','fields-v8');
  const loadEnhancements = () => {
    if (document.querySelector('script[data-fields-v8-learning]')) return;
    [
      ['topic-practice-v5.js?v=5','fieldsV5'],
      ['sim-challenges-v5.js?v=5','fieldsV5'],
      ['v6-upgrades.js?v=6','fieldsV6'],
      ['lesson-depth-v7.js?v=7.1','fieldsV7'],
      ['v7-reliability.js?v=7.1','fieldsV7Reliability'],
      ['learning-v8.js?v=8','fieldsV8Learning']
    ].forEach(([src,key]) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset[key] = 'true';
      document.body.appendChild(s);
    });
    if (!document.querySelector('script[data-fields-v8-three]')) {
      const m = document.createElement('script');
      m.type = 'module';
      m.src = 'three-lab-v8.js?v=8';
      m.dataset.fieldsV8Three = 'true';
      document.body.appendChild(m);
    }
  };
  if (document.readyState === 'complete') loadEnhancements();
  else window.addEventListener('load', loadEnhancements, { once:true });
})();