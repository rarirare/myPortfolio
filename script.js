// Canvas Setup with device detection
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Device detection
const isTouchDevice = ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0) || 
                     (navigator.msMaxTouchPoints > 0);

// Pointer Configuration with responsive sizing
const pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: Math.min(20, window.innerWidth * 0.02), // Responsive radius
    growing: true,
    visible: !isTouchDevice // Hide on touch devices
};

// Enhanced Canvas Sizing
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}

// Initialize Canvas with proper sizing
function initializeCanvas() {
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    
    if (!isTouchDevice) {
        document.body.style.cursor = 'none';
    }
    
    resizeCanvas();
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Enhanced Ripple Class with responsive sizing
class Ripple {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.maxRadius = Math.min(100, window.innerWidth * 0.1);
        this.opacity = 1;
        this.color = `rgba(255, 255, 255, 0.5)`;
    }

    update() {
        const growthRate = Math.min(5, window.innerWidth * 0.005);
        this.radius += growthRate;
        this.opacity -= 0.02;
    }

    draw() {
        if (this.opacity <= 0) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.min(2, window.innerWidth * 0.002);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.stroke();
        ctx.closePath();
    }

    isComplete() {
        return this.opacity <= 0 || this.radius >= this.maxRadius;
    }
}

// RippleManager with performance optimizations
class RippleManager {
    constructor() {
        this.ripples = [];
        this.maxRipples = isTouchDevice ? 3 : 10;
    }

    addRipple(x, y, radius) {
        if (this.ripples.length >= this.maxRipples) {
            this.ripples.shift();
        }
        this.ripples.push(new Ripple(x, y, radius));
    }

    update() {
        this.ripples = this.ripples.filter(ripple => {
            ripple.update();
            return !ripple.isComplete();
        });
    }

    draw() {
        this.ripples.forEach(ripple => ripple.draw());
    }
}

// Initialize Ripple Manager
const rippleManager = new RippleManager();

// Event Listeners
function initializeEventListeners() {
    // Mouse movement
    window.addEventListener('mousemove', throttle((event) => {
        if (!isTouchDevice) {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
        }
    }, 16));

    // Touch events
    window.addEventListener('touchmove', throttle((event) => {
        event.preventDefault();
        const touch = event.touches[0];
        pointer.x = touch.clientX;
        pointer.y = touch.clientY;
    }, 16), { passive: false });

    // Window resize
    window.addEventListener('resize', throttle(() => {
        resizeCanvas();
        pointer.radius = Math.min(20, window.innerWidth * 0.02);
    }, 100));
}

// Animation Loop with performance optimization
function animate() {
    if (!pointer.visible && isTouchDevice) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update pointer radius
    if (pointer.growing) {
        pointer.radius += Math.min(1, window.innerWidth * 0.001);
        if (pointer.radius > Math.min(50, window.innerWidth * 0.05)) pointer.growing = false;
    } else {
        pointer.radius -= Math.min(1, window.innerWidth * 0.001);
        if (pointer.radius < Math.min(20, window.innerWidth * 0.02)) pointer.growing = true;
    }

    // Add and update ripples
    rippleManager.addRipple(pointer.x, pointer.y, pointer.radius);
    rippleManager.update();
    rippleManager.draw();

    // Draw pointer
    if (!isTouchDevice) {
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, Math.min(5, window.innerWidth * 0.005), 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    requestAnimationFrame(animate);
}



// Updated Navigation Enhancement
function initializeNavigation() {
    const header = document.getElementById("navig");
    const btns = header.getElementsByClassName("btn");
    const sections = document.querySelectorAll('section');
    const homeSection = document.querySelector('#home');

    // Function to hide all sections
    function hideAllSections() {
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.transform = 'translateX(100%)';
        });
        homeSection.classList.remove('hide');
        homeSection.style.transform = 'translateX(0)';
    }

    function showSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        const logo = document.querySelector('.logoName'); // Add this line to get the logo element
        
        // First hide all sections
        sections.forEach(section => {
            if (section.id !== sectionId) {
                section.classList.remove('active');
                section.style.transform = 'translateX(100%)';
                section.style.visibility = 'hidden';
            }
        });
    
        // Then show target section and handle logo visibility
        if (sectionId === 'home') {
            homeSection.classList.remove('hide');
            homeSection.style.transform = 'translateX(0)';
            homeSection.style.visibility = 'visible';
            logo.style.display = 'none'; // Hide logo on home page
        } else {
            homeSection.classList.add('hide');
            homeSection.style.transform = 'translateX(-100%)';
            homeSection.style.visibility = 'hidden';
            targetSection.classList.add('active');
            targetSection.style.transform = 'translateX(0)';
            targetSection.style.visibility = 'visible';
            logo.style.display = 'block'; // Show logo on other pages
        }
    }

    // Function to update active button
    function updateActiveButton(hash) {
        Array.from(btns).forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('href') === hash) {
                btn.classList.add('active');
            }
        });  
    }

    // Handle initial load and refresh
    function handleInitialState() {
        const hash = window.location.hash;
        if (hash && hash !== '#home') {
            showSection(hash.substring(1));
            updateActiveButton(hash);
        } else {
            // Default to home if no hash or #home
            hideAllSections();
            updateActiveButton('#home');
            window.location.hash = 'home';
        }
    }

    // Add click handlers to buttons
    Array.from(btns).forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            
            // Update URL without triggering hashchange
            window.history.pushState(null, '', `#${targetId}`);
            
            // Update UI
            showSection(targetId);
            updateActiveButton(this.getAttribute("href"));
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash || '#home';
        const sectionId = hash.substring(1);
        showSection(sectionId);
        updateActiveButton(hash);
    });

    // Initialize on page load
    handleInitialState();
}

// Work Section Functionality
function initializeWorkSection() {
    const workItems = document.querySelectorAll('.work-item');
    const modal = document.getElementById('work-modal');
    const modalContent = document.getElementById('modal-content-container');
    const closeModal = document.querySelector('.close-modal');

    // Work items data - you can expand this
    const workItemsData = {
        1: {
            title: "Project 1",
            description: `
                <div class="modal-project-content">
                    <img src="work/specAds/hood.webp" alt="" srcset="" class="modal-img" alt="Project 1 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                        <img src="work/specAds/instaShine.webp" alt="" srcset="" class="modal-img" alt="Project 1 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                        <img src="work/specAds/pencilHammer.webp" alt="" srcset="" class="modal-img" alt="Project 1 Full" style="width: 100%; height: auto; margin-bottom: 20px;">        
                
                    
                </div>
            `
        },
        2: {
            title: "Project 2",
            description: `
                <div class="modal-project-content">
                    <img src="/work/typographyAds/b0.webp" class="modal-img" alt="Project 2 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/typographyAds/b1.webp" class="modal-img" alt="Project 2 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/typographyAds/bo0.webp" class="modal-img" alt="Project 2 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/typographyAds/bo1.webp" class="modal-img" alt="Project 2 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                </div>
            `
        },
        3: {
            title: "Creative Agency Branding",
            description: `
                <div class="modal-project-content">
                    <h2>Creative Agency</h2>
                    <p>Upside Down is an creative agency that bel</p>
                    <img src="/work/upsideDown/a1.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a3.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a2.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a4.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a5.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a6.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a7.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a8.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/upsideDown/a9.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                </div>
            `
        },
        4:  {
            title: "Nothing",
            description:`
                <div class="modal-project-content">
                    <img src="/work/nothing/0.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/nothing/1.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/nothing/2.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/nothing/3.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/nothing/4.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                
                </div>
            `
        },
        5:  {
            title: "diluminati",
            description:`
                <div class="modal-project-content">
                    <img src="/work/diluminati/0.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/diluminati/1.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/diluminati/2.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/diluminati/3.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">      
                </div>
            `
        },
        6:  {
            title: "diluminati",
            description:`
                <div class="modal-project-content">
                    <img src="/work/bianco/0.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/bianco/1.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/bianco/2.webp" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                         
                </div>
            `
        },
        7:  {
            title: "mac",
            description:`
                <div class="modal-project-content">
                    <img src="/work/mac/0.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/mac/1.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                    <img src="/work/mac/2.jpg" class="modal-img" alt= "Project 3 Full" style="width: 100%; height: auto; margin-bottom: 20px;">
                         
                </div>
            `
        }
    };

    function scrollToTop(element) {
        if (element) {
            element.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    // Open modal
    function openModal(id) {
        const data = workItemsData[id];
        if (!data) return;

        // First scroll the work section to top
        const workSection = document.getElementById('work');
        scrollToTop(workSection);

        // Then open modal with slight delay to ensure smooth transition
        setTimeout(() => {
            modalContent.innerHTML = data.description;
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            closeModal.style.display='flex';
            // Reset modal scroll position
            const modalContentContainer = document.getElementById('modal-content-container');
            if (modalContentContainer) {
                scrollToTop(modalContentContainer);
            }
        }, 3); // Small delay for smooth transition
    }

    function closeModalHandler() {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        closeModal.style.display='none';
        // Scroll work section to top when closing modal
        const workSection = document.getElementById('work');
        scrollToTop(workSection);
    }

    // Event listeners
    workItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            openModal(id);
        });
    });

    closeModal.addEventListener('click', closeModalHandler);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModalHandler();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;

    menuToggle.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        menuToggle.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    document.querySelectorAll('#navig a').forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            menuToggle.classList.remove('menu-open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
            mobileNav.classList.remove('active');
            menuToggle.classList.remove('menu-open');
        }
    });
});



// Initialize everything

document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    initializeEventListeners();
    initializeNavigation();
    initializeWorkSection(); // Add this line
    animate();
});