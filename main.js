const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: false });
   class Segment {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = 0;
    }

    follow(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        this.x = targetX - Math.cos(this.angle) * this.length;
        this.y = targetY - Math.sin(this.angle) * this.length;
    }
}

const numSegments = 60; 
const segmentLength = 8; 
const segments = [];

for (let i = 0; i < numSegments; i++) {
    segments.push(new Segment(width / 2, height / 2, segmentLength));
}
function animate() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.4)'; 
    ctx.fillRect(0, 0, width, height);

    target.x += (mouse.x - target.x) * 0.1;
    target.y += (mouse.y - target.y) * 0.1;

    segments[0].follow(target.x, target.y);
    for (let i = 1; i < numSegments; i++) {
        segments[i].follow(segments[i - 1].x, segments[i - 1].y);
    }

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < numSegments; i++) {
        if (i % 3 !== 0 || i === 0 || i > numSegments - 5) continue;

        const sizeMultiplier = Math.sin((i / numSegments) * Math.PI);
        const legLength = 25 * sizeMultiplier + 5;
        const thickness = 4 * sizeMultiplier + 1;

        const nx = Math.cos(segments[i].angle + Math.PI / 2);
        const ny = Math.sin(segments[i].angle + Math.PI / 2);

        const sweepX = Math.cos(segments[i].angle + Math.PI) * 5;
        const sweepY = Math.sin(segments[i].angle + Math.PI) * 5;

        const leftX = segments[i].x + nx * legLength + sweepX;
        const leftY = segments[i].y + ny * legLength + sweepY;
        const rightX = segments[i].x - nx * legLength + sweepX;
        const rightY = segments[i].y - ny * legLength + sweepY;

        ctx.strokeStyle = `rgba(200, 220, 255, ${1 - (i / numSegments)})`; 
        ctx.lineWidth = thickness;

        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(segments[i].x, segments[i].y);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();
    }

    for (let i = 0; i < numSegments; i++) {
        const radius = Math.sin((1 - (i / numSegments)) * Math.PI) * 7 + 2;
        ctx.beginPath();
        ctx.arc(segments[i].x, segments[i].y, radius, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#ffffff' : `rgba(220, 230, 255, ${1 - (i/numSegments)})`;
        ctx.fill();
    }

    const head = segments[0];
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);
    
    ctx.beginPath();
    ctx.ellipse(5, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(8, -3.5, 2, 0, Math.PI * 2); 
    ctx.arc(8, 3.5, 2, 0, Math.PI * 2);  
    ctx.fill();
    
    ctx.restore();

    requestAnimationFrame(animate);
}

animate();
      
