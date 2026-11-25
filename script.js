/**
 * MARTINS BJJ - Main JavaScript
 * Funcionalidades: Menu mobile, scroll effects, animações, formulário
 */

(function() {
    'use strict';

    // ========================================
    // Utilitários
    // ========================================

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

    const debounce = (fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    };

    const throttle = (fn, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ========================================
    // Menu Mobile
    // ========================================

    const initMobileMenu = () => {
        const toggle = $('.nav__toggle');
        const menu = $('.nav__menu');
        const links = $$('.nav__link');

        if (!toggle || !menu) return;

        const closeMenu = () => {
            toggle.setAttribute('aria-expanded', 'false');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        };

        const openMenu = () => {
            toggle.setAttribute('aria-expanded', 'true');
            menu.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            isExpanded ? closeMenu() : openMenu();
        });

        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Fechar clicando fora
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') &&
                !menu.contains(e.target) &&
                !toggle.contains(e.target)) {
                closeMenu();
            }
        });
    };

    // ========================================
    // Header Scroll Effect
    // ========================================

    const initHeaderScroll = () => {
        const header = $('.header');
        if (!header) return;

        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    // ========================================
    // Back to Top Button
    // ========================================

    const initBackToTop = () => {
        const btn = $('#backToTop');
        if (!btn) return;

        const toggleVisibility = throttle(() => {
            if (window.scrollY > 300) {
                btn.hidden = false;
            } else {
                btn.hidden = true;
            }
        }, 100);

        window.addEventListener('scroll', toggleVisibility, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // ========================================
    // Scroll Reveal Animations
    // ========================================

    const initScrollReveal = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            $$('.reveal').forEach(el => el.classList.add('active'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elementos para animar
        const revealElements = [
            ...$$('.section__header'),
            ...$$('.about__content > *'),
            ...$$('.value'),
            ...$$('.program'),
            ...$$('.coach'),
            ...$$('.contact__card'),
            ...$$('.footer__brand'),
            ...$$('.footer__nav'),
            ...$$('.footer__newsletter')
        ];

        revealElements.forEach((el, index) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${Math.min(index * 50, 300)}ms`;
            observer.observe(el);
        });
    };

    // ========================================
    // Smooth Scroll para links internos
    // ========================================

    const initSmoothScroll = () => {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = $(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = $('.header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Foco para acessibilidade
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    };

    // ========================================
    // Newsletter Form
    // ========================================

    const initNewsletterForm = () => {
        const form = $('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const input = form.querySelector('input[type="email"]');
            const btn = form.querySelector('button[type="submit"]');
            const email = input?.value?.trim();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                input?.focus();
                showToast('Por favor, insira um e-mail válido.', 'error');
                return;
            }

            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Inscrevendo...';

            // Simular envio (substituir por API real)
            await new Promise(resolve => setTimeout(resolve, 1500));

            btn.disabled = false;
            btn.textContent = originalText;
            input.value = '';
            showToast('Inscrição realizada com sucesso! 🥋', 'success');
        });
    };

    // ========================================
    // Toast Notifications
    // ========================================

    const showToast = (message, type = 'info') => {
        // Remover toast existente
        const existing = $('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="toast__message">${message}</span>
            <button class="toast__close" aria-label="Fechar">&times;</button>
        `;

        // Estilos inline para o toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            padding: '1rem 1.5rem',
            background: type === 'success' ? 'var(--color-gold)' : 'var(--color-black-light)',
            color: type === 'success' ? 'var(--color-black)' : 'var(--color-white)',
            border: '1px solid var(--color-gray-light)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: '9999',
            opacity: '0',
            transition: 'all var(--transition-base)',
            maxWidth: '90vw',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem'
        });

        const closeBtn = toast.querySelector('.toast__close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: '1',
            padding: '0',
            opacity: '0.7'
        });

        closeBtn.addEventListener('click', () => hideToast(toast));

        document.body.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });

        // Auto hide
        setTimeout(() => hideToast(toast), 5000);
    };

    const hideToast = (toast) => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };

    // ========================================
    // Parallax Hero (opcional, desativado em mobile)
    // ========================================

    const initHeroParallax = () => {
        const hero = $('.hero');
        const heroBg = $('.hero__bg');
        if (!hero || !heroBg) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 768;

        if (prefersReducedMotion || isMobile) return;

        const handleScroll = throttle(() => {
            const scrolled = window.scrollY;
            const heroHeight = hero.offsetHeight;
            if (scrolled < heroHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    // ========================================
    // Lazy Loading Images (fallback nativo)
    // ========================================

    const initLazyImages = () => {
        if ('loading' in HTMLImageElement.prototype) {
            $$('img[loading="lazy"]').forEach(img => {
                img.loading = 'lazy';
            });
        } else {
            // Fallback para navegadores antigos
            const lazyImages = $$('img[data-src]');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            lazyImages.forEach(img => observer.observe(img));
        }
    };

    // ========================================
    // Active Nav Link on Scroll
    // ========================================

    const initActiveNavLink = () => {
        const sections = $$('section[id]');
        const navLinks = $$('.nav__link[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    };

    // ========================================
    // Inicialização
    // ========================================

    const init = () => {
        // Aguardar DOM pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        initMobileMenu();
        initHeaderScroll();
        initBackToTop();
        initScrollReveal();
        initSmoothScroll();
        initNewsletterForm();
        initHeroParallax();
        initLazyImages();
        initActiveNavLink();

        // Adicionar estilos para link ativo
        const style = document.createElement('style');
        style.textContent = `
            .nav__link.active {
                color: var(--color-gold) !important;
            }
            .nav__link.active::after {
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);

        console.log('🥋 Martins BJJ - Site carregado com sucesso!');
    };

    init();
})();