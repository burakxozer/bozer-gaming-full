/* Bozer Gaming live-mirror + resume bridge (generic).
   Injected into every game page. Talks to the parent window. */
(function () {
  var SNAP_INTERVAL = 1000;
  var lastHtml = '';

  function inlineFormValues(root) {
    var clone = root.cloneNode(true);
    var orig = root.querySelectorAll('input,textarea,select');
    var cop = clone.querySelectorAll('input,textarea,select');
    for (var i = 0; i < orig.length; i++) {
      var o = orig[i], c = cop[i];
      if (!c) continue;
      var tag = o.tagName.toLowerCase();
      if (tag === 'input') {
        if (o.type === 'checkbox' || o.type === 'radio') {
          if (o.checked) c.setAttribute('checked', 'checked'); else c.removeAttribute('checked');
        } else {
          c.setAttribute('value', o.value);
        }
      } else if (tag === 'textarea') {
        c.textContent = o.value == null ? '' : o.value;
      } else if (tag === 'select') {
        for (var j = 0; j < o.options.length; j++) {
          if (c.options[j]) {
            if (o.options[j].selected) c.options[j].setAttribute('selected', 'selected');
            else c.options[j].removeAttribute('selected');
          }
        }
      }
    }
    return clone;
  }

  function buildSnapshot() {
    var clone = inlineFormValues(document.documentElement);
    var scripts = clone.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].parentNode) scripts[i].parentNode.removeChild(scripts[i]);
    }
    return '<!DOCTYPE html>' + clone.outerHTML;
  }

  function pushSnapshot(force) {
    try {
      var html = buildSnapshot();
      if (!force && html === lastHtml) return;
      lastHtml = html;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'bozer-snapshot', html: html }, '*');
      }
    } catch (e) {}
  }

  function pushState() {
    try {
      if (window.__bozerState && typeof window.__bozerState.get === 'function') {
        var st = window.__bozerState.get();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'bozer-save', state: st }, '*');
        }
      }
    } catch (e) {}
  }

  function tick() { pushSnapshot(false); pushState(); }
  setInterval(tick, SNAP_INTERVAL);

  var kick = function () { setTimeout(function () { pushSnapshot(true); pushState(); }, 120); };
  document.addEventListener('click', kick, true);
  document.addEventListener('input', kick, true);
  document.addEventListener('change', kick, true);
  document.addEventListener('blur', kick, true);

  window.addEventListener('message', function (ev) {
    var d = ev.data || {};
    if (d.type === 'bozer-restore' && d.state != null) {
      try {
        if (window.__bozerState && typeof window.__bozerState.set === 'function') {
          window.__bozerState.set(d.state);
          setTimeout(function () { pushSnapshot(true); }, 200);
        }
      } catch (e) {}
    } else if (d.type === 'bozer-request-snapshot') {
      pushSnapshot(true);
    }
  });

  function ready() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'bozer-ready' }, '*');
    }
    setTimeout(function () { pushSnapshot(true); pushState(); }, 300);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') ready();
  else document.addEventListener('DOMContentLoaded', ready);
})();
