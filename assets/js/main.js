/* Spamify — marketing site motion + interactions */
(function() {
    'use strict';

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Footer year ──────────────────────────────────────────────
    var yr = document.getElementById('yr');
    if (yr) { yr.textContent = new Date().getFullYear(); }

    // ── Sticky nav state ─────────────────────────────────────────
    var nav = document.getElementById('nav');

    function onScroll() { if (nav) { nav.classList.toggle('is-stuck', window.scrollY > 8); } }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Mobile menu ──────────────────────────────────────────────
    var burger = document.getElementById('burger');
    if (burger && nav) {
        burger.addEventListener('click', function() {
            var open = nav.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.querySelectorAll('.nav__links a, .nav__cta a').forEach(function(a) {
            a.addEventListener('click', function() {
                nav.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── Freemius checkout ────────────────────────────────────────
    // Open the embedded Freemius Checkout modal for a plan; fall back to the
    // hosted checkout URL (the button's href) if the SDK didn't load.
    var FS_CFG = { plugin_id: '32247', public_key: 'pk_acbf9651f4555a9cd36a149d2a962' };

    function openFreemius(planId) {
        if (typeof FS === 'undefined' || !FS.Checkout) { return false; }
        try {
            var cfg = { plugin_id: FS_CFG.plugin_id, public_key: FS_CFG.public_key, plan_id: planId };
            // Support both SDK shapes: FS.Checkout.configure(...) and new FS.Checkout(...).
            var handler = (typeof FS.Checkout.configure === 'function') ?
                FS.Checkout.configure(cfg) :
                new FS.Checkout(cfg);
            handler.open({ licenses: 1 });
            return true;
        } catch (e) { return false; }
    }
    document.querySelectorAll('[data-fs-plan]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            // If the embedded modal opens, cancel the hosted-page navigation.
            if (openFreemius(el.getAttribute('data-fs-plan'))) { e.preventDefault(); }
        });
    });

    // ── Count-up ─────────────────────────────────────────────────
    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce || target === 0) { el.textContent = target.toLocaleString() + suffix; return; }
        var start = null,
            dur = 1400;

        function step(ts) {
            if (!start) { start = ts; }
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) { requestAnimationFrame(step); }
        }
        requestAnimationFrame(step);
    }

    // ── Engine score animation ───────────────────────────────────
    function animateScore() {
        var arc = document.getElementById('scoreArc');
        var num = document.getElementById('scoreNum');
        var verdict = document.getElementById('scoreVerdict');
        var reasonsBox = document.getElementById('scoreReasons');
        if (!arc || !num) { return; }
        var score = 92;
        var C = 327;
        // colour by score
        var col = score >= 60 ? '#ef4444' : (score >= 30 ? '#f59e0b' : '#10b981');
        arc.style.stroke = col;
        verdict.textContent = 'Blocked';
        verdict.style.color = col;
        var reasons = [
            'Disposable / throwaway domain detected',
            'IP listed on 2 abuse feeds',
            'Content: link stuffing + spam keywords'
        ];
        if (reasonsBox && !reasonsBox.childElementCount) {
            reasons.forEach(function(r) { var s = document.createElement('span');
                s.textContent = r;
                reasonsBox.appendChild(s); });
        }
        if (reduce) {
            arc.style.strokeDashoffset = C * (1 - score / 100);
            num.textContent = score;
            if (reasonsBox) { reasonsBox.querySelectorAll('span').forEach(function(s) { s.classList.add('on'); }); }
            return;
        }
        // ring + number
        requestAnimationFrame(function() { arc.style.strokeDashoffset = C * (1 - score / 100); });
        var start = null,
            dur = 1100;

        function step(ts) {
            if (!start) { start = ts; }
            var p = Math.min((ts - start) / dur, 1);
            num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
            if (p < 1) { requestAnimationFrame(step); }
        }
        requestAnimationFrame(step);
        // stagger reasons
        if (reasonsBox) {
            reasonsBox.querySelectorAll('span').forEach(function(s, i) {
                setTimeout(function() { s.classList.add('on'); }, 500 + i * 220);
            });
        }
    }

    // ── IntersectionObserver: reveal + trigger counters/score ────
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (!e.isIntersecting) { return; }
                var el = e.target;
                el.classList.add('is-in');
                el.querySelectorAll && el.querySelectorAll('b[data-count]').forEach(countUp);
                if (el.querySelector && el.querySelector('#scoreArc')) { animateScore(); }
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

        document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });
        // ensure the score panel animates even if it isn't a .reveal in view path
        var sp = document.querySelector('.engine__panel');
        if (sp) { io.observe(sp); }
    } else {
        document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('is-in'); });
        document.querySelectorAll('b[data-count]').forEach(countUp);
        animateScore();
    }
})();