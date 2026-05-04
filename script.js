// ========================
// INITIALIZATION
// ========================
gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const navbar = document.querySelector('.navbar');
const uploadArea = document.getElementById('upload-area');
const scannerPreview = document.getElementById('scanner-preview');
const scanResult = document.getElementById('scan-result');
const fileInput = document.getElementById('file-input');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Auth Modal References
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const openLoginBtn = document.getElementById('open-login');
const openSignupBtn = document.getElementById('open-signup');
const modalCloses = document.querySelectorAll('.modal-close');
const switchAuthLinks = document.querySelectorAll('.switch-auth');
const readDocumentBtn = document.getElementById('read-document');

// ========================
// NEURAL NETWORK CANVAS
// ========================
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const nodes = [];
const nodeCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 10000));

for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height));
}

function animateNeuralNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * (1 - distance / 150)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animateNeuralNetwork);
}

animateNeuralNetwork();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ========================
// AUTH MODAL FUNCTIONALITY
// ========================
function openAuthModal(type) {
    if (type === 'login') {
        loginModal.classList.remove('hidden');
        signupModal.classList.add('hidden');
        gsap.from(loginModal, {
            opacity: 0,
            duration: 0.4,
        });
    } else {
        signupModal.classList.remove('hidden');
        loginModal.classList.add('hidden');
        gsap.from(signupModal, {
            opacity: 0,
            duration: 0.4,
        });
    }
}

function closeAuthModals() {
    gsap.to([loginModal, signupModal], {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            loginModal.classList.add('hidden');
            signupModal.classList.add('hidden');
        }
    });
}

openLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('login');
});

openSignupBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signup');
});

modalCloses.forEach(btn => {
    btn.addEventListener('click', closeAuthModals);
});

switchAuthLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const type = link.textContent.includes('Sign in') ? 'login' : 'signup';
        openAuthModal(type);
    });
});

// Close modals on background click
[loginModal, signupModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAuthModals();
        }
    });
});

// ========================
// PASSWORD STRENGTH INDICATOR
// ========================
const passwordInputs = document.querySelectorAll('input[type="password"]');

passwordInputs.forEach(input => {
    input.addEventListener('input', () => {
        const strength = calculatePasswordStrength(input.value);
        const strengthBar = input.parentElement.nextElementSibling?.querySelector('.strength-bar');
        const strengthText = input.parentElement.nextElementSibling?.querySelector('.strength-text');

        if (strengthBar && strengthText) {
            let width = 30;
            let text = 'Weak';
            let color = 'rgb(255, 0, 110)';

            if (strength >= 50) {
                width = 65;
                text = 'Good';
                color = 'rgb(255, 200, 0)';
            }
            if (strength >= 80) {
                width = 100;
                text = 'Strong';
                color = 'rgb(0, 255, 136)';
            }

            gsap.to(strengthBar.querySelector(':first-child') || strengthBar, {
                width: width + '%',
                duration: 0.3,
            });

            strengthText.textContent = text;
            strengthText.style.color = color;
        }
    });
});

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z\d]/.test(password)) strength += 20;
    return Math.min(strength, 100);
}

// ========================
// TEXT-TO-SPEECH FUNCTIONALITY
// ========================
function speakText(text, rate = 1) {
    // Check if speechSynthesis is supported
    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis not supported');
        return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event listeners
    utterance.onstart = () => {
        console.log('Speech started');
    };

    utterance.onend = () => {
        console.log('Speech ended');
    };

    utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
    };

    speechSynthesis.speak(utterance);
}

// Add TTS button functionality
readDocumentBtn?.addEventListener('click', () => {
    const extractedText = document.getElementById('extracted-text')?.textContent || 'Patient demonstrates excellent overall health with normal vital signs across all measured parameters. Recommended: Continue current health regimen and routine check-ups annually.';
    
    // Play sound feedback
    playSound('read');
    
    // Start speaking
    speakText(extractedText, 0.9);
    
    // Visual feedback
    gsap.to(readDocumentBtn, {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    });
});

// ========================
// SOUND EFFECTS
// ========================
function playSound(type) {
    // Using Web Audio API to create simple beep sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    switch (type) {
        case 'click':
            oscillator.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'scan':
            oscillator.frequency.value = 400;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'success':
            oscillator.frequency.value = 1200;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'read':
            oscillator.frequency.value = 600;
            gain.gain.setValueAtTime(0.05, audioContext.currentTime);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// ========================
// SCROLL ANIMATIONS
// ========================
gsap.utils.toArray('.feature-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            markers: false,
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        delay: index * 0.1,
    });
});

gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.from(header, {
        scrollTrigger: {
            trigger: header,
            start: 'top 80%',
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
    });
});

gsap.utils.toArray('.team-member').forEach((member, index) => {
    gsap.from(member, {
        scrollTrigger: {
            trigger: member,
            start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        delay: index * 0.1,
    });
});

gsap.utils.toArray('.testimonial-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        delay: index * 0.1,
    });
});

gsap.utils.toArray('.pricing-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        delay: index * 0.1,
    });
});

// ========================
// NAVBAR SCROLL EFFECTS
// ========================
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    
    if (window.scrollY > 100) {
        navbar.style.borderBottomColor = 'rgba(0, 212, 255, 0.3)';
        navbar.style.backdropFilter = 'blur(25px)';
    } else {
        navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
        navbar.style.backdropFilter = 'blur(20px)';
    }
});

// ========================
// SMOOTH SCROLL NAVIGATION
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: target,
                    offsetY: 80,
                },
                ease: 'power2.inOut',
            });
            navMenu.style.display = 'none';
            
            // Play sound feedback
            playSound('click');
        }
    });
});

// ========================
// HAMBURGER MENU
// ========================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    if (navMenu.style.display === 'flex') {
        gsap.to(navMenu, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                navMenu.style.display = 'none';
            }
        });
    } else {
        navMenu.style.display = 'flex';
        gsap.from(navMenu, {
            opacity: 0,
            duration: 0.3,
        });
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        navMenu.style.display = 'none';
        hamburger.classList.remove('active');
    }
});

// ========================
// CURSOR GLOW EFFECT
// ========================
const mousePos = { x: 0, y: 0 };

document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    createMouseGlow(e);
});

function createMouseGlow(e) {
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.width = '40px';
    glow.style.height = '40px';
    glow.style.borderRadius = '50%';
    glow.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.4), transparent)';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '9998';
    glow.style.transform = 'translate(-50%, -50%)';
    glow.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)';

    document.body.appendChild(glow);

    gsap.to(glow, {
        duration: 1,
        opacity: 0,
        onComplete: () => {
            glow.remove();
        }
    });
}

// ========================
// INTERACTIVE DEMO SECTION
// ========================
const scoreValue = document.getElementById('score-value');
let currentScore = 0;
let targetScore = 92;

ScrollTrigger.create({
    trigger: '#demo',
    onEnter: () => {
        if (currentScore === 0) {
            gsap.to({ value: currentScore }, {
                value: targetScore,
                duration: 2.5,
                ease: 'power2.out',
                onUpdate: function() {
                    scoreValue.textContent = Math.floor(this.targets()[0].value);
                }
            });
        }
    }
});

document.getElementById('demo-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
});

// ========================
// VOICE ASSISTANT
// ========================
const voiceButtons = document.querySelectorAll('.voice-actions button');
const aiResponse = document.getElementById('ai-response');

const responses = [
    "I'm analyzing your health data. Everything looks excellent!",
    "Based on your recent activity, I recommend 45 minutes of exercise today.",
    "Your stress levels are optimal. Keep maintaining this wellness routine.",
    "You've been sleeping like a champion! Your immune system is thriving.",
    "Your health score is improving significantly. Stay consistent!",
    "I notice excellent hydration levels. Your cardiovascular health is strong."
];

voiceButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        playSound('click');
        
        button.style.opacity = '0.5';
        
        gsap.to(aiResponse, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                aiResponse.textContent = `"${randomResponse}"`;
                gsap.to(aiResponse, {
                    opacity: 1,
                    duration: 0.3,
                });
            }
        });

        setTimeout(() => {
            button.style.opacity = '1';
            playSound('success');
        }, 1500);
    });
});

// ========================
// DOCUMENT SCANNER
// ========================
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'rgba(0, 212, 255, 0.1)';
    playSound('click');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.background = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    playSound('scan');
    handleFileUpload(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    playSound('scan');
    handleFileUpload(e.target.files);
});

function handleFileUpload(files) {
    if (files.length === 0) return;

    uploadArea.style.display = 'none';
    scannerPreview.style.display = 'block';

    gsap.from(scannerPreview, {
        opacity: 0,
        y: 20,
        duration: 0.4,
    });

    // Simulate scanning with progress animation
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(scanInterval);

            setTimeout(() => {
                playSound('success');
                scannerPreview.style.display = 'none';
                scanResult.style.display = 'block';

                gsap.from(scanResult, {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                });

                // Auto-hide after 8 seconds
                setTimeout(() => {
                    gsap.to(scanResult, {
                        opacity: 0,
                        y: 20,
                        duration: 0.6,
                        onComplete: () => {
                            scanResult.style.display = 'none';
                            uploadArea.style.display = 'block';
                            fileInput.value = '';
                        }
                    });
                }, 8000);
            }, 500);
        }
    }, 400);
}

// ========================
// CTA BUTTON INTERACTIONS
// ========================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
    });

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 212, 255, 0.3), transparent)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
    });
});

// ========================
// FLOATING ANIMATION ENHANCEMENTS
// ========================
gsap.set('.floating-orb', {
    yPercent: 0,
});

document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.floating-orb');
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const x = (e.clientX / window.innerWidth) * speed;
        const y = (e.clientY / window.innerHeight) * speed;

        gsap.to(orb, {
            x: x,
            y: y,
            duration: 1.2,
            overwrite: 'auto',
        });
    });
});

// ========================
// START HEALTH SCAN BUTTON
// ========================
const startScanBtn = document.getElementById('start-scan');
startScanBtn?.addEventListener('click', () => {
    playSound('click');
    gsap.to(window, {
        duration: 1.2,
        scrollTo: {
            y: '#demo',
            offsetY: 80,
        },
        ease: 'power2.inOut',
    });
});

// ========================
// WAVE ANIMATION FOR VOICE ASSISTANT
// ========================
const waves = document.querySelectorAll('.wave');
waves.forEach((wave, index) => {
    gsap.fromTo(wave, 
        { scale: 0.8, opacity: 1 },
        { 
            scale: 2.5, 
            opacity: 0,
            duration: 2,
            repeat: -1,
            delay: index * 0.66,
            ease: 'power2.out'
        }
    );
});

// ========================
// TESTIMONIAL CARD TILT
// ========================
document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.3,
            transformPerspective: 1000,
            transformOrigin: 'center center',
            overwrite: 'auto',
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.3,
        });
    });
});

// ========================
// METRIC CARDS EXPANSION
// ========================
document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            scale: 1.08,
            duration: 0.3,
            overwrite: 'auto',
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            duration: 0.3,
        });
    });
});

// ========================
// FOOTER ANIMATION
// ========================
ScrollTrigger.create({
    trigger: '.footer',
    onEnter: () => {
        gsap.from('.footer-section', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
        });
    }
});

// ========================
// FORM SUBMISSION
// ========================
const forms = document.querySelectorAll('.auth-form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        playSound('success');
        
        // Show loading animation
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Simulate processing
        setTimeout(() => {
            submitBtn.textContent = '✓ Success!';
            gsap.to(submitBtn, {
                duration: 0.5,
                scale: 0.98,
                yoyo: true,
                repeat: 1,
            });
            
            // Reset after 2 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                form.reset();
                closeAuthModals();
            }, 2000);
        }, 1500);
    });
});

// ========================
// RESPONSIVE HANDLER
// ========================
function handleResponsive() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.hero-buttons').forEach(container => {
            container.style.flexDirection = 'column';
        });
    }
}

window.addEventListener('resize', handleResponsive);
handleResponsive();

// ========================
// PERFORMANCE OPTIMIZATION
// ========================
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(1);
}

// ========================
// SCROLL TRIGGER CLEANUP
// ========================
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});

// ========================
// CONSOLE MESSAGE
// ========================
console.log('%c🧠 MediMind AI - Premium Health Intelligence', 'font-size: 20px; color: #00d4ff; font-weight: bold;');
console.log('%cBuilding the future of predictive healthcare', 'font-size: 14px; color: #b0b8d4;');
console.log('%cPowered by advanced neural networks & AI', 'font-size: 12px; color: #00ff88;');

// ========================
// PREMIUM INIT COMPLETE
// ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('MediMind AI loaded and ready');
});
