let 題庫 = [];        // 從 qa.json 讀進來的所有問答
let 正在打字 = false; // 動畫進行中時鎖住按鈕，避免重複觸發

// ── 首頁：把所有題目列出來 ──────────────────────────
function 建立首頁題目列表() {
  const 容器 = document.getElementById('homeQuestions');
  題庫.forEach((題, 索引) => {
    const 按鈕 = document.createElement('button');
    按鈕.className = 'q-btn';
    按鈕.textContent = 題.q;
    按鈕.addEventListener('click', () => 進入對話(索引));
    容器.appendChild(按鈕);
  });
}

// ── 對話頁下方：重建可繼續發問的題目列表 ──────────────
function 建立對話頁題目列表() {
  const 容器 = document.getElementById('chatQList');
  容器.innerHTML = '';
  題庫.forEach((題, 索引) => {
    const 按鈕 = document.createElement('button');
    按鈕.className = 'chat-q-btn';
    按鈕.textContent = 題.q;
    按鈕.addEventListener('click', () => {
      if (!正在打字) 發問(索引);
    });
    容器.appendChild(按鈕);
  });
}

// ── 切換到對話頁，並觸發第一個問題 ────────────────────
function 進入對話(索引) {
  document.getElementById('phaseHome').style.display = 'none';
  const 對話頁 = document.getElementById('phaseChat');
  對話頁.style.display = 'flex';
  document.getElementById('dot1').classList.remove('active');
  document.getElementById('dot2').classList.add('active');
  document.getElementById('messagesArea').innerHTML = '';
  建立對話頁題目列表();
  發問(索引);
}

// ── 鎖定／解鎖下方所有發問按鈕 ────────────────────────
function 設定按鈕鎖定(鎖定) {
  document.querySelectorAll('.chat-q-btn').forEach(btn => btn.disabled = 鎖定);
}

// ── 發問並依序顯示老翁、蝶生的回應 ────────────────────
function 發問(索引) {
  if (正在打字) return;
  正在打字 = true;
  設定按鈕鎖定(true);

  const 訊息區 = document.getElementById('messagesArea');
  const 題 = 題庫[索引];

  // 先顯示使用者的問題泡泡
  const 使用者列 = document.createElement('div');
  使用者列.className = 'bubble-row user';
  const 使用者泡泡 = document.createElement('div');
  使用者泡泡.className = 'bubble user';
  使用者泡泡.textContent = 題.q;
  使用者列.appendChild(使用者泡泡);
  訊息區.appendChild(使用者列);
  訊息區.scrollTop = 訊息區.scrollHeight;

  // 依序播放每一輪對話（老翁／蝶生交替）
  let 輪次 = 0;

  function 播放下一輪() {
    if (輪次 >= 題.turns.length) {
      正在打字 = false;
      設定按鈕鎖定(false);
      return;
    }

    const 當前輪 = 題.turns[輪次];
    輪次++;
    const 等待ms = 輪次 === 1 ? 200 : 350;

    setTimeout(() => {
      // 先顯示「打字中」動畫
      const 列 = document.createElement('div');
      列.className = 'bubble-row';

      const 大頭貼 = document.createElement('div');
      大頭貼.className = 'bubble-avatar ' + 當前輪.role;

      const 大頭貼圖 = document.createElement('img');
      大頭貼圖.className = 'bubble-avatar-img';
      大頭貼圖.src = 當前輪.role === 'weng' ? 'oldman-白背景.png' : 'butterfly_student-白背景.png';
      大頭貼圖.alt = 當前輪.role === 'weng' ? '翁' : '蝶';
      大頭貼.appendChild(大頭貼圖);

      const 泡泡 = document.createElement('div');
      泡泡.className = 'bubble ' + 當前輪.role;
      泡泡.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';

      列.appendChild(大頭貼);
      列.appendChild(泡泡);
      訊息區.appendChild(列);
      訊息區.scrollTop = 訊息區.scrollHeight;

      // 打字動畫結束後換成真實文字，逐字顯示
      const 打字時間 = 200 + 當前輪.text.length * 20;

      setTimeout(() => {
        泡泡.innerHTML = '';

        const 發話人標籤 = document.createElement('div');
        發話人標籤.className = 'bubble-sender';
        發話人標籤.textContent = 當前輪.role === 'weng' ? '老翁' : '蝶生';
        泡泡.appendChild(發話人標籤);

        const 文字節點 = document.createElement('span');
        泡泡.appendChild(文字節點);

        // 逐字打出文字
        let 字索引 = 0;
        const 字陣列 = 當前輪.text.split('');

        function 打一個字() {
          if (字索引 < 字陣列.length) {
            文字節點.textContent += 字陣列[字索引];
            字索引++;
            訊息區.scrollTop = 訊息區.scrollHeight;
            setTimeout(打一個字, 14);
          } else {
            setTimeout(播放下一輪, 180);
          }
        }
        打一個字();
      }, 打字時間);
    }, 等待ms);
  }

  播放下一輪();
}

// ── 返回首頁 ───────────────────────────────────────
document.getElementById('backBtn').addEventListener('click', () => {
  if (正在打字) return; // 打字中不允許返回
  document.getElementById('phaseChat').style.display = 'none';
  document.getElementById('phaseHome').style.display = 'flex';
  document.getElementById('dot2').classList.remove('active');
  document.getElementById('dot1').classList.add('active');
});

// ── 啟動：載入 qa.json 並建立首頁列表 ─────────────────
async function 載入題庫() {
  try {
    const 回應 = await fetch('qa.json');
    if (!回應.ok) throw new Error('無法讀取 qa.json');
    題庫 = await 回應.json();
  } catch (錯誤) {
    console.error('題庫載入失敗，顯示空列表', 錯誤);
    題庫 = [];
  }
  建立首頁題目列表();
}

載入題庫();
