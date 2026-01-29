const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const statusEl = document.getElementById("status");
const pullBtn = document.getElementById("pull-btn");
const pageSelect = document.getElementById("page-select");
const pageBtn = document.getElementById("page-btn");
const refreshBtn = document.getElementById("refresh-btn");

let socket;
let debounceTimer;

function setStatus(text) {
  statusEl.textContent = text;
}

async function updatePreview(markdownText) {
  const response = await fetch("/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: markdownText }),
  });
  preview.innerHTML = await response.text();
}

function connect() {
  socket = new WebSocket(`ws://${location.host}/ws`);

  socket.onopen = () => setStatus("已连接");
  socket.onclose = () => setStatus("已断开，重连中...");
  socket.onerror = () => setStatus("连接错误");

  socket.onmessage = (event) => {
    editor.value = event.data;
    updatePreview(event.data);
  };
}

function sendUpdate(value) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(value);
}

editor.addEventListener("input", (event) => {
  const value = event.target.value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    sendUpdate(value);
    updatePreview(value);
  }, 300);
});

pullBtn.addEventListener("click", async () => {
  setStatus("拉取中...");
  await fetch("/api/pull", { method: "POST" });
  setStatus("已同步");
});

pageBtn.addEventListener("click", async () => {
  const pageId = pageSelect.value;
  if (!pageId) return;
  setStatus("切换页面中...");
  const response = await fetch("/api/page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page_id: pageId }),
  });
  if (response.ok) {
    const data = await response.json();
    editor.value = data.markdown || "";
    updatePreview(editor.value);
    setStatus("页面已切换");
  } else {
    setStatus("切换失败");
  }
});

connect();

fetch("/api/markdown")
  .then((res) => res.json())
  .then((data) => {
    editor.value = data.markdown || "";
    updatePreview(editor.value);
  });

async function loadPages() {
  const res = await fetch("/api/pages");
  const data = await res.json();
  pageSelect.innerHTML = "";
  if (!data.pages || data.pages.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "未获取到页面";
    pageSelect.appendChild(option);
    return;
  }
  data.pages.forEach((page) => {
    const option = document.createElement("option");
    option.value = page.id;
    const indent = page.depth ? "\u00a0\u00a0".repeat(page.depth) : "";
    const label = page.path || page.title || "(无标题)";
    option.textContent = `${indent}${label}`;
    pageSelect.appendChild(option);
  });
}

refreshBtn.addEventListener("click", () => {
  setStatus("刷新页面列表...");
  loadPages().then(() => setStatus("页面列表已更新"));
});

loadPages();
