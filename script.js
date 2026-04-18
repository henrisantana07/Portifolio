// Custom Cursor Logic
const cursor = document.getElementById('cursor');
const dot = document.getElementById('cursor-dot');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
    });

    // Click interaction
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    // Hover states for cursor
    const hoverables = document.querySelectorAll('a, button, .group, input, textarea');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.backgroundColor = 'rgba(0, 255, 135, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
        });
    });
}

// Scroll Progress Logic
window.addEventListener('scroll', () => {
    const h = document.documentElement, 
          b = document.body,
          st = 'scrollTop',
          sh = 'scrollHeight';
    const percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
    document.getElementById('progress-fill').style.height = percent + '%';
});

// Mobile Menu Logic
const mobileMenu = document.getElementById('mobile-menu');
const openMenuBtn = document.getElementById('open-menu');
const closeMenuBtn = document.getElementById('close-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu-link');

const toggleMenu = () => {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
};

openMenuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Glitch Animation for Hero Name
const glitchEl = document.getElementById('glitch-name');
if(glitchEl) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    let originalText = glitchEl.innerText;
    
    setInterval(() => {
        if(Math.random() > 0.95) {
            let scrambled = originalText.split('').map(c => Math.random() > 0.8 ? chars[Math.floor(Math.random() * chars.length)] : c).join('');
            glitchEl.innerText = scrambled;
            setTimeout(() => {
                glitchEl.innerText = originalText;
            }, 100);
        }
    }, 200);
}

// Nav Scroll Highlight Logic
const navLinks = document.querySelectorAll('#nav-links-container a');
const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
};

const deactivateAll = () => {
    navLinks.forEach(link => {
        link.classList.remove('text-[#00FF87]', 'border-[#00FF87]', 'hover:drop-shadow-[0_0_15px_rgba(0,255,135,0.4)]');
        link.classList.add('text-zinc-500', 'border-transparent', 'hover:text-zinc-200');
    });
};

const activateLink = (id) => {
    const activeLink = document.querySelector(`#nav-links-container a[href="#${id}"]`);
    if (activeLink) {
        deactivateAll();
        activeLink.classList.remove('text-zinc-500', 'border-transparent', 'hover:text-zinc-200');
        activeLink.classList.add('text-[#00FF87]', 'border-[#00FF87]', 'hover:drop-shadow-[0_0_15px_rgba(0,255,135,0.4)]');
    }
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            activateLink(entry.target.id);
        }
    });
}, observerOptions);

sections.forEach(section => {
    if (section) observer.observe(section);
});

// Project Cards External Links
let blockProjectCardClickUntil = 0;
const projectsSection = document.getElementById('projects');

const decorateProjectCards = (rootEl) => {
    if (!rootEl) return;
    rootEl.querySelectorAll('[data-project-url]').forEach((card) => {
        card.style.cursor = 'pointer';
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
    });
};

const openProjectFromCard = (card) => {
    if (!card) return;
    const projectUrl = card.getAttribute('data-project-url');
    if (!projectUrl) return;
    window.open(projectUrl, '_blank', 'noopener,noreferrer');
};

decorateProjectCards(projectsSection);

if (projectsSection) {
    projectsSection.addEventListener('click', (event) => {
        const card = event.target.closest('[data-project-url]');
        if (!card || !projectsSection.contains(card)) return;
        if (Date.now() < blockProjectCardClickUntil) return;
        if (event.target.closest('a, button')) return;
        openProjectFromCard(card);
    });

    projectsSection.addEventListener('keydown', (event) => {
        const card = event.target.closest('[data-project-url]');
        if (!card || !projectsSection.contains(card)) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProjectFromCard(card);
        }
    });
}

// Projects Carousel
const projectsTrack = document.getElementById('projects-track');
const projectsViewport = document.getElementById('projects-carousel-viewport');
const projectsPrevBtn = document.getElementById('projects-prev');
const projectsNextBtn = document.getElementById('projects-next');
const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

let projectsCarouselEnabled = false;
let projectsCarouselAnimating = false;
let projectsOriginalCards = [];
let projectsVisibleCards = 1;
let projectsCurrentIndex = 0;
let projectsHasBuiltTrack = false;

const setProjectsButtonsState = (enabled) => {
    [projectsPrevBtn, projectsNextBtn].forEach((btn) => {
        if (!btn) return;
        btn.disabled = !enabled;
        btn.setAttribute('aria-disabled', String(!enabled));
    });
};

const getProjectsStep = () => {
    if (!projectsTrack) return 0;
    const firstCard = projectsTrack.querySelector(':scope > .group');
    if (!firstCard) return 0;

    const styles = window.getComputedStyle(projectsTrack);
    const gapValue = styles.columnGap || styles.gap || '0';
    const gap = Number.parseFloat(gapValue) || 0;
    return firstCard.getBoundingClientRect().width + gap;
};

const getProjectsVisibleCards = (totalCards) => {
    if (window.innerWidth >= 1024) return Math.min(3, totalCards);
    return 1;
};

const setProjectsTransform = () => {
    if (!projectsTrack) return;
    const step = getProjectsStep();
    projectsTrack.style.transform = step ? `translateX(-${projectsCurrentIndex * step}px)` : 'translateX(0)';
};

const rebuildProjectsTrack = () => {
    if (!projectsTrack || projectsOriginalCards.length === 0) return;

    const totalCards = projectsOriginalCards.length;
    const previousVisible = projectsVisibleCards;
    const previousIndex = projectsCurrentIndex;
    const logicalIndex = projectsHasBuiltTrack
        ? ((previousIndex - previousVisible) % totalCards + totalCards) % totalCards
        : 0;

    projectsVisibleCards = getProjectsVisibleCards(totalCards);
    projectsTrack.innerHTML = '';

    const prefixStart = totalCards - projectsVisibleCards;
    for (let i = 0; i < projectsVisibleCards; i++) {
        const clone = projectsOriginalCards[(prefixStart + i) % totalCards].cloneNode(true);
        projectsTrack.appendChild(clone);
    }

    projectsOriginalCards.forEach((card) => {
        projectsTrack.appendChild(card);
    });

    for (let i = 0; i < projectsVisibleCards; i++) {
        const clone = projectsOriginalCards[i % totalCards].cloneNode(true);
        projectsTrack.appendChild(clone);
    }

    decorateProjectCards(projectsTrack);
    projectsCurrentIndex = projectsVisibleCards + logicalIndex;
    projectsTrack.style.transition = 'none';
    setProjectsTransform();
    projectsTrack.getBoundingClientRect();
    projectsTrack.style.transition = '';
    projectsCarouselAnimating = false;
    projectsHasBuiltTrack = true;
};

const syncProjectsCarouselMode = () => {
    if (!projectsTrack) return;
    if (projectsOriginalCards.length === 0) {
        projectsOriginalCards = Array.from(projectsTrack.children);
    }

    projectsCarouselEnabled = projectsOriginalCards.length > 1;

    if (!projectsCarouselEnabled) {
        projectsTrack.classList.remove('carousel-active');
        projectsTrack.style.transition = '';
        projectsTrack.style.transform = '';
        setProjectsButtonsState(false);
        return;
    }

    projectsTrack.classList.add('carousel-active');
    rebuildProjectsTrack();
    setProjectsButtonsState(true);
};

const handleProjectsTransitionEnd = (event) => {
    if (!projectsTrack || event.target !== projectsTrack || !projectsCarouselAnimating) return;

    const totalCards = projectsOriginalCards.length;
    let resetIndex = null;

    if (projectsCurrentIndex >= totalCards + projectsVisibleCards) {
        resetIndex = projectsVisibleCards;
    } else if (projectsCurrentIndex < projectsVisibleCards) {
        resetIndex = totalCards + projectsVisibleCards - 1;
    }

    if (resetIndex !== null) {
        projectsTrack.style.transition = 'none';
        projectsCurrentIndex = resetIndex;
        setProjectsTransform();
        projectsTrack.getBoundingClientRect();
        projectsTrack.style.transition = '';
    }

    projectsCarouselAnimating = false;
};

const moveProjectsBy = (direction) => {
    if (!projectsCarouselEnabled || projectsCarouselAnimating || !projectsTrack) return;
    if (projectsOriginalCards.length < 2) return;

    projectsCurrentIndex += direction;

    if (reducedMotionMedia.matches) {
        const totalCards = projectsOriginalCards.length;
        if (projectsCurrentIndex >= totalCards + projectsVisibleCards) {
            projectsCurrentIndex = projectsVisibleCards;
        } else if (projectsCurrentIndex < projectsVisibleCards) {
            projectsCurrentIndex = totalCards + projectsVisibleCards - 1;
        }

        projectsTrack.style.transition = 'none';
        setProjectsTransform();
        projectsTrack.getBoundingClientRect();
        projectsTrack.style.transition = '';
        return;
    }

    projectsCarouselAnimating = true;
    setProjectsTransform();
};

const moveProjectsNext = () => moveProjectsBy(1);
const moveProjectsPrev = () => moveProjectsBy(-1);

const setupProjectsSwipe = () => {
    if (!projectsViewport || !isTouchDevice) return;

    const SWIPE_THRESHOLD = 48;
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let trackingTouch = false;
    let horizontalSwipe = false;

    projectsViewport.addEventListener('touchstart', (event) => {
        if (!projectsCarouselEnabled || projectsCarouselAnimating) return;

        const touch = event.touches[0];
        if (!touch) return;

        startX = touch.clientX;
        startY = touch.clientY;
        deltaX = 0;
        deltaY = 0;
        trackingTouch = true;
        horizontalSwipe = false;
    }, { passive: true });

    projectsViewport.addEventListener('touchmove', (event) => {
        if (!trackingTouch || projectsCarouselAnimating) return;

        const touch = event.touches[0];
        if (!touch) return;

        deltaX = touch.clientX - startX;
        deltaY = touch.clientY - startY;

        if (!horizontalSwipe) {
            if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY)) {
                horizontalSwipe = true;
            } else if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
                trackingTouch = false;
                return;
            }
        }

        if (horizontalSwipe) {
            event.preventDefault();
        }
    }, { passive: false });

    const finishSwipe = () => {
        if (!trackingTouch) {
            horizontalSwipe = false;
            return;
        }

        if (horizontalSwipe && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
            blockProjectCardClickUntil = Date.now() + 450;
            if (deltaX < 0) moveProjectsNext();
            else moveProjectsPrev();
        }

        trackingTouch = false;
        horizontalSwipe = false;
    };

    projectsViewport.addEventListener('touchend', finishSwipe);
    projectsViewport.addEventListener('touchcancel', finishSwipe);
};

if (projectsPrevBtn && projectsNextBtn && projectsTrack) {
    projectsPrevBtn.addEventListener('click', moveProjectsPrev);
    projectsNextBtn.addEventListener('click', moveProjectsNext);
    projectsTrack.addEventListener('transitionend', handleProjectsTransitionEnd);
    window.addEventListener('resize', syncProjectsCarouselMode);
    syncProjectsCarouselMode();
    setupProjectsSwipe();
}

// Scroll Reveal Animation (Staggered Waterfall)
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

const revealGroups = [
    document.querySelectorAll('#skills .relative.w-full.overflow-hidden'),
    document.querySelectorAll('#tools .relative.w-full.overflow-hidden'),
    document.querySelectorAll('#timeline .relative.max-w-4xl > div.relative.flex'),
    document.querySelectorAll('#projects .grid > div'),
    document.querySelectorAll('#contact .flex-col > *, #contact form > *, #contact button.w-fit')
];

revealGroups.forEach(group => {
    Array.from(group).forEach((el, index) => {
        el.classList.add('reveal-up');
        el.style.transitionDelay = `${index * 150}ms`;
        revealObserver.observe(el);
    });
});

// ════════════════════════════════════════════
//  FRAME ANIMATION ENGINE
//  scrollMode: 'loop'    → auto-play em loop (hero, contact)
//  scrollMode: 'section' → guiado pelo scroll (timeline)
// ════════════════════════════════════════════
const TOTAL_FRAMES = 20;
const FRAME_PATH = (n) => `frames/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;

// Shared preloaded images (carregado uma vez, compartilhado)
const sharedImages = [];
let sharedLoadedCount = 0;
const onFrameReady = [];

function preloadSharedFrames() {
    // Otimização: No mobile, carregar menos frames ou nenhum se for detectado device fraco
    // Por enquanto, vamos carregar todos, mas poderíamos filtrar aqui.
    const framesToLoad = isTouchDevice ? 10 : TOTAL_FRAMES; 
    const step = isTouchDevice ? 2 : 1;

    for (let i = 0; i < TOTAL_FRAMES; i += step) {
        const img = new Image();
        img.src = FRAME_PATH(i + 1);
        img.onload = img.onerror = () => {
            sharedLoadedCount++;
            onFrameReady.forEach(fn => fn(sharedLoadedCount));
        };
        sharedImages[i] = img;
    }
}

/**
 * initSectionFrameAnimation(opts)
 *   canvasId   : id do <canvas>
 *   counterId  : id do badge contador
 *   sectionId  : id da <section>
 *   scrollMode : 'loop' | 'section'
 *     'loop'    → roda em loop automático (sem depender do scroll)
 *     'section' → controlado pelo scroll do usuário
 *   fps         : (só para 'loop') quadros por segundo — padrão 10
 */
function initSectionFrameAnimation({ canvasId, counterId, sectionId, scrollMode, fps = 10 }) {
    const canvas    = document.getElementById(canvasId);
    const counterEl = document.getElementById(counterId);
    const section   = document.getElementById(sectionId);
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let currentFrame  = 0;
    let targetFrame   = 0;
    let renderedFrame = -1;
    let rafStarted    = false;
    let isVisible     = false;

    // Loop mode: controle de tempo
    let lastLoopTime    = 0;
    const frameInterval = 1000 / fps;

    function resizeCanvas() {
        // Cap DPR a 1.5 para performance sem perda visual perceptível
        const dpr  = Math.min(window.devicePixelRatio || 1, 1.5);
        const cssW = section.offsetWidth;
        const cssH = section.offsetHeight;
        canvas.width  = cssW * dpr;
        canvas.height = cssH * dpr;
        canvas.style.width  = cssW + 'px';
        canvas.style.height = cssH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalAlpha = 1;
        ctx.filter      = 'none';
        drawFrame(currentFrame, true);
    }

    function drawFrame(index, force) {
        const img = sharedImages[index];
        if (!img || !img.complete || (!force && index === renderedFrame)) return;
        
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const cw  = canvas.width  / dpr;
        const ch  = canvas.height / dpr;
        const iw  = img.naturalWidth, ih = img.naturalHeight;
        
        const scale = Math.max(cw / iw, ch / ih);
        const sw = iw * scale, sh = ih * scale;
        const ox = (cw - sw) / 2, oy = (ch - sh) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalAlpha = 1;
        
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, ox, oy, sw, sh);
        renderedFrame = index;
    }

    function updateCounter(idx) {
        if (counterEl) {
            counterEl.textContent = `frame_${String(idx + 1).padStart(2, '0')} / ${TOTAL_FRAMES}`;
        }
    }

    // ── LOOP MODE: avança por tempo, em loop infinito
    function loopAnimLoop(timestamp) {
        if (!isVisible) {
            rafStarted = false; // Permite reiniciar pelo IntersectionObserver
            return; 
        }
        
        if (timestamp - lastLoopTime >= frameInterval) {
            lastLoopTime = timestamp;
            currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
            drawFrame(currentFrame, true);
            updateCounter(currentFrame);
        }
        requestAnimationFrame(loopAnimLoop);
    }

    // ── SCROLL MODE: interpola suavemente até targetFrame
    function scrollAnimLoop() {
        if (!isVisible) {
            rafStarted = false; // Permite reiniciar pelo IntersectionObserver
            return;
        }

        if (currentFrame !== targetFrame) {
            const diff = targetFrame - currentFrame;
            const step = diff > 0 ? Math.ceil(diff * 0.16) : Math.floor(diff * 0.16);
            currentFrame += step || (diff > 0 ? 1 : -1);
            if (Math.abs(targetFrame - currentFrame) <= 0.5) currentFrame = targetFrame;
            currentFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrame)));
            // Garante estado limpo do canvas antes de desenhar
            ctx.globalAlpha = 1;
            ctx.filter      = 'none';
            drawFrame(currentFrame, true);
            updateCounter(currentFrame);
        }
        requestAnimationFrame(scrollAnimLoop);
    }

    function calcScrollProgress() {
        const scrollY  = window.scrollY;
        const vh       = window.innerHeight;
        const top      = section.offsetTop;
        const height   = section.offsetHeight;
        return (scrollY + vh - top) / Math.max(height + vh, 1);
    }

    function onScroll() {
        const progress = Math.max(0, Math.min(1, calcScrollProgress()));
        targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
    }

    if (scrollMode === 'section') {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Iniciar quando o primeiro frame estiver pronto
    onFrameReady.push((count) => {
        if (count === 1) {
            resizeCanvas();
            drawFrame(0, true);
            canvas.classList.add('loaded');
        }
    });

    // Intersection Observer para pausar quando fora da tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !rafStarted) {
                rafStarted = true;
                if (scrollMode === 'loop') requestAnimationFrame(loopAnimLoop);
                else scrollAnimLoop();
            }
            if (isVisible) drawFrame(currentFrame, true);
        });
    }, { threshold: 0.01 });
    observer.observe(section);
    
    // Forçar um resize inicial após definição das variáveis
    resizeCanvas();

    // Debounce no resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            drawFrame(currentFrame, true);
        }, 100);
    });
}

// ── Inicializar as três seções ──
preloadSharedFrames();

// Hero: loop automático a 10 fps
initSectionFrameAnimation({
    canvasId:   'hero-canvas',
    counterId:  'hero-frame-counter',
    sectionId:  'hero',
    scrollMode: 'loop',
    fps:        10
});

// Jornada_Log: loop automático a 8 fps (independente do scroll)
initSectionFrameAnimation({
    canvasId:   'timeline-canvas',
    counterId:  'timeline-frame-counter',
    sectionId:  'timeline',
    scrollMode: 'loop',
    fps:        8
});

// CONECTAR_LINK: loop automático a 10 fps
initSectionFrameAnimation({
    canvasId:   'contact-canvas',
    counterId:  'contact-frame-counter',
    sectionId:  'contact',
    scrollMode: 'loop',
    fps:        10
});

// Notification System Logic
function showNotification(message, type = 'success') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `tech-toast ${type}`;
    
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon" style="color: ${type === 'success' ? '#00FF87' : type === 'error' ? '#ffb4ab' : '#9B5DE5'}">${icon}</span>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('active'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
            if (container.childNodes.length === 0) container.remove();
        }, 500);
    }, 5000);
}

// EmailJS Integration
(function() {
    // SUBSTITUA PELO SEU PUBLIC KEY DO EMAILJS
    emailjs.init({
        publicKey: "Y-CZ8QghfO7u8cuM4",
    });
})();

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerHTML;
    
    // Estado de carregamento
    btn.disabled = true;
    btn.innerHTML = 'ENVIANDO...';

    // DISPARO DUPLO: Notificação para você e Auto-Resposta para o cliente
    const notification = emailjs.sendForm('service_t6zj3q4', 'template_pj3z5me', this);
    
    // IMPORTANTE: Substitua 'ID_DO_NOVO_TEMPLATE' pelo ID do template de auto-resposta que você criou no painel
    const autoReply = emailjs.sendForm('service_t6zj3q4', 'template_h98tnkd', this);

    Promise.all([notification, autoReply])
        .then(() => {
            showNotification('Conexão Estabelecida: Mensagem enviada com sucesso!', 'success');
            this.reset();
        }, (error) => {
            console.error('EmailJS Error:', error);
            showNotification('Falha na Transmissão: Verifique sua conexão.', 'error');
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
        });
});
