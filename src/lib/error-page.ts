export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>One moment…</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #F7F5F0; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; font-weight: 500; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
      .spinner { width: 22px; height: 22px; border: 2px solid #e5e7eb; border-top-color: #111; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .manual { display: none; }
      .manual.show { display: block; }
    </style>
    <script>
      (function () {
        try {
          var url = new URL(window.location.href);
          var retried = url.searchParams.get('__r') === '1';
          if (!retried) {
            url.searchParams.set('__r', '1');
            // Auto-retry once for transient SSR hiccups.
            setTimeout(function () { window.location.replace(url.toString()); }, 500);
          } else {
            // Second failure: show manual actions and clean the marker.
            document.addEventListener('DOMContentLoaded', function () {
              var m = document.getElementById('manual');
              if (m) m.classList.add('show');
              var s = document.getElementById('spinner');
              if (s) s.style.display = 'none';
              url.searchParams.delete('__r');
              window.history.replaceState({}, '', url.toString());
            });
          }
        } catch (_) {}
      })();
    </script>
  </head>
  <body>
    <div class="card">
      <div id="spinner" class="spinner"></div>
      <h1>One moment…</h1>
      <p>Reloading the page.</p>
      <div id="manual" class="manual">
        <div class="actions">
          <button class="primary" onclick="location.reload()">Try again</button>
          <a class="secondary" href="/">Go home</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
