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

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', e => { 
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
}, { passive: false });

// Professional Node Class for ultra-smooth tracking
class Node {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
        this.angle = 0; 
    }
}

const numNodes = 80; // High-density spine
const spacing = 5;   // Tighter gaps for a solid look
const nodes = Array.from({length: numNodes}, () => new Node(width/2, height/2));
function resolveConstraints() {
    // Cinematic easing - the skeleton glides fluidly
    target.x += (mouse.x - target.x) * 0.15;
    target.y += (mouse.y - target.y) * 0.15;

    nodes[0].x = target.x;
    nodes[0].y = target.y;

    for (let i = 1; i < numNodes; i++) {
        let dx = nodes[i - 1].x - nodes[i].x;
        let dy = nodes[i - 1].y - nodes[i].y;
        nodes[i].angle = Math.atan2(dy, dx);

        // Pull each joint precisely behind the one in front of it
        nodes[i].x = nodes[i - 1].x - Math.cos(nodes[i].angle) * spacing;
        nodes[i].y = nodes[i - 1].y - Math.sin(nodes[i].angle) * spacing;
    }
}
      function animate() {
    // Deep cinematic motion blur background
    ctx.fillStyle = 'rgba(8, 8, 12, 0.5)'; 
    ctx.fillRect(0, 0, width, height);

    resolveConstraints();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(180, 220, 255, 0.5)'; // High-end neon glow

    // 1. Draw Organic, Curved Skeleton Legs
    for (let i = 4; i < numNodes - 5; i += 3) { // Legs on every 3rd joint
        let node = nodes[i];
        let size = Math.sin((i / numNodes) * Math.PI); // Smooth tapering 
        let legLen = 40 * size + 5;

        let angleLeft = node.angle - Math.PI / 2;
        let angleRight = node.angle + Math.PI / 2;
        let sweep = Math.PI / 3.5; // Sweeps the legs backward like claws

        // LEFT LEG - Using Quadratic Curves for a professional bend
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        let cpX_L = node.x + Math.cos(angleLeft) * (legLen * 0.6); // "Knee" joint
        let cpY_L = node.y + Math.sin(angleLeft) * (legLen * 0.6);
        let endX_L = node.x + Math.cos(angleLeft - sweep) * legLen; // "Foot"
        let endY_L = node.y + Math.sin(angleLeft - sweep) * legLen;
        ctx.quadraticCurveTo(cpX_L, cpY_L, endX_L, endY_L);
        
        // RIGHT LEG
        ctx.moveTo(node.x, node.y);
        let cpX_R = node.x + Math.cos(angleRight) * (legLen * 0.6);
        let cpY_R = node.y + Math.sin(angleRight) * (legLen * 0.6);
        let endX_R = node.x + Math.cos(angleRight + sweep) * legLen;
        let endY_R = node.y + Math.sin(angleRight + sweep) * legLen;
        ctx.quadraticCurveTo(cpX_R, cpY_R, endX_R, endY_R);

        ctx.strokeStyle = `rgba(200, 230, 255, ${1 - (i / numNodes) + 0.2})`;
        ctx.lineWidth = 3.5 * size + 0.5;
        ctx.stroke();
    }

    // 2. Draw the Central Spine (Thick and glowing)
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < numNodes; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 3. Draw a Professional Geometric Skull Head
    ctx.save();
    ctx.translate(nodes[0].x, nodes[0].y);
    ctx.rotate(nodes[0].angle);
    
    // Sharp angular skull shape
    ctx.beginPath();
    ctx.moveTo(18, 0);   // Snout
    ctx.lineTo(-2, 12);  // Right jaw
    ctx.lineTo(-10, 6);  // Right back
    ctx.lineTo(-10, -6); // Left back
    ctx.lineTo(-2, -12); // Left jaw
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Aggressive glowing eye slit
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-2, 6);
    ctx.lineTo(-2, -6);
    ctx.closePath();
    ctx.fillStyle = '#080812';
    ctx.fill();
    
    ctx.restore();

    requestAnimationFrame(animate);
}

// Start the engine
animate();
      
