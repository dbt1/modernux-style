/*!
 * ModernUX – modern navigation overlay for phpBB (prosilver / Prosilver Dark Edition)
 * @copyright (c) 2026 Thilo Graf (dbt1)
 * @license GPL-2.0-only
 *
 * Pure progressive enhancement on prosilver's existing DOM. No framework required.
 * Every feature is independently guarded: if its anchor element is missing it is skipped.
 */
(function () {
	'use strict';

	function ready(fn) {
		if (document.readyState !== 'loading') { fn(); }
		else { document.addEventListener('DOMContentLoaded', fn); }
	}

	function el(tag, attrs, html) {
		var node = document.createElement(tag);
		if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
		if (html != null) { node.innerHTML = html; }
		return node;
	}

	// Trap focus inside a container while it is open; returns a detach function.
	function trapFocus(container) {
		function onKey(e) {
			if (e.key !== 'Tab') { return; }
			var f = container.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])');
			if (!f.length) { return; }
			var first = f[0], last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		}
		container.addEventListener('keydown', onKey);
		return function () { container.removeEventListener('keydown', onKey); };
	}

	// rAF-throttled scroll handler registration.
	function onScroll(fn) {
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (ticking) { return; }
			ticking = true;
			window.requestAnimationFrame(function () { fn(); ticking = false; });
		}, { passive: true });
		fn();
	}

	/* ---------------------------------------------------------- *
	 * 1. Sticky/shrink header state + active section
	 * ---------------------------------------------------------- */
	function initStickyHeader() {
		onScroll(function () {
			document.body.classList.toggle('mux-scrolled', window.pageYOffset > 60);
		});

		var navItems = document.querySelectorAll('#nav-main > li > a[href]');
		var here = location.pathname.split('/').pop() || 'index.php';
		var best = null;
		navItems.forEach(function (a) {
			var href = a.getAttribute('href') || '';
			if (href === '#' || href.charAt(0) === '#') { return; }
			var file = href.split('?')[0].split('/').pop();
			if (file && file === here) { best = a.parentNode; }
		});
		if (best) { best.classList.add('mux-active'); }
	}

	/* ---------------------------------------------------------- *
	 * 2. Mobile off-canvas drawer
	 * ---------------------------------------------------------- */
	function initDrawer() {
		var navbarInner = document.querySelector('.navbar .inner') || document.querySelector('.headerbar .inner');
		if (!navbarInner) { return; }

		// Collect real navigation links from the navbar (skip "#" dropdown triggers), de-dup.
		var seen = {};
		var links = [];
		document.querySelectorAll('.navbar a[href]').forEach(function (a) {
			var href = a.getAttribute('href');
			if (!href || href === '#' || href.charAt(0) === '#') { return; }
			var label = (a.textContent || '').trim();
			if (!label) { return; }
			var key = href + '|' + label;
			if (seen[key]) { return; }
			seen[key] = true;
			links.push({ href: href, label: label });
		});
		if (!links.length) { return; }

		var backdrop = el('div', { 'class': 'mux-backdrop' });
		var drawer = el('aside', {
			'class': 'mux-drawer',
			'role': 'dialog',
			'aria-modal': 'true',
			'aria-label': 'Navigation',
			'aria-hidden': 'true'
		});
		var head = el('div', { 'class': 'mux-drawer-head' }, '<span>Navigation</span>');
		var closeBtn = el('button', { 'type': 'button', 'class': 'mux-drawer-close', 'aria-label': 'Menü schließen' }, '&times;');
		head.appendChild(closeBtn);
		var nav = el('nav', { 'role': 'navigation' });
		links.forEach(function (l) {
			var a = el('a', { 'href': l.href });
			a.textContent = l.label;
			nav.appendChild(a);
		});
		drawer.appendChild(head);
		drawer.appendChild(nav);
		document.body.appendChild(backdrop);
		document.body.appendChild(drawer);

		var burger = el('button', {
			'type': 'button',
			'class': 'mux-burger',
			'aria-label': 'Menü öffnen',
			'aria-expanded': 'false',
			'aria-controls': 'mux-drawer'
		}, '<span aria-hidden="true">&#9776;</span>');
		drawer.id = 'mux-drawer';
		navbarInner.insertBefore(burger, navbarInner.firstChild);

		var lastFocus = null, untrap = null;
		function open() {
			lastFocus = document.activeElement;
			drawer.classList.add('mux-open');
			backdrop.classList.add('mux-open');
			document.body.classList.add('mux-noscroll');
			drawer.setAttribute('aria-hidden', 'false');
			burger.setAttribute('aria-expanded', 'true');
			untrap = trapFocus(drawer);
			closeBtn.focus();
		}
		function close() {
			drawer.classList.remove('mux-open');
			backdrop.classList.remove('mux-open');
			document.body.classList.remove('mux-noscroll');
			drawer.setAttribute('aria-hidden', 'true');
			burger.setAttribute('aria-expanded', 'false');
			if (untrap) { untrap(); untrap = null; }
			if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
		}
		burger.addEventListener('click', open);
		closeBtn.addEventListener('click', close);
		backdrop.addEventListener('click', close);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && drawer.classList.contains('mux-open')) { close(); }
		});
	}

	/* ---------------------------------------------------------- *
	 * 3. Quick-search overlay (Ctrl/⌘-K)
	 * ---------------------------------------------------------- */
	function initQuickSearch() {
		var srcForm = document.getElementById('search');
		var action = (srcForm && srcForm.getAttribute('action')) || './search.php';

		var overlay = el('div', { 'class': 'mux-search', 'role': 'dialog', 'aria-modal': 'true', 'aria-label': 'Schnellsuche' });
		var card = el('div', { 'class': 'mux-search-card' });
		var form = el('form', { 'method': 'get', 'action': action, 'role': 'search' });
		form.innerHTML =
			'<label for="mux-q">Forum durchsuchen</label>' +
			'<div class="mux-search-row">' +
				'<input id="mux-q" name="keywords" type="search" autocomplete="off" placeholder="Suchbegriff eingeben…">' +
				'<button type="submit">Suchen</button>' +
			'</div>' +
			'<div class="mux-search-hint"><span class="mux-kbd">Esc</span> schließen &middot; <span class="mux-kbd">Enter</span> suchen</div>';
		card.appendChild(form);
		overlay.appendChild(card);
		document.body.appendChild(overlay);

		var input = form.querySelector('#mux-q');
		var lastFocus = null, untrap = null;
		function open() {
			lastFocus = document.activeElement;
			overlay.classList.add('mux-open');
			document.body.classList.add('mux-noscroll');
			untrap = trapFocus(overlay);
			window.setTimeout(function () { input.focus(); }, 50);
		}
		function close() {
			overlay.classList.remove('mux-open');
			document.body.classList.remove('mux-noscroll');
			if (untrap) { untrap(); untrap = null; }
			if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
		}
		overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); } });
		document.addEventListener('keydown', function (e) {
			var isK = (e.key === 'k' || e.key === 'K');
			if ((e.metaKey || e.ctrlKey) && isK) { e.preventDefault(); open(); }
			else if (e.key === 'Escape' && overlay.classList.contains('mux-open')) { close(); }
		});
	}

	/* ---------------------------------------------------------- *
	 * 4. Scroll-to-top + reading progress
	 * ---------------------------------------------------------- */
	function initScrollAids() {
		var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		var toTop = el('button', { 'type': 'button', 'class': 'mux-totop', 'aria-label': 'Nach oben' }, '<span aria-hidden="true">&#8593;</span>');
		document.body.appendChild(toTop);
		toTop.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
		});

		// Reading progress only on topic pages (posts present).
		var isTopic = !!document.querySelector('.post');
		var bar = null;
		if (isTopic) {
			bar = el('div', { 'class': 'mux-progress', 'role': 'progressbar', 'aria-hidden': 'true' });
			document.body.appendChild(bar);
		}

		onScroll(function () {
			var y = window.pageYOffset;
			toTop.classList.toggle('mux-show', y > 400);
			if (bar) {
				var h = document.documentElement.scrollHeight - window.innerHeight;
				var pct = h > 0 ? (y / h) * 100 : 0;
				bar.style.width = pct + '%';
			}
		});
	}

	/* ---------------------------------------------------------- *
	 * 5. Footer: replace the third-party style credit with ours
	 *    (phpBB's own "Powered by phpBB" credit is left intact)
	 * ---------------------------------------------------------- */
	function initFooterCredit() {
		var rows = document.querySelectorAll('.copyright .footer-row, .copyright p');
		for (var i = 0; i < rows.length; i++) {
			if (/planetstyles|prosilver dark edition|premium phpbb styles/i.test(rows[i].textContent)) {
				rows[i].innerHTML = 'Oberfläche: <a href="https://github.com/dbt1/modernux-style" rel="noopener">ModernUX</a> · angelehnt an Prosilver Dark';
				break;
			}
		}
	}

	ready(function () {
		try { initStickyHeader(); } catch (e) {}
		try { initDrawer(); } catch (e) {}
		try { initQuickSearch(); } catch (e) {}
		try { initScrollAids(); } catch (e) {}
		try { initFooterCredit(); } catch (e) {}
	});
})();
