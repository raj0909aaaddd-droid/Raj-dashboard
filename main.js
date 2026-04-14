const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
// Start the target in the center of the screen
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Track mouse and finger movements
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: false });

// This class represents a single bone in the spine
class Segment {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = 0;
    }

    // Inverse Kinematics math: force the segment to follow a target
    follow(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        this.x = targetX - Math.cos(this.angle) * this.length;
        this.y = targetY - Math.sin(this.angle) * this.length;
    }
}

// Setup the creature's body
const numSegments = 45; // How long the creature is
const segmentLength = 12; // Distance between joints
const segments = [];

// Create the spine
for (let i = 0; i < numSegments; i++) {
    segments.push(new Segment(width / 2, height / 2, segmentLength));
}

// The main loop that runs every frame
function animate() {
    // Clear the screen with a solid background color
    ctx.fillStyle = '#0d0d1a'; 
    ctx.fillRect(0, 0, width, height);

    // 1. Math Update: The head follows the mouse, every other bone follows the bone in front of it
    segments[0].follow(mouse.x, mouse.y);
    for (let i = 1; i < numSegments; i++) {
        segments[i].follow(segments[i - 1].x, segments[i - 1].y);
    }

    // 2. Drawing Phase
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw the main spine connecting all segments
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < numSegments; i++) {
        ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();

    // Draw the Ribs / Skeleton Legs
    // We step by 4 so it doesn't look too crowded, creating distinct legs
    for (let i = 0; i < numSegments; i += 4) {
        if (i === 0 || i > numSegments - 5) continue; // Skip the head and the very tip of the tail

        // Calculate the perpendicular angle to make ribs stick out sideways
        const nx = Math.cos(segments[i].angle + Math.PI / 2);
        const ny = Math.sin(segments[i].angle + Math.PI / 2);

        // Legs get shorter as they get closer to the tail
        const legLength = (numSegments - i) * 0.6 + 8;

        const leftX = segments[i].x + nx * legLength;
        const leftY = segments[i].y + ny * legLength;
        const rightX = segments[i].x - nx * legLength;
        const rightY = segments[i].y - ny * legLength;

        // Draw the rib line
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();

        // Draw the joint/feet dots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(leftX, leftY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightX, rightY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw the Head
    ctx.beginPath();
    ctx.arc(segments[0].x, segments[0].y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    requestAnimationFrame(animate);
}

// Start the animation
animate();
                        
