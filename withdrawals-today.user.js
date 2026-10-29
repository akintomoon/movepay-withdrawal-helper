// ==UserScript==
// @name         MovePay Withdrawals — Today
// @namespace    local.movepay.withdrawals
// @version      1.2.1
// @homepageURL  https://github.com/akintomoon/movepay-withdrawal-helper
// @supportURL   https://github.com/akintomoon/movepay-withdrawal-helper/issues
// @updateURL    https://raw.githubusercontent.com/akintomoon/movepay-withdrawal-helper/main/withdrawals-today.user.js
// @downloadURL  https://raw.githubusercontent.com/akintomoon/movepay-withdrawal-helper/main/withdrawals-today.user.js
// @description  Compact movable Сегодня / Вчера / Остатки filters, 100 rows per page.
// @match        https://pub.prod.movepay.online/frontoffice/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  const PATH = '/frontoffice/matching/withdrawals';
  const ID = 'movepay-withdrawals-today';
  const POSITION_KEY = 'movepay-withdrawals-toolbar-position';
  let reposition = null;

  function dayURL(href, dayOffset = 0, now = new Date()) {
    const url = new URL(href);
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 0);
    url.searchParams.set('createdAtFrom', start.toISOString());
    url.searchParams.set('createdAtTo', end.toISOString());
    // Observed site parameters when selecting 100 in its pagination control.
    url.searchParams.set('size', '100');
    url.searchParams.set('page', '1');
    return url.href;
  }

  function balanceURL(href) {
    const url = new URL(href);
    url.searchParams.set('status', 'PARTIALLY_COVERED,CLOSED_WITH_BALANCE');
    url.searchParams.set('size', '100');
    url.searchParams.set('page', '1');
    return url.href;
  }

  function sync() {
    const existing = document.getElementById(ID);
    const onPage = location.pathname.replace(/\/$/, '') === PATH;
    if (!onPage) {
      existing?.remove();
      reposition = null;
      return;
    }
    if (existing) { reposition?.(); return; }
    if (!document.body) return;
    const host = document.createElement('div');
    host.id = ID;
    host.style.cssText = 'position:fixed;top:80px;right:28px;z-index:10000';
    const root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = `
      .buttons { display:flex; align-items:center; gap:3px; padding:3px;
        background:#1b2233; border:1px solid #52617b; border-radius:7px;
        box-shadow:0 2px 8px #0004; white-space:nowrap; }
      button { font:600 11px system-ui,sans-serif; color:#e7efff;
        background:#303d55; border:0; border-radius:4px;
        height:24px; padding:0 8px; cursor:pointer; }
      button:hover { background:#45618b; }
      button:focus-visible { outline:2px solid white; outline-offset:1px; }
      .handle { cursor:grab; touch-action:none; padding:0 4px; color:#a9b7cf; background:transparent; }
      .handle:active { cursor:grabbing; }
    `;
    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'handle';
    handle.textContent = '⠿';
    handle.title = 'Перетащить · двойной щелчок: вернуть на место';
    handle.setAttribute('aria-label', 'Переместить панель');
    buttons.append(handle);
    for (const [label, offset] of [['Вчера', -1], ['Сегодня', 0]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = `${label}: 00:00:00–23:59:59 · 100 строк · время компьютера`;
      button.addEventListener('click', () => {
        if (location.pathname.replace(/\/$/, '') !== PATH) return;
        location.assign(dayURL(location.href, offset));
      });
      buttons.append(button);
    }
    const balance = document.createElement('button');
    balance.type = 'button';
    balance.textContent = 'Остатки';
    balance.title = 'PARTIALLY_COVERED + CLOSED_WITH_BALANCE · даты не меняются · 100 строк';
    balance.addEventListener('click', () => {
      if (location.pathname.replace(/\/$/, '') === PATH) location.assign(balanceURL(location.href));
    });
    buttons.append(balance);
    root.append(style, buttons);
    document.body.append(host);
    let position = null;
    try {
      const saved = JSON.parse(localStorage.getItem(POSITION_KEY));
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) position = saved;
    } catch { /* Storage unavailable: dragging still works for this page. */ }
    const place = (x, y) => {
      const rect = host.getBoundingClientRect();
      host.style.right = 'auto';
      host.style.left = Math.max(4, Math.min(x, innerWidth - rect.width - 4)) + 'px';
      host.style.top = Math.max(4, Math.min(y, innerHeight - rect.height - 4)) + 'px';
    };
    reposition = () => {
      if (position) { place(position.x, position.y); return; }
      const anchor = [...document.querySelectorAll('button')].find(e =>
        e.textContent.trim() === 'ADD EXTERNAL WITHDRAWAL' && e.getClientRects().length);
      const rect = anchor?.getBoundingClientRect();
      place(rect ? rect.right - host.offsetWidth : innerWidth - host.offsetWidth - 28,
        rect ? rect.top - host.offsetHeight - 10 : 80);
    };
    const persist = () => { try { localStorage.setItem(POSITION_KEY, JSON.stringify(position)); } catch {} };
    let drag = null;
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const rect = host.getBoundingClientRect();
      drag = {x:e.clientX - rect.left, y:e.clientY - rect.top};
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
      if (!drag) return;
      position = {x:e.clientX - drag.x, y:e.clientY - drag.y};
      reposition();
    });
    const endDrag = () => { if (drag) { drag = null; persist(); } };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('lostpointercapture', endDrag);
    handle.addEventListener('dblclick', () => { position = null; persist(); reposition(); });
    handle.addEventListener('keydown', e => {
      const moves = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
      if (!moves[e.key]) return;
      e.preventDefault();
      const rect = host.getBoundingClientRect();
      position = {x:rect.left + moves[e.key][0],y:rect.top + moves[e.key][1]};
      reposition(); persist();
    });
    reposition();
  }

  sync();
  // Handles the site's in-page navigation without modifying its router.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', sync);
  window.addEventListener('resize', () => reposition?.());
})();
