// 3D Canvas Setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Style canvas
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0.1';

// Insert canvas at the beginning of body
document.body.insertBefore(canvas, document.body.firstChild);

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

// 3D Cube
class Cube3D {
    constructor(size = 100, x = 0, y = 0, z = 0) {
        this.size = size;
        this.x = x;
        this.y = y;
        this.z = z;
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
        this.rotX += 0.005;
        this.rotY += 0.008;
        this.rotZ += 0.003;

        this.points.forEach(point => {
            point.rotateX(this.rotX);
            point.rotateY(this.rotY);
            point.rotateZ(this.rotZ);
        });
    }

    draw() {
        const projected = this.points.map(p => p.project(300));

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.lineWidth = 2;

        // Draw cube edges
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Front
            [4, 5], [5, 6], [6, 7], [7, 4], // Back
            [0, 4], [1, 5], [2, 6], [3, 7]  // Sides
        ];

        edges.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });

        // Draw vertices
        projected.forEach(p => {
            ctx.fillStyle = 'rgba(37, 211, 102, 0.9)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// 3D Sphere
class Sphere3D {
    constructor(radius = 50, x = 0, y = 0, z = 0) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotX = 0;
        this.rotY = 0;
        this.points = this.createPoints();
    }

    createPoints() {
        const points = [];
        const latSegments = 8;
        const lonSegments = 16;

        for (let lat = 0; lat <= latSegments; lat++) {
            const theta = (lat / latSegments) * Math.PI;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon < lonSegments; lon++) {
                const phi = (lon / lonSegments) * Math.PI * 2;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = this.radius * sinTheta * cosPhi;
                const y = this.radius * cosTheta;
                const z = this.radius * sinTheta * sinPhi;

                points.push(new Point3D(x, y, z));
            }
        }

        return points;
    }

    update() {
        this.rotX += 0.003;
        this.rotY += 0.005;

        this.points.forEach(point => {
            point.rotateX(this.rotX);
            point.rotateY(this.rotY);
        });
    }

    draw() {
        const projected = this.points.map(p => p.project(300));

        ctx.fillStyle = 'rgba(37, 211, 102, 0.3)';
        ctx.strokeStyle = 'rgba(37, 211, 102, 0.6)';
        ctx.lineWidth = 1;

        projected.forEach(p => {
            const size = 2 * p.f;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }
}

// 3D Torus
class Torus3D {
    constructor(innerRadius = 30, outerRadius = 50, x = 0, y = 0, z = 0) {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.points = this.createPoints();
    }

    createPoints() {
        const points = [];
        const uSegments = 16;
        const vSegments = 16;

        for (let u = 0; u < uSegments; u++) {
            const theta = (u / uSegments) * Math.PI * 2;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            for (let v = 0; v < vSegments; v++) {
                const phi = (v / vSegments) * Math.PI * 2;
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);

                const x = (this.outerRadius + this.innerRadius * cosPhi) * cosTheta;
                const y = this.innerRadius * sinPhi;
                const z = (this.outerRadius + this.innerRadius * cosPhi) * sinTheta;

                points.push(new Point3D(x, y, z));
            }
        }

        return points;
    }

    update() {
        this.rotX += 0.002;
        this.rotY += 0.003;
        this.rotZ += 0.004;

        this.points.forEach(point => {
            point.rotateX(this.rotX);
            point.rotateY(this.rotY);
            point.rotateZ(this.rotZ);
        });
    }

    draw() {
        const projected = this.points.map(p => p.project(250));

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        ctx.lineWidth = 1;

        projected.forEach((p, i) => {
            const nextP = projected[(i + 1) % projected.length];
            if (Math.abs(p.z - nextP.z) < 50) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(nextP.x, nextP.y);
                ctx.stroke();
            }
        });
    }
}

// Initialize 3D objects
const cube = new Cube3D(80, 0, 0, 0);
const sphere = new Sphere3D(60, 200, 150, -200);
const torus = new Torus3D(30, 60, -200, -150, 0);

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cube.update();
    sphere.update();
    torus.update();

    cube.draw();
    sphere.draw();
    torus.draw();

    // Draw connecting lines
    ctx.strokeStyle = 'rgba(37, 211, 102, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const linePoints = [
        { x: canvas.width / 4, y: canvas.height / 4 },
        { x: (canvas.width * 3) / 4, y: canvas.height / 4 },
        { x: (canvas.width * 3) / 4, y: (canvas.height * 3) / 4 },
        { x: canvas.width / 4, y: (canvas.height * 3) / 4 }
    ];

    for (let i = 0; i < linePoints.length; i++) {
        const p1 = linePoints[i];
        const p2 = linePoints[(i + 1) % linePoints.length];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);

    requestAnimationFrame(animate);
}

// Start animation
animate();

console.log('🎨 3D Background Animation Loaded!');
