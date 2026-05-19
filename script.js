const canvas = document.getElementById("signal-canvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let phase = 0;
let particles = [];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  particles = Array.from({ length: Math.min(90, Math.floor(width / 16)) }, (_, index) => ({
    x: (index / Math.max(1, Math.floor(width / 16))) * width,
    y: Math.random() * height,
    speed: 0.25 + Math.random() * 0.55,
    amp: 12 + Math.random() * 34,
    tone: Math.random() > 0.68 ? "#ffbf69" : "#38d8bf"
  }));
}

function drawWave(yBase, amplitude, color, speed, offset) {
  ctx.beginPath();
  for (let x = 0; x <= width; x += 8) {
    const y =
      yBase +
      Math.sin(x * 0.012 + phase * speed + offset) * amplitude +
      Math.sin(x * 0.031 + phase * speed * 0.65) * (amplitude * 0.34);

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  drawWave(height * 0.24, 32, "rgba(56, 216, 191, 0.34)", 0.018, 0);
  drawWave(height * 0.48, 22, "rgba(100, 168, 255, 0.22)", 0.014, 1.7);
  drawWave(height * 0.73, 28, "rgba(255, 122, 144, 0.18)", 0.02, 3.4);

  for (const particle of particles) {
    particle.x += particle.speed;
    if (particle.x > width + 20) {
      particle.x = -20;
      particle.y = Math.random() * height;
    }

    const y = particle.y + Math.sin(phase * 0.012 + particle.x * 0.02) * particle.amp;
    ctx.beginPath();
    ctx.arc(particle.x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = particle.tone;
    ctx.globalAlpha = 0.42;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  phase += 1;
  requestAnimationFrame(draw);
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();
