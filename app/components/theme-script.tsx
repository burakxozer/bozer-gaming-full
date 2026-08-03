export function ThemeScript() {
  const script = `
    (function() {
      try {
        var t = localStorage.getItem('bozer-theme') || 'steel';
        document.documentElement.setAttribute('data-theme', t);
      } catch(e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
