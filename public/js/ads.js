var el = document.createElement('div');
el.className = 'ad-alert';
el.innerHTML = '<div class="container text-center text-danger" role="alert">' +
                  '<h2 class="mb-4">Ad Blocker Detected</h2>' +
                  '<h3>Our website is made possible by displaying online advertisements to our visitors.<br>' +
                  'Please consider supporting us by disabling your ad blocker.</h3>' +
                '</div>'

el.style.display = 'none';

document.body.appendChild(el);
