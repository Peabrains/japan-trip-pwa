'use strict';

/* ============================================================
   TOAST — Non-blocking notifications
   Usage: Toast.show('Lodge booked', 'success')
          Toast.show('Sync failed', 'danger')
   Types: success | warning | danger | info
   ============================================================ */

const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 12px)',
        left:   '12px',
        right:  '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: '1000',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 2800) {
    const c = getContainer();

    const toast = document.createElement('div');
    Object.assign(toast.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'var(--text-primary)',
      color: 'var(--bg)',
      padding: '10px 14px',
      borderRadius: 'var(--r-lg)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font)',
      fontWeight: '400',
      border: '1px solid rgba(255,255,255,0.1)',
      opacity: '0',
      transform: 'translateY(8px)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
      pointerEvents: 'auto',
    });

    // Icon by type
    const iconMap = {
      success: { icon: Icons.check('icon-sm'), color: 'var(--success-text)' },
      warning: { icon: Icons.info('icon-sm'),  color: 'var(--warning-text)' },
      danger:  { icon: Icons.x('icon-sm'),     color: 'var(--danger-text)'  },
      info:    { icon: Icons.info('icon-sm'),   color: 'var(--accent)'       },
    };
    const { icon, color } = iconMap[type] || iconMap.info;

    const iconEl = document.createElement('span');
    iconEl.innerHTML = icon;
    iconEl.style.color = color;
    iconEl.style.flexShrink = '0';

    const text = document.createElement('span');
    text.textContent = message;
    text.style.flex = '1';

    toast.appendChild(iconEl);
    toast.appendChild(text);
    c.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });
    });

    // Animate out + remove
    const timer = setTimeout(() => dismiss(toast), duration);

    // Tap to dismiss early
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss(toast);
    });

    return toast;
  }

  function dismiss(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  return { show };
})();

window.Toast = Toast;
