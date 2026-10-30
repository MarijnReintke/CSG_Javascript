    (function () {
      const toegestaan = ['stap-0','stap-1OBF','stap-2OBF','stap-3OBF','stap-4OBF'];
      const standaard = 'stap-0';

      const params = new URLSearchParams(window.location.search);
      let gekozen = params.get('applet');
      if (!toegestaan.includes(gekozen)) gekozen = standaard;

      const bestandsnaam = 'JS/' + gekozen + '.js';
      document.getElementById('titel').textContent = bestandsnaam;
      document.title = bestandsnaam;
      const select = document.getElementById('appletKeuze');
      select.value = gekozen;

      select.addEventListener('change', function () {
        const url = new URL(window.location.href);
        url.searchParams.set('applet', select.value);
        window.location.href = url.toString();
      });

      const script = document.createElement('script');
      script.src = bestandsnaam + '?v=' + Date.now();
      script.onerror = function () {
        document.getElementById('titel').textContent =
          'Kon ' + bestandsnaam + ' niet laden';
      };
      document.body.appendChild(script);
    })();