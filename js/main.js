(function () {
    'use strict';

    // ---------- CONFIG ----------
    const RECAPTCHA_SITEKEY = '6LfsPvkrAAAAAAiUhmmX6X05cBHj95l2A8yqnVd_';
    const STATICFORMS_KEY = 'sf_ieke4i8a01gjchnhil47ja6k';
    const STATICFORMS_ENDPOINT = 'https://api.staticforms.xyz/submit';
    const FETCH_TIMEOUT_MS = 15000;
    const DEBUG_BYPASS_RECAPTCHA = false;
    // ---------- /CONFIG ----------

    // DOM ready boot
    document.addEventListener('DOMContentLoaded', () => {
        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
        initMobileMenu();
        initSmoothScroll();
        initScrollToTop();
        initHeaderScroll();
        initFAQ();
        initContactForm();
        initActiveNavigation();
        initPortfolioConfirm();
    });

    // ---------- Mobile menu ----------
    function initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!menuToggle || !navMenu) return;

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // ---------- Portfolio: confirmação profissional antes de abrir link externo ----------
    function initPortfolioConfirm() {
        let overlay = document.getElementById('portfolio-confirm-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'portfolio-confirm-overlay';
            overlay.className = 'portfolio-confirm-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                <div class="portfolio-confirm-modal" role="dialog" aria-labelledby="portfolio-confirm-title" aria-modal="true">
                    <div class="portfolio-confirm-icon" aria-hidden="true"><i class="fas fa-external-link-alt"></i></div>
                    <h3 id="portfolio-confirm-title">Visitar projeto</h3>
                    <p>Você está saindo do site. Deseja visitar <span class="portfolio-confirm-project"></span>? O link será aberto em nova aba.</p>
                    <div class="portfolio-confirm-actions">
                        <button type="button" class="portfolio-confirm-btn portfolio-confirm-btn-cancel">Cancelar</button>
                        <button type="button" class="portfolio-confirm-btn portfolio-confirm-btn-confirm">Sim, visitar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const projectEl = overlay.querySelector('.portfolio-confirm-project');
            const btnCancel = overlay.querySelector('.portfolio-confirm-btn-cancel');
            const btnConfirm = overlay.querySelector('.portfolio-confirm-btn-confirm');
            let pendingHref = null;

            function close() {
                overlay.classList.remove('is-visible');
                overlay.setAttribute('aria-hidden', 'true');
                document.removeEventListener('keydown', onEsc);
                document.body.style.overflow = '';
            }

            function onEsc(e) {
                if (e.key === 'Escape') { close(); }
            }

            btnCancel.addEventListener('click', () => { close(); pendingHref = null; });
            btnConfirm.addEventListener('click', () => {
                if (pendingHref) window.open(pendingHref, '_blank', 'noopener,noreferrer');
                close();
                pendingHref = null;
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) { close(); pendingHref = null; }
            });

            window.__portfolioConfirm = { show: (projectName, href) => {
                projectEl.textContent = projectName || 'este projeto';
                pendingHref = href;
                overlay.classList.add('is-visible');
                overlay.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                document.addEventListener('keydown', onEsc);
                btnConfirm.focus();
            }};
        }

        document.querySelectorAll('.portfolio-card[href^="http"]').forEach(card => {
            card.addEventListener('click', function (e) {
                e.preventDefault();
                const projectName = this.querySelector('.portfolio-content h3')?.textContent?.trim();
                const href = this.getAttribute('href');
                window.__portfolioConfirm.show(projectName || 'este projeto', href);
            });
        });
    }

    // ---------- Smooth scroll ----------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#' || targetId === '#!') return;
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    // ---------- Testimonials UI (mantive sua implementação) ----------
    (function initTestimonialUI(globalOptions = {}) {
        const options = Object.assign({ openInSameTab: false }, globalOptions);

        if (window.__f8_testimonials_inited) return;
        window.__f8_testimonials_inited = true;

        if (!document.getElementById('f8-tooltip-style')) {
            const style = document.createElement('style');
            style.id = 'f8-tooltip-style';
            style.textContent = `
            .f8-tooltip { position: fixed; background: rgba(20,20,20,0.95); color: #fff; padding: 6px 10px; font-size: 13px; border-radius: 6px; pointer-events: none; z-index: 10000; transform: translate(-50%, -120%); transition: opacity .12s ease, transform .12s ease; opacity: 0; white-space: nowrap; }
            .f8-tooltip.show { opacity: 1; transform: translate(-50%, -150%); }
            .f8-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 11000; padding: 20px; }
            .f8-modal { max-width: 520px; width: 100%; background: #fff; border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); padding: 20px; font-family: inherit; color: #111; }
            .f8-modal h3 { margin: 0 0 8px; font-size: 18px; }
            .f8-modal p { margin: 0 0 16px; color: #333; line-height: 1.4; }
            .f8-modal .f8-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
            .f8-btn { padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
            .f8-btn.f8-cancel { background: transparent; color: #333; box-shadow: none; border: 1px solid #ddd; }
            .f8-btn.f8-confirm { background: #2d6cdf; color: #fff; }
            .f8-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
            `;
            document.head.appendChild(style);
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'f8-tooltip';
        tooltip.textContent = 'Conhecer o site? Clique aqui para ir para o Site';
        document.body.appendChild(tooltip);

        function createModalElements() {
            const overlay = document.createElement('div');
            overlay.className = 'f8-modal-overlay';
            overlay.style.display = 'none';

            const modal = document.createElement('div');
            modal.className = 'f8-modal';
            modal.innerHTML = `
            <h3>Confirmação</h3>
            <p class="f8-modal-message">Você tem certeza que gostaria de conhecer <strong class="f8-site-name"></strong>? Você será redirecionado.</p>
            <div class="f8-modal-actions">
                <button class="f8-btn f8-cancel">Cancelar</button>
                <button class="f8-btn f8-confirm">Sim</button>
            </div>
            `;
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const btnCancel = overlay.querySelector('.f8-cancel');
            const btnConfirm = overlay.querySelector('.f8-confirm');
            const siteNameEl = overlay.querySelector('.f8-site-name');
            const messageEl = overlay.querySelector('.f8-modal-message');

            let confirmHandler = null;

            function open(siteName, href) {
                siteNameEl.textContent = siteName;
                if (!href) {
                    messageEl.textContent = `Nenhum link encontrado para "${siteName}". Não há para onde redirecionar.`;
                    btnConfirm.disabled = true;
                } else {
                    messageEl.textContent = `Você tem certeza que gostaria de conhecer ${siteName}? Você será redirecionado.`;
                    btnConfirm.disabled = false;
                }
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('visible'), 10);
                document.addEventListener('keydown', onEsc);
            }

            function close() {
                overlay.classList.remove('visible');
                overlay.style.display = 'none';
                document.removeEventListener('keydown', onEsc);
                confirmHandler = null;
            }

            function onEsc(e) {
                if (e.key === 'Escape') close();
            }

            overlay.addEventListener('click', (ev) => {
                if (ev.target === overlay) close();
            });
            btnCancel.addEventListener('click', close);
            btnConfirm.addEventListener('click', () => {
                if (confirmHandler) confirmHandler();
                close();
            });

            return {
                open,
                close,
                onConfirm(fn) { confirmHandler = fn; }
            };
        }

        const modalApi = createModalElements();

        function getCardHrefAndName(card) {
            const elWithHref = card.querySelector('[href]');
            if (elWithHref) {
                const href = elWithHref.getAttribute('href') || '';
                try {
                    const url = new URL(href.startsWith('http') ? href : 'https://' + href);
                    return { href: href, name: url.hostname.replace('www.', '') };
                } catch {
                    return { href: href, name: href };
                }
            }
            const authorNameEl = card.querySelector('.testimonial-author h4');
            const name = authorNameEl ? authorNameEl.textContent.trim() : 'o site';
            return { href: null, name: name };
        }

        function bindCard(card) {
            let mouseMoveHandler = null;

            function enterHandler(ev) {
                tooltip.classList.add('show');
                const x = ev.clientX;
                const y = ev.clientY;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                mouseMoveHandler = (e) => {
                    tooltip.style.left = e.clientX + 'px';
                    tooltip.style.top = e.clientY + 'px';
                };
                card.addEventListener('mousemove', mouseMoveHandler);
            }

            function leaveHandler() {
                tooltip.classList.remove('show');
                if (mouseMoveHandler) {
                    card.removeEventListener('mousemove', mouseMoveHandler);
                    mouseMoveHandler = null;
                }
            }

            function clickHandler(e) {
                e.preventDefault();
                const info = getCardHrefAndName(card);
                modalApi.open(info.name, info.href);
                modalApi.onConfirm(() => {
                    if (!info.href) return;
                    const url = info.href.startsWith('http') ? info.href
                        : (info.href.startsWith('/') ? location.origin + info.href : 'https://' + info.href);
                    if (options.openInSameTab) {
                        location.href = url;
                    } else {
                        window.open(url, '_blank');
                    }
                });
            }

            card.addEventListener('mouseenter', enterHandler);
            card.addEventListener('mouseleave', leaveHandler);
            card.addEventListener('click', clickHandler);
        }

        function initAllCards() {
            const cards = document.querySelectorAll('.testimonial-card');
            if (!cards || cards.length === 0) return;
            cards.forEach(bindCard);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAllCards);
        } else {
            initAllCards();
        }

        window.f8TestimonialUI = {
            init: initAllCards,
            setOptions(newOpts) {
                Object.assign(options, newOpts);
            }
        };
    })();

    // ---------- Scroll to top ----------
    function initScrollToTop() {
        const scrollToTopBtn = document.querySelector('.scroll-to-top');
        if (!scrollToTopBtn) return;
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) scrollToTopBtn.classList.add('visible');
            else scrollToTopBtn.classList.remove('visible');
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- Header scroll ----------
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // ---------- FAQ ----------
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => otherItem.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        });
    }

    // ---------- reCAPTCHA helpers ----------
    window.__f8_recaptcha_widgets = window.__f8_recaptcha_widgets || [];

    window.onRecaptchaLoad = function () {
        try {
            const els = document.querySelectorAll('.g-recaptcha');
            if (!els || els.length === 0) {
                console.warn('reCAPTCHA: nenhum elemento .g-recaptcha no DOM ao carregar.');
                return;
            }
            els.forEach((el, idx) => {
                if (el.dataset.f8WidgetId) return;
                try {
                    if (!el.id) el.id = 'f8-recaptcha-' + Date.now() + '-' + idx;
                    const widgetId = grecaptcha.render(el.id, {
                        sitekey: RECAPTCHA_SITEKEY,
                        theme: 'light'
                    });
                    el.dataset.f8WidgetId = widgetId;
                    window.__f8_recaptcha_widgets.push({ el, widgetId });
                    console.info('reCAPTCHA renderizado. widgetId=', widgetId);
                } catch (err) {
                    console.error('Erro ao renderizar reCAPTCHA no elemento', el, err);
                }
            });
        } catch (err) {
            console.error('onRecaptchaLoad erro:', err);
        }
    };

    try {
        if (window.grecaptcha && typeof window.onRecaptchaLoad === 'function') {
            console.info('grecaptcha already present — invoking onRecaptchaLoad() to render widgets.');
            window.onRecaptchaLoad();
        }
    } catch (e) {
        console.warn('Auto-call onRecaptchaLoad failed:', e);
    }

    function getRecaptchaResponse() {
        try {
            if (!window.grecaptcha) {
                console.warn('getRecaptchaResponse: grecaptcha não disponível.');
                return '';
            }
            // se mapeamos widgets, retorna o primeiro que tiver resposta
            for (const w of (window.__f8_recaptcha_widgets || [])) {
                try {
                    const resp = grecaptcha.getResponse(Number(w.widgetId));
                    if (resp && String(resp).length > 0) return resp;
                } catch (e) {
                    // ignora
                }
            }
            // fallback genérico (padrão do grecaptcha)
            try {
                const fallback = grecaptcha.getResponse();
                if (fallback && String(fallback).length > 0) return fallback;
            } catch (err) { /* ignore */ }
            return '';
        } catch (err) {
            console.warn('getRecaptchaResponse falhou:', err);
            return '';
        }
    }

    function resetRecaptcha() {
        try {
            if (!window.grecaptcha) return;
            for (const w of (window.__f8_recaptcha_widgets || [])) {
                try {
                    grecaptcha.reset(Number(w.widgetId));
                } catch (e) { /* ignore */ }
            }
            try { grecaptcha.reset(); } catch (e) { /* ignore */ }
        } catch (err) {
            console.warn('resetRecaptcha falhou:', err);
        }
    }

    // ---------- Contact Form ----------
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.noValidate = true;

        // garante input apiKey caso alguém submeta sem JS
        if (!form.querySelector('input[name="apiKey"]')) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'apiKey';
            hidden.value = STATICFORMS_KEY;
            form.appendChild(hidden);
        } else {
            form.querySelector('input[name="apiKey"]').value = STATICFORMS_KEY;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors(form);
            clearFormError(form);
            clearCaptchaError(form);

            // honeypots: busca tanto dentro do form quanto no documento
            const hpCompany = form.querySelector('[name="company"]') || document.querySelector('[name="company"]');
            const hpHidden = form.querySelector('[name="honeypot"]');
            if ((hpCompany && hpCompany.value.trim() !== '') || (hpHidden && hpHidden.value.trim() !== '')) {
                showFormError(form, 'Detectamos envio automatizado. Se acredita ser um erro, entre em contato por WhatsApp.');
                return;
            }

            if (!validateForm(form)) {
                showFormError(form);
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : 'Enviar';

            if (submitButton) {
                submitButton.textContent = 'Enviando...';
                submitButton.disabled = true;
                submitButton.setAttribute('aria-busy', 'true');
            }

            try {
                // pega token usando helper
                let token = '';
                if (DEBUG_BYPASS_RECAPTCHA) {
                    console.warn('DEBUG_BYPASS_RECAPTCHA ativo: enviando sem token (teste local apenas)');
                    token = 'DEBUG_BYPASS';
                } else {
                    token = getRecaptchaResponse();
                    console.info('reCAPTCHA token length:', String(token || '').length);
                }

                if (!token && !DEBUG_BYPASS_RECAPTCHA) {
                    // token vazio => usuário precisa completar o widget
                    showCaptchaError(form, 'Por favor, confirme que você não é um robô.');
                    console.warn('Formulário abortado: token reCAPTCHA vazio.');
                    resetRecaptcha();
                    if (submitButton) {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        submitButton.removeAttribute('aria-busy');
                    }
                    return;
                }

                const formData = new FormData(form);
                // limpeza e padronização
                formData.set('name', (form.name && form.name.value) ? form.name.value.trim() : '');
                formData.set('email', (form.email && form.email.value) ? form.email.value.trim() : '');
                formData.set('phone', (form.phone && form.phone.value) ? form.phone.value.trim() : '');
                formData.set('service', (form.service && form.service.value) ? form.service.value.trim() : '');
                formData.set('message', (form.message && form.message.value) ? form.message.value.trim() : '');
                formData.set('replyTo', (form.email && form.email.value) ? form.email.value.trim() : '');
                formData.set('subject', 'Orçamento da F8 - ' + (form.service && form.service.value ? form.service.value : 'Contato'));
                formData.set('g-recaptcha-response', token);
                // algumas implementações publicadas do StaticForms usam 'accessKey' ou 'apiKey'
                formData.set('apiKey', STATICFORMS_KEY);
                formData.set('accessKey', STATICFORMS_KEY);

                // AbortController para timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

                console.debug('Enviando POST para StaticForms...');
                const resp = await fetch(STATICFORMS_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal,
                    mode: 'cors'
                }).finally(() => clearTimeout(timeoutId));

                console.info('StaticForms status:', resp.status, resp.statusText);

                let json = null;
                let textBody = null;
                const contentType = (resp.headers && resp.headers.get) ? (resp.headers.get('content-type') || '') : '';

                try {
                    if (contentType.includes('application/json')) {
                        json = await resp.json();
                        console.debug('Resposta JSON do servidor:', json);
                    } else {
                        textBody = await resp.text();
                        console.debug('Resposta texto do servidor:', textBody);
                    }
                } catch (err) {
                    console.warn('Falha ao parsear body do servidor:', err);
                    try { textBody = await resp.text(); } catch (e) { /* ignore */ }
                }

                // --- início: detecção de sucesso mais robusta ---
                const redirectTo = (form.querySelector('input[name="redirectTo"]') || {}).value || 'obrigado.html';

                // Detecta sucesso por várias pistas: JSON, texto ou ausência de erro
                const bodyIndicatesSuccess = (json && (json.success === true || /success|ok|enviado|obrigad/i.test(json.message || '')));
                const textIndicatesSuccess = (typeof textBody === 'string' && /success|ok|enviado|obrigad|thank you/i.test(textBody));
                const noBodyButOk = resp.ok && !json && !textBody; // fallback quando não conseguimos ler corpo

                if (resp.ok && (bodyIndicatesSuccess || textIndicatesSuccess || noBodyButOk)) {
                    console.info('Envio detectado como SUCCESS. redirecionando para:', redirectTo);
                    showFormSuccess(form, (json && json.message) || 'Mensagem enviada com sucesso!');
                    form.reset();
                    resetRecaptcha();
                    setTimeout(() => { window.location.href = redirectTo; }, 700);
                    return;
                }

                // Mensagens de erro tratadas
                const serverMsg = (json && (json.error || json.message)) || textBody || `Falha ao enviar (status ${resp.status}).`;
                console.error('StaticForms erro detalhado:', { status: resp.status, body: json || textBody });

                const lower = String(serverMsg || '').toLowerCase();
                if (lower.includes('captcha')) {
                    showCaptchaError(form, 'Não foi possível validar o reCAPTCHA. Por favor, tente novamente.');
                    resetRecaptcha();
                } else if (lower.includes('honeypot') || lower.includes('spam')) {
                    showFormError(form, 'Detectamos comportamento suspeito. Se você não é um robô, contate-nos pelo WhatsApp.');
                } else if (resp.status === 0) {
                    showFormError(form, 'Erro de rede/CORS ao contatar o servidor. Verifique o console (F12) e a aba Network.');
                } else {
                    showFormError(form, serverMsg);
                }

                if (submitButton) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-busy');
                }

            } catch (error) {
                console.error('Contact form error (catch):', error);
                if (error && error.name === 'AbortError') {
                    showFormError(form, 'Tempo de requisição esgotado. Verifique sua conexão e tente novamente.');
                } else {
                    showFormError(form, 'Não foi possível enviar sua mensagem no momento. Por favor, tente novamente ou entre em contato por outro canal.');
                }
                try { resetRecaptcha(); } catch (err) { /* ignore */ }
                if (submitButton) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-busy');
                }
            }
        });
    }

    // ---------- Validation & spam checks ----------
    function validateForm(form) {
        let isValid = true;

        const nameField = form.name;
        if (!nameField || nameField.value.trim().split(/\s+/).length < 2) {
            showError(nameField, 'Insira seu nome completo (nome e sobrenome).');
            isValid = false;
        }

        const emailField = form.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailField || !emailRegex.test(emailField.value.trim())) {
            showError(emailField, 'Insira um e-mail válido (ex: nome@dominio.com).');
            isValid = false;
        }

        const phoneField = form.phone;
        const phoneDigits = phoneField ? phoneField.value.replace(/\D/g, '') : '';
        if (!phoneField || phoneDigits.length < 10) {
            showError(phoneField, 'Informe um telefone válido com DDD (mínimo 10 dígitos).');
            isValid = false;
        }

        const serviceField = form.service;
        if (serviceField && !serviceField.value) {
            showError(serviceField, 'Selecione o serviço de interesse.');
            isValid = false;
        }

        const messageField = form.message;
        const messageValue = messageField ? messageField.value.trim() : '';
        if (!messageField || messageValue.length < 10) {
            showError(messageField, 'Escreva uma mensagem com pelo menos 10 caracteres.');
            isValid = false;
        } else if (messageValue.length > 1500) {
            showError(messageField, 'Mensagem muito longa. Máximo 1500 caracteres.');
            isValid = false;
        } else if (isSpam(messageValue)) {
            showError(messageField, 'Sua mensagem parece conter links ou conteúdo inválido.');
            isValid = false;
        }

        return isValid;
    }

    function isSpam(text) {
        const linkPatterns = [
            /(http(s)?:\/\/|www\.)/i,
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i,
            /\b[a-z0-9.-]+\.(com|br|net|org|xyz|info|biz|ru|cn)\b/i
        ];
        if (linkPatterns.some(pattern => pattern.test(text))) return true;

        const spamKeywords = [
            'viagra', 'cialis', 'casino', 'lottery', 'prize', 'click here',
            'buy now', 'limited offer', 'make money', 'work from home', 'curso',
            'ganhe dinheiro', 'renda extra', 'trabalhe em casa', 'clique aqui',
            'oferta limitada', 'grátis', 'empréstimo', 'compre', 'buy', 'www', 'http', 'https'
        ];
        const keywordRegex = new RegExp('\\b(' + spamKeywords.join('|') + ')\\b', 'i');
        if (keywordRegex.test(text)) return true;

        const nonLatinRegex = /[а-яА-Я]/;
        if (nonLatinRegex.test(text)) return true;

        const upperCaseChars = (text.match(/[A-Z]/g) || []).length;
        const alphaChars = (text.match(/[A-Za-z]/g) || []).length;
        if (alphaChars > 10 && (upperCaseChars / alphaChars > 0.5)) return true;

        return false;
    }

    // ---------- UI helpers ----------
    function showError(field, message) {
        if (!field) return;
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.add('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) errorMessage.textContent = message;
        else {
            const span = document.createElement('span');
            span.className = 'error-message';
            span.textContent = message;
            formGroup.appendChild(span);
        }
    }

    function clearErrors(form) {
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) errorMessage.textContent = '';
            const inputs = group.querySelectorAll('input, textarea, select');
            inputs.forEach(i => {
                if (typeof i.setCustomValidity === 'function') i.setCustomValidity('');
            });
        });
    }

    function showFormError(form, message) {
        const statusMessage = ensureStatusElement(form);
        if (statusMessage) {
            statusMessage.textContent = message || 'Por favor, corrija os campos em vermelho.';
            statusMessage.className = 'form-status-message error';
            statusMessage.setAttribute('role', 'status');
            statusMessage.setAttribute('aria-live', 'polite');
        }
    }

    function clearFormError(form) {
        const statusMessage = ensureStatusElement(form);
        if (statusMessage) {
            statusMessage.textContent = '';
            statusMessage.className = 'form-status-message';
        }
    }

    function showFormSuccess(form, message) {
        const statusMessage = ensureStatusElement(form);
        if (statusMessage) {
            statusMessage.textContent = message || 'Mensagem enviada com sucesso.';
            statusMessage.className = 'form-status-message success';
            statusMessage.setAttribute('role', 'status');
            statusMessage.setAttribute('aria-live', 'polite');
        }
    }

    function showCaptchaError(form, message) {
        const captchaWrap = form.querySelector('.g-recaptcha');
        if (!captchaWrap) {
            showFormError(form, message);
            return;
        }
        clearCaptchaError(form);
        const span = document.createElement('div');
        span.className = 'recaptcha-error-message';
        span.setAttribute('role', 'alert');
        span.style.color = '#b00020';
        span.style.marginTop = '8px';
        span.style.fontSize = '0.95rem';
        span.textContent = message;
        captchaWrap.parentNode.insertBefore(span, captchaWrap.nextSibling);
    }

    function clearCaptchaError(form) {
        const existing = form.querySelector('.recaptcha-error-message');
        if (existing) existing.remove();
    }

    function ensureStatusElement(form) {
        let statusMessage = document.getElementById('form-status-message');
        return statusMessage;
    }

    // ---------- Active navigation ----------
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ---------- Stats animation ----------
    (function () {
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const formatValue = (value, decimals) => {
            return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
        };
        const animateNumber = (el, target, decimals, suffix, duration) => {
            const start = performance.now();
            const initial = 0;
            const run = now => {
                const elapsed = now - start;
                const progress = Math.min(1, elapsed / duration);
                const eased = easeOutCubic(progress);
                const current = initial + (target - initial) * eased;
                el.textContent = formatValue(current, decimals) + suffix;
                if (progress < 1) requestAnimationFrame(run);
                else el.setAttribute('data-animated', 'true');
            };
            requestAnimationFrame(run);
        };
        const parseTarget = text => {
            const raw = String(text).trim();
            const hasPlus = raw.includes('+');
            const hasPercent = raw.includes('%');
            const suffix = (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
            const numMatch = raw.match(/[\d\.,]+/);
            if (!numMatch) return { value: 0, decimals: 0, suffix };
            const numStr = numMatch[0].replace(',', '.');
            const value = parseFloat(numStr) || 0;
            const decimals = numStr.includes('.') ? Math.min(2, numStr.split('.')[1].length) : 0;
            return { value, decimals, suffix };
        };
        const startObserver = () => {
            const section = document.querySelector('.about-stats');
            if (!section) return;
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const items = section.querySelectorAll('.stat-number');
                    items.forEach(el => {
                        if (el.getAttribute('data-animated') === 'true') return;
                        const parsed = parseTarget(el.textContent || el.innerText);
                        const duration = 1400 + Math.min(2000, parsed.value * 10);
                        animateNumber(el, parsed.value, parsed.decimals, parsed.suffix, duration);
                    });
                    obs.unobserve(section);
                });
            }, { threshold: 0.35 });
            observer.observe(section);
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver);
        else startObserver();
    })();

    // Cookies
    document.addEventListener("DOMContentLoaded", function () {
        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept');

        if (localStorage.getItem('cookie_consent') === 'true') {
            banner.style.display = 'none';
        }

        acceptBtn.addEventListener('click', function (e) {
            e.preventDefault();
            banner.style.display = 'none';
            localStorage.setItem('cookie_consent', 'true');
        });
    });

})();
