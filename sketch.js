let particles = [];
let font;
let points;
let points1;
let bounds;
let fontSize;
let textSpacing;

// Add these variables at the top with other global variables
let currentMarqueeIndex = 0;
let currentX = 0;
let targetX = 0;
let isAnimating = false;
let lastScrollTime = 0;
const scrollCooldown = 800; // Increased cooldown to prevent accidental double scrolls
const animationDuration = 200; // Duration of the animation in ms
const offscreenOffset = 100;


let marqueeTexts = [
    { text: "Art Director.", color: "rgb(51, 153, 85)" },
    { text: "Designer.", color: "red" },
    { text: "Web Developer", color: "rgb(51, 133, 153)" },
    { text: "Artist", color: "rgb(114, 153, 51)" }
];

function preload() {
    font = loadFont('BauhausBold.ttf');
}

function calculateResponsiveSizes() {
    fontSize = min(width * 0.12, 150);
    textSpacing = fontSize * 1.1;
    return {
        firstLineY: height * 0.3,
        secondLineY: height * 0.3 + textSpacing
    };
}

function resetParticles() {
    particles = [];
    const sizes = calculateResponsiveSizes();
    
    let sampleFactor;
    if (width < 480) {
        sampleFactor = 0.5;
    } else if (width < 768) {
        sampleFactor = 0.25;
    } else {
        sampleFactor = 0.2;
    }

    points = font.textToPoints('RAHUL', 
        width * 0.05,
        sizes.firstLineY, 
        fontSize,
        {
            sampleFactor: sampleFactor,
            simplifyThreshold: 0
        }
    );

    points1 = font.textToPoints('KONDAMGIRE', 
        width * 0.05,
        sizes.secondLineY,
        fontSize,
        {
            sampleFactor: sampleFactor,
            simplifyThreshold: 0
        }
    );

    const centerX = width / 2;
    const centerY = height / 2;
    const heartSize = min(width, height) * 0.15; // Responsive heart size

    function heartX(t) {
        // Heart curve x-coordinate
        return 16 * pow(sin(t), 3);
    }

    function heartY(t) {
        // Heart curve y-coordinate
        return -(13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    }

    // Create particles with heart-shaped initial positions
    [...points, ...points1].forEach((p, index) => {
        // Calculate position on heart curve
        const t = random(TWO_PI);
        
        // Add some randomness to make it more scattered
        const randomOffset = random(-0.5, 0.5) * heartSize * 0.2;
        
        // Calculate heart position
        const hx = heartX(t) * heartSize / 16 + randomOffset;
        const hy = heartY(t) * heartSize / 16 + randomOffset;
        
        // Add jitter for more natural look
        const jitter = random(-1, 1) * heartSize * 0.1;
        
        const startX = centerX + hx + jitter;
        const startY = centerY + hy + jitter;
        
        particles.push(new Particle(startX, startY, p.x, p.y));
    });

    bounds = {
        x: width * 0.05,
        y: sizes.firstLineY - fontSize,
        w: width * 0.9,
        h: textSpacing + fontSize
    };
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('sketch-container');
    pixelDensity(min(window.devicePixelRatio || 1, 2));
    
    textFont(font);
    resetParticles();
}

function draw() {
    background(0);

    const isMobile = width < 768;
    const interactionRadius = isMobile ? 100 : 150;
    const particleSize = isMobile ? 2 : 3;

    let mouseInBounds = mouseX > bounds.x && mouseX < bounds.x + bounds.w &&
                       mouseY > bounds.y && mouseY < bounds.y + bounds.h;

    for (let particle of particles) {
        if (!particle.hasReachedTarget) {
            particle.moveToTarget();
        } else if (mouseInBounds) {
            particle.flee(mouseX, mouseY, interactionRadius);
        } else {
            particle.return();
        }
        
        particle.update();
        particle.show(particleSize);
    }

    drawMarquee();
}


class Particle {
    constructor(startX, startY, targetX, targetY) {
        this.pos = createVector(startX, startY);
        this.target = createVector(targetX, targetY);
        this.vel = createVector();
        this.acc = createVector();
        this.maxSpeed = random(8, 15); // Random speed for each particle
        this.maxForce = random(0.8, 1.2); // Random force for each particle
        this.returnSpeed = 0.1;
        this.hasReachedTarget = false;
        this.arrivalThreshold = 0.5;
        
        // Random delay before starting movement
        this.delay = random(0, 10);
        this.delayCounter = 0;
    }

    moveToTarget() {
        if (this.delayCounter < this.delay) {
            this.delayCounter++;
            return;
        }

        let desired = p5.Vector.sub(this.target, this.pos);
        let distance = desired.mag();

        if (distance < this.arrivalThreshold) {
            this.hasReachedTarget = true;
            this.pos = this.target.copy();
            this.vel.mult(0);
            return;
        }

        desired.normalize();
        
        // Ease in as particle approaches target
        let speed = this.maxSpeed;
        if (distance < 100) {
            speed = map(distance, 0, 100, 0, this.maxSpeed);
        }
        
        desired.mult(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        this.acc.add(steer);
    }

    flee(mx, my, radius) {
        let desired = p5.Vector.sub(createVector(mx, my), this.pos);
        let d = desired.mag();
        
        if (d < radius) {
            let force = map(d, 0, radius, this.maxForce * 2, 0);
            desired.setMag(this.maxSpeed);
            desired.mult(-1);
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(force);
            this.acc.add(steer);
        }
    }

    return() {
        let desired = p5.Vector.sub(this.target, this.pos);
        let d = desired.mag();
        
        if (d > 0.5) {
            let speed = map(d, 0, 100, 0.5, this.maxSpeed);
            desired.setMag(speed);
            
            let steer = p5.Vector.sub(desired, this.vel);
            steer.mult(this.returnSpeed);
            this.acc.add(steer);
            
            if (d < 50) {
                this.vel.mult(0.95);
            }
        } else {
            this.pos = this.target.copy();
            this.vel.mult(0);
        }
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show(size) {
        fill(255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, size);
    }
}

function drawMarquee() {
    push();
    textFont(font);
    
    // Responsive text size calculation
    let marqueeTextSize;
    if (width < 480) { // Mobile
        marqueeTextSize = width * 0.12;
    } else if (width < 768) { // Tablet
        marqueeTextSize = width * 0.08;
    } else { // Desktop
        marqueeTextSize = fontSize * 0.4;
    }
    
    textSize(marqueeTextSize);
    textAlign(LEFT, CENTER);
    
    // Position below the fly-away text
    let baseY = height * 0.7;
    marqueeHeight = marqueeTextSize * 1.5;
    
    // Smoother easing function
    let easing = 0.15;
    currentX = lerp(currentX, targetX, easing);
    
    // Get current word
    let currentItem = marqueeTexts[currentMarqueeIndex];
    
    // Fixed left position (using the same alignment as RAHUL KONDAMGIRE)
    let leftX = width * 0.05;
    
    // Draw current word
    fill(currentItem.color);
    text(currentItem.text, leftX + currentX, baseY);
    
    // If animation is nearly complete, snap to final position
    if (abs(currentX - targetX) < 0.1) {
        currentX = targetX;
        if (isAnimating && targetX === 0) {
            isAnimating = false;
        }
    }
    
    pop();
}

function mouseWheel(event) {
    let currentTime = millis();
    
    // Prevent scroll if animation is in progress or cooldown hasn't elapsed
    if (currentTime - lastScrollTime < scrollCooldown || isAnimating) {
        return;
    }
    
    isAnimating = true;
    lastScrollTime = currentTime;
    
    // Single animation sequence
    if (event.delta > 0) { // Scroll down
        // Current word exits to left
        targetX = -width;
        
        setTimeout(() => {
            currentMarqueeIndex = (currentMarqueeIndex + 1) % marqueeTexts.length;
            // New word starts from right
            currentX = width;
            targetX = 0;
        }, animationDuration);
        
    } else { // Scroll up
        // Current word exits to right
        targetX = width;
        
        setTimeout(() => {
            currentMarqueeIndex = (currentMarqueeIndex - 1 + marqueeTexts.length) % marqueeTexts.length;
            // New word starts from left
            currentX = -width;
            targetX = 0;
        }, animationDuration);
    }
}

// Modify windowResized() to include:
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resetParticles();
    currentX = 0;
    targetX = 0;
    isAnimating = false;
}

function touchMoved(event) {
    return false;
}