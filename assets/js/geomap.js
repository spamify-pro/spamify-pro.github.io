/* ═══════════════════════════════════════════════════════════════════
   Elastic Spam Shield — "where spam comes from" map
   The world map itself is a plain <img src="assets/world.svg"> (an
   equirectangular map derived from Natural Earth 110m) so it loads even
   when the page is opened directly from disk (file://) — unlike fetch(),
   which browsers block on the file:// protocol. This script only adds
   the overlay: volume-scaled markers positioned from lon/lat with the
   same projection the map was built with, plus a ranked breakdown.
   Purely illustrative sample data.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var mapEl = document.getElementById('spamMap');
    var rankEl = document.getElementById('spamRank');
    if (!mapEl) { return; }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Must match assets/world.svg's viewBox ("0 44 1000 363"): the map is
    // cropped to the populated latitude band, so a marker's y in the full
    // 0..500 equirectangular space maps into that window.
    var VY0 = 44, VH = 363;
    function project(lon, lat) {
        var x = (lon + 180) / 360 * 100;          // % across
        var svgY = (90 - lat) / 180 * 500;        // y in the full 0..500 space
        var y = (svgY - VY0) / VH * 100;          // % down the cropped viewBox
        return [x, y];
    }

    // Illustrative sample — country, approx centroid lon/lat, blocked count, level 1-5.
    var DATA = [
        { name: 'China', lon: 104, lat: 35.5, count: 5820, lvl: 5 },
        { name: 'Russia', lon: 95, lat: 61, count: 4310, lvl: 5 },
        { name: 'United States', lon: -98, lat: 39, count: 3120, lvl: 4 },
        { name: 'India', lon: 79, lat: 22, count: 2740, lvl: 4 },
        { name: 'Brazil', lon: -52, lat: -10, count: 1680, lvl: 3 },
        { name: 'Nigeria', lon: 8, lat: 9.5, count: 1240, lvl: 3 },
        { name: 'Vietnam', lon: 106, lat: 16, count: 980, lvl: 2 },
        { name: 'Ukraine', lon: 32, lat: 49, count: 760, lvl: 2 },
        { name: 'Indonesia', lon: 110, lat: -7, count: 610, lvl: 2 },
        { name: 'Turkey', lon: 35, lat: 39, count: 540, lvl: 1 },
        { name: 'Germany', lon: 10, lat: 51, count: 430, lvl: 1 }
    ];

    var max = DATA.reduce(function (m, d) { return Math.max(m, d.count); }, 0);

    DATA.forEach(function (d, i) {
        var p = project(d.lon, d.lat);
        var pin = document.createElement('span');
        pin.className = 'mappin mappin--l' + d.lvl;
        pin.style.left = p[0].toFixed(2) + '%';
        pin.style.top = p[1].toFixed(2) + '%';
        pin.setAttribute('role', 'img');
        pin.setAttribute('aria-label', d.name + ': ' + d.count.toLocaleString() + ' blocked');
        pin.setAttribute('title', d.name + ' · ' + d.count.toLocaleString() + ' blocked');
        if (!reduce) { pin.style.setProperty('--delay', (i * 0.22).toFixed(2) + 's'); }
        mapEl.appendChild(pin);
    });

    if (rankEl) {
        DATA.slice().sort(function (a, b) { return b.count - a.count; }).slice(0, 5)
            .forEach(function (d) {
                var li = document.createElement('li');
                li.innerHTML =
                    '<span class="maprank__n">' + d.name + '</span>' +
                    '<span class="maprank__bar"><i style="width:' + Math.round(d.count / max * 100) + '%"></i></span>' +
                    '<span class="maprank__v">' + d.count.toLocaleString() + '</span>';
                rankEl.appendChild(li);
            });
    }
})();
