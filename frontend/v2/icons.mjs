const paths = {
  shield: '<path d="M12 2c3 3 5 3 8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6c3-1 5-1 8-4Z"/><path d="M8 13c1 4 7 4 8 0M9 9h.01M15 9h.01"/>',
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  pin: '<path d="M19 9c0 5-7 11-7 11S5 14 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
  book: '<path d="M12 5v16M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 2-3-3-6-3-9-2Z"/>',
  plan: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3"/>',
  users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3ZM17 3a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 5v2"/>',
  lock: '<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="17" rx="2"/><path d="M7 2v6m10-6v6M3 11h18M7 15h2m6 0h2m-10 4h2"/>',
  volume: '<path d="m11 3-6 5H2v8h3l6 5Zm5 4a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
  phone: '<path d="m5 3 4 4-2 3c2 4 3 5 7 7l3-2 4 4-2 3C9 22 2 15 2 5Z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-2 6-6 2 2-6Z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  cloud: '<path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 14-1 5.5 5.5 0 0 1 0 11Z"/>',
  heart: '<path d="M12 21 3 12C-3 5 7-2 12 6 17-2 27 5 21 12Z"/>',
};
export function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.shield}</svg>`; }
export function decorate(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
