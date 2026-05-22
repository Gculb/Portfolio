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

  particles = Array.from({ length: Math.min(90, Math.floor(width / 16)) }, (_, i) => ({
    x: (i / Math.max(1, Math.floor(width / 16))) * width,
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
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawWave(height * 0.24, 32, "rgba(56,216,191,0.34)", 0.018, 0);
  drawWave(height * 0.48, 22, "rgba(100,168,255,0.22)", 0.014, 1.7);
  drawWave(height * 0.73, 28, "rgba(255,122,144,0.18)", 0.02, 3.4);

  for (const p of particles) {
    p.x += p.speed;
    if (p.x > width + 20) {
      p.x = -20;
      p.y = Math.random() * height;
    }
    const y = p.y + Math.sin(phase * 0.012 + p.x * 0.02) * p.amp;
    ctx.beginPath();
    ctx.arc(p.x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = p.tone;
    ctx.globalAlpha = 0.42;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  phase += 1;
  requestAnimationFrame(draw);
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();

function setRagTab(tab) {
  const target = tab.dataset.target;
  document.querySelectorAll(".rag-tab").forEach(el => {
    const active = el === tab;
    el.classList.toggle("rag-tab--active", active);
    el.setAttribute("aria-selected", active ? "true" : "false");
  });
  document.querySelectorAll(".rag-panel").forEach(panel => {
    panel.classList.toggle("rag-panel--active", panel.id === target);
  });
}

function setFlowTopic(topic, button) {
  const detail = {
    load: "Load documents from EMS protocols, trauma cases, and clinical guidelines so the model is grounded in verified procedure text.",
    chunk: "Chunk documents at section-level granularity: too small loses protocol flow, too large dilutes cosine similarity. This choice lifted MRR from ~0.64 to 0.81.",
    embed: "Embed with multilingual-e5-large 1024d for better clinical terminology coverage and stronger cosine scores than MiniLM 768d.",
    store: "Store chunk embeddings in ChromaDB for low-latency retrieval and query-time reranking.",
    intent: "Detect user intent before retrieval so the system can prioritize airway, bleeding, and cardiac action chunks.",
    search: "Perform vector search over the embedding store and return the top candidate chunks for reranking.",
    rerank: "Combine cosine similarity, critical action boost, and section priority weights to rank the most relevant chunks for prompt construction.",
    prompt: "Build a prompt with grounded context and citations, then send the selected content to the LLM for a safer response."
  };

  document.querySelectorAll(".flow-node").forEach(el => el.classList.toggle("active", el === button));
  const detailEl = document.querySelector(".flow-detail");
  if (detailEl) {
    detailEl.innerHTML = `<strong>${button.textContent}</strong> ${detail[topic] || "Tap a step to see the design decision."}`;
  }
}

document.querySelectorAll(".rag-tab").forEach(tab => tab.addEventListener("click", () => setRagTab(tab)));
document.querySelectorAll(".flow-node").forEach(node => node.addEventListener("click", () => setFlowTopic(node.dataset.topic, node)));

