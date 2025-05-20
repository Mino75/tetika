


// ----------------------------
// Service Worker Registration
// ----------------------------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
      console.log('Service Worker Registered');
    });
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.action === 'reload') {
        console.log('New version available. Reloading...');
        window.location.reload();
      }
    });
  }
  



const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const miniCanvas = document.getElementById('minimapCanvas');
const mctx = miniCanvas.getContext('2d');

// Constants
const TILE_W = 64, TILE_H = 32;
const MAP_W = 50, MAP_H = 50;

let offsetX = 0, offsetY = 0;
let viewW, viewH;
let mapPixelWidth, mapPixelHeight;
let scaleX, scaleY;
let miniViewW, miniViewH;
let headerHeight;

// Resources and time
const resources = { food:100, stone:80, gold:50, wood:200, iron:30, coal:40 };

function resize() {
  headerHeight = document.getElementById('gameHeader').offsetHeight;
  viewW = gameCanvas.width = window.innerWidth;
  viewH = gameCanvas.height = window.innerHeight - headerHeight;
  mapPixelWidth = (MAP_W + MAP_H) * TILE_W / 2;
  mapPixelHeight = (MAP_W + MAP_H) * TILE_H / 2;
  scaleX = mapPixelWidth / miniCanvas.width;
  scaleY = mapPixelHeight / miniCanvas.height;
  miniViewW = miniCanvas.width * viewW / mapPixelWidth;
  miniViewH = miniCanvas.height * viewH / mapPixelHeight;
  clampOffsets();
}
window.addEventListener('resize', resize);
resize();

// Update header
function updateHeader() {
  const time = new Date().toLocaleTimeString();
  document.getElementById('gameHeader').textContent =
    `Food 🌾: ${resources.food} -|-  Stone 🪨: ${resources.stone} -|-  Gold/Silver 🪙: ${resources.gold} -|-  Wood 🪵: ${resources.wood} -|-  Iron ⚙️: ${resources.iron} -|-  Coal ⚫: ${resources.coal}   | Time: ${time}`;
}
setInterval(updateHeader, 1000);
updateHeader();

// Generate simple map
let map = [];
for (let y = 0; y < MAP_H; y++) {
  map[y] = [];
  for (let x = 0; x < MAP_W; x++) {
    map[y][x] = `hsl(${Math.random() * 60 + 90},50%,50%)`;
  }
}

// Player
let player = { x: MAP_W/2, y: MAP_H/2, emoji: '🧍🏻‍♀️', selected: false, dest: null };

function isoToScreen(ix, iy) {
  const sx = (ix - iy) * TILE_W/2;
  const sy = (ix + iy) * TILE_H/2;
  return { sx, sy };
}

function clampOffsets() {
  const maxX = mapPixelWidth/2 - viewW/2;
  const maxY = mapPixelHeight/2 - viewH/2;
  offsetX = Math.min(maxX, Math.max(-maxX, offsetX));
  offsetY = Math.min(maxY, Math.max(-maxY, offsetY));
}

function draw() {
  ctx.clearRect(0, 0, viewW, viewH);
  // draw tiles
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      let { sx, sy } = isoToScreen(x, y);
      sx += viewW/2 - offsetX;
      sy += headerHeight - offsetY;
      if (sx < -TILE_W || sx > viewW || sy < -TILE_H || sy > viewH) continue;
      ctx.fillStyle = map[y][x];
      ctx.beginPath();
      ctx.moveTo(sx, sy + TILE_H/2);
      ctx.lineTo(sx + TILE_W/2, sy);
      ctx.lineTo(sx + TILE_W, sy + TILE_H/2);
      ctx.lineTo(sx + TILE_W/2, sy + TILE_H);
      ctx.closePath();
      ctx.fill();
    }
  }
  // draw player
  let { sx, sy } = isoToScreen(player.x, player.y);
  sx += viewW/2 - offsetX;
  sy += headerHeight - offsetY;
  ctx.font = '32px sans-serif';
  ctx.fillText(player.emoji, sx + TILE_W/4, sy + TILE_H/2);
  // draw menu
  if (player.selected) {
    const menuW = 80, menuH = 30;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(sx, sy - menuH, menuW, menuH);
    ctx.fillStyle = '#000';
    ctx.fillText('Move', sx + 10, sy - 10);
  }
  // animate move
  if (player.dest) {
    const dx = player.dest.x - player.x;
    const dy = player.dest.y - player.y;
    const dist = Math.hypot(dx, dy);
    const step = 0.05;
    if (dist > 0.1) {
      player.x += dx/dist * step;
      player.y += dy/dist * step;
    } else player.dest = null;
  }
  drawMinimap();
  requestAnimationFrame(draw);
}

function drawMinimap() {
  mctx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
  // draw map overview
  const tileWm = miniCanvas.width / MAP_W;
  const tileHm = miniCanvas.height / MAP_H;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      mctx.fillStyle = map[y][x];
      mctx.fillRect(x * tileWm, y * tileHm, tileWm, tileHm);
    }
  }
  // viewport rectangle
  const vx = miniCanvas.width/2 - offsetX * (miniCanvas.width/mapPixelWidth) - miniViewW/2;
  const vy = miniCanvas.height/2 - offsetY * (miniCanvas.height/mapPixelHeight) - miniViewH/2;
  mctx.strokeStyle = 'red';
  mctx.strokeRect(vx, vy, miniViewW, miniViewH);
  // display tile sizes
  mctx.fillStyle = '#000';
  mctx.font = '12px sans-serif';
  mctx.fillText(`TW:${TILE_W} TH:${TILE_H}`, 5, miniCanvas.height - 5);
}

gameCanvas.addEventListener('click', e => {
  const rect = gameCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left - viewW/2 + offsetX;
  const my = e.clientY - rect.top - headerHeight + offsetY;
  const ix = (my/TILE_H + mx/TILE_W) / 1;
  const iy = (my/TILE_H - mx/TILE_W) / 1;
  let { sx, sy } = isoToScreen(player.x, player.y);
  sx += viewW/2 - offsetX;
  sy += headerHeight - offsetY;
  if (e.clientX - rect.left > sx && e.clientX - rect.left < sx + 32 && e.clientY - rect.top > sy && e.clientY - rect.top < sy + 32) {
    player.selected = !player.selected;
  } else if (player.selected) {
    player.dest = { x: ix, y: iy };
    player.selected = false;
  }
});

miniCanvas.addEventListener('click', e => {
  const rect = miniCanvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  // center viewport on click
  const newVx = cx - miniViewW/2;
  const newVy = cy - miniViewH/2;
  offsetX = (miniCanvas.width/2 - newVx) * (mapPixelWidth/miniCanvas.width);
  offsetY = (miniCanvas.height/2 - newVy) * (mapPixelHeight/miniCanvas.height);
  clampOffsets();
});

window.addEventListener('keydown', e => {
  const pan = 20;
  if (e.key === 'ArrowLeft') offsetX -= pan;
  if (e.key === 'ArrowRight') offsetX += pan;
  if (e.key === 'ArrowUp') offsetY -= pan;
  if (e.key === 'ArrowDown') offsetY += pan;
  clampOffsets();
});

draw();
