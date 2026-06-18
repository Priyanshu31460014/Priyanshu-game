// 3D Loading Screen Animation
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.style.cssText = `
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 9999;
  gap: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

// 3D Animation Canvas
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.cssText = `
  position: fixed;
  inset: 0;
  z-index: -1;
`;
loadingScreen.appendChild(canvas);

document.body.appendChild(loadingScreen);

// 3D Point class
class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotateX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = this.y * cos - this.z * sin;
        const z = this.y * sin + this.z * cos;
        this.y = y;
        this.z = z;
    }

    rotateY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.z * sin;
        const z = this.x * sin + this.z * cos;
        this.x = x;
        this.z = z;
    }

    rotateZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
    }

    project(scale) {
        const f = scale / (10 + this.z);
        const x = this.x * f + canvas.width / 2;
        const y = this.y * f + canvas.height / 2;
        return { x, y, z: this.z, f };
    }
}

// Cube class
class Cube3D {
    constructor(size = 80) {
        this.size = size;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.points = this.createPoints();
    }

    createPoints() {
        const s = this.size;
        return [
            new Point3D(-s, -s, -s),
            new Point3D(s, -s, -s),
            new Point3D(s, s, -s),
            new Point3D(-s, s, -s),
            new Point3D(-s, -s, s),
            new Point3D(s, -s, s),
            new Point3D(s, s, s),
            new Point3D(-s, s, s)
        ];
    }

    update() {
        this.rotX += 0.01;
        this.rotY += 0.015;
        this.rotZ += 0.005;

        this.points.forEach(point => {
            point.rotateX(this.rotX);
            point.rotateY(this.rotY);
            point.rotateZ(this.rotZ);
        });
    }

    draw(ctx) {
        const projected = this.points.map(p => p.project(300));

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        edges.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });

        projected.forEach(p => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

const ctx = canvas.getContext('2d');
const cube = new Cube3D(60);

let animationId;
const loadingText = document.createElement('div');
loadingText.style.cssText = `
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  z-index: 10000;
`;
loadingText.innerHTML = '🔄 Loading...';
loadingScreen.appendChild(loadingText);

function animate3D() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    cube.update();
    cube.draw(ctx);
    
    animationId = requestAnimationFrame(animate3D);
}

animate3D();

// Hide loading screen after 3 seconds
setTimeout(() => {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.8s ease-out';
    setTimeout(() => {
        loadingScreen.remove();
        cancelAnimationFrame(animationId);
    }, 800);
}, 3000);

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
