/* =========================================================================
   STATE QUẢN LÝ GAME (Mô phỏng Redux/Store cơ bản)
========================================================================= */
let state = {
    name: "Barista",
    day: 1,
    money: 1000,      // TĂNG VỐN: 500 -> 1000 để chịu nhiệt những ngày đầu
    reputation: 3.5,  // TĂNG UY TÍN: Khách sẽ thoáng tính hơn một chút
    level: 1,
    prices: { coffee: 3, latte: 5, frapp: 7 },
    upgrades: { marketing: 0, quality: 0 },
    isDayActive: false
};

// Constants & Config
const CONFIG = {
    baseRent: 20,         // GIẢM MẶT BẰNG: 50 -> 20
    baseStaff: 15,        // GIẢM LƯƠNG NV: 30 -> 15 (Tổng chi phí ngày chỉ còn $35 thay vì $80)
    costPerCup: 1,
    dayDurationMS: 12000, // TĂNG THỜI GIAN: Kéo dài ngày từ 10s lên 12s để bán được nhiều hơn
    events: [
        { name: "Bình thường", mult: 1.0, msg: "Một ngày bình yên." },
        { name: "Khuyến mãi", mult: 1.5, msg: "Trào lưu MXH! Khách đông." },
        { name: "Mưa lớn", mult: 0.5, msg: "Thời tiết xấu, vắng khách." }
    ]
};

// Theo dõi chỉ số hàng ngày
let dailyStats = { revenue: 0, cupsSold: 0, cost: 0, angryCustomers: 0 };
let audioCtx = null;

/* =========================================================================
   HỆ THỐNG ÂM THANH (Web Audio API)
========================================================================= */
function playSound(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    }
}

/* =========================================================================
   CORE FUNCTIONS
========================================================================= */
function initGame() {
    const nameInput = document.getElementById('player-name').value;
    if(nameInput) state.name = nameInput;
    
    document.getElementById('login-screen').style.display = 'none';
    const gameUI = document.getElementById('game-ui');
    gameUI.style.display = 'flex';
    gameUI.style.opacity = 0;
    
    setTimeout(() => { gameUI.style.opacity = 1; }, 50);
    playSound('coin'); 
    updateUI();
}

function updateUI() {
    // Header
    document.getElementById('ui-name').innerText = state.name;
    document.getElementById('ui-money').innerText = state.money;
    document.getElementById('ui-rep').innerText = state.reputation.toFixed(1);
    document.getElementById('ui-day').innerText = state.day;
    document.getElementById('ui-level').innerText = "Level " + state.level;

    // Bảng giá
    document.getElementById('price-coffee').innerText = `$${state.prices.coffee}`;
    document.getElementById('price-latte').innerText = `$${state.prices.latte}`;
    document.getElementById('price-frapp').innerText = `$${state.prices.frapp}`;

    // Nâng cấp
    const mCost = 100 * Math.pow(2, state.upgrades.marketing);
    const qCost = 150 * Math.pow(2, state.upgrades.quality);
    document.getElementById('lvl-marketing').innerText = `Cấp: ${state.upgrades.marketing}`;
    document.getElementById('btn-upg-marketing').innerText = `Mua ($${mCost})`;
    document.getElementById('lvl-quality').innerText = `Cấp: ${state.upgrades.quality}`;
    document.getElementById('btn-upg-quality').innerText = `Mua ($${qCost})`;

    document.getElementById('btn-start-day').disabled = state.isDayActive;
    
    // Level up logic
    if(state.reputation >= 4.5 && state.level == 1) state.level = 2;
    if(state.reputation >= 5.0 && state.level == 2) state.level = 3;
}

function changePrice(item, amount) {
    if (state.isDayActive) return; 
    let newPrice = state.prices[item] + amount;
    if (newPrice > 0 && newPrice <= 20) {
        state.prices[item] = newPrice;
        updateUI();
    }
}

function buyUpgrade(type) {
    if (state.isDayActive) return;
    const cost = (type === 'marketing' ? 100 : 150) * Math.pow(2, state.upgrades[type]);
    if (state.money >= cost) {
        state.money -= cost;
        state.upgrades[type]++;
        playSound('coin');
        updateUI();
    } else {
        playSound('error');
    }
}

/* =========================================================================
   VÒNG LẶP NGÀY LÀM VIỆC (GAME LOOP)
========================================================================= */
function startDay() {
    state.isDayActive = true;
    dailyStats = { revenue: 0, cupsSold: 0, cost: CONFIG.baseRent + CONFIG.baseStaff, angryCustomers: 0 };
    updateUI();

    // Bên trong hàm startDay()
    const currentEvent = CONFIG.events[Math.floor(Math.random() * CONFIG.events.length)];
    document.getElementById('current-event').innerText = currentEvent.msg;

    // TĂNG KHÁCH LÊN: Cơ bản là 18 người (cũ là 10), mỗi lần nâng cấp +8 người
    const baseCustomers = 18 + (state.upgrades.marketing * 8); 
    const totalCustomers = Math.floor(baseCustomers * currentEvent.mult * (state.reputation / 3));

    const progressBar = document.getElementById('day-progress');
    progressBar.style.width = '0%';
    
    const startTime = Date.now();
    
    const dayInterval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let progress = (elapsed / CONFIG.dayDurationMS) * 100;
        progressBar.style.width = progress + '%';

        if (Math.random() < (totalCustomers / (CONFIG.dayDurationMS / 100))) {
            spawnCustomer();
        }

        if (elapsed >= CONFIG.dayDurationMS) {
            clearInterval(dayInterval);
            endDay();
        }
    }, 100);
}

function spawnCustomer() {
    const zone = document.getElementById('customer-zone');
    const icons = ['fa-person', 'fa-person-dress', 'fa-user-ninja', 'fa-user-astronaut'];
    
    const customerEl = document.createElement('i');
    customerEl.className = `fa-solid ${icons[Math.floor(Math.random()*icons.length)]} customer`;
    const xPos = 10 + Math.random() * 80; 
    customerEl.style.left = `${xPos}%`;
    
    zone.appendChild(customerEl);

    setTimeout(() => {
        handleCustomerPurchase(xPos);
        setTimeout(() => customerEl.remove(), 1000);
    }, 1000);
}

function handleCustomerPurchase(xPos) {
    const items = Object.keys(state.prices);
    const chosenItem = items[Math.floor(Math.random() * items.length)];
    const price = state.prices[chosenItem];
    
    const baseWillingness = chosenItem === 'coffee' ? 4 : (chosenItem === 'latte' ? 6 : 8);
    const maxWillingness = baseWillingness + (state.reputation * 0.5) + (state.upgrades.quality * 2);
    
    if (price <= maxWillingness) {
        dailyStats.revenue += price;
        dailyStats.cupsSold++;
        dailyStats.cost += CONFIG.costPerCup;
        state.money += price;
        
        showFloatingText(`+$${price}`, xPos, true);
        playSound('coin');

        if (maxWillingness - price > 2) {
            state.reputation = Math.min(5.0, state.reputation + 0.05);
        }
    } else {
        dailyStats.angryCustomers++;
        // GIẢM HÌNH PHẠT: Trừ 0.05 thay vì trừ 0.1 để tránh tụt uy tín quá nhanh
        state.reputation = Math.max(1.0, state.reputation - 0.05); 
        showFloatingText(`Quá đắt!`, xPos, false);
    }
    updateUI();
}

function showFloatingText(text, xPos, isGood) {
    const zone = document.getElementById('customer-zone');
    const floatEl = document.createElement('div');
    floatEl.className = `float-text ${isGood ? 'float-good' : 'float-bad'}`;
    floatEl.innerText = text;
    floatEl.style.left = `${xPos}%`;
    floatEl.style.bottom = '40%';
    zone.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 1500);
}

function endDay() {
    state.money -= dailyStats.cost;
    state.day++;
    state.isDayActive = false;
    
    const netProfit = dailyStats.revenue - dailyStats.cost;
    
    let modalHtml = `
        <div class="report-line"><span>Số ly bán ra:</span> <span>${dailyStats.cupsSold}</span></div>
        <div class="report-line"><span>Khách chê đắt:</span> <span style="color:var(--danger)">${dailyStats.angryCustomers}</span></div>
        <div class="report-line"><span>Tổng Doanh Thu:</span> <span style="color:#2ecc71">+$${dailyStats.revenue}</span></div>
        <div class="report-line"><span>Chi phí:</span> <span style="color:var(--danger)">-$${dailyStats.cost}</span></div>
        <div class="total-line">LỢI NHUẬN: <span style="color:${netProfit >= 0 ? '#2ecc71' : 'var(--danger)'}">$${netProfit}</span></div>
    `;
    
    document.getElementById('modal-body').innerHTML = modalHtml;
    
    if (state.money <= 0) {
        document.getElementById('modal-title').innerText = "💀 PHÁ SẢN!";
        document.getElementById('modal-title').style.color = "var(--danger)";
        document.getElementById('modal-btn').innerText = "Chơi Lại Từ Đầu";
        document.getElementById('modal-btn').onclick = resetGame;
    } else {
        document.getElementById('modal-title').innerText = "Tổng Kết Ngày " + (state.day - 1);
        document.getElementById('modal-title').style.color = "var(--primary-green)";
        document.getElementById('modal-btn').innerText = "Tiếp Tục Kinh Doanh";
        document.getElementById('modal-btn').onclick = closeModal;
        saveGame();
    }

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('current-event').innerText = "Ngày kết thúc. Hãy điều chỉnh giá!";
    updateUI();
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

/* =========================================================================
   SYSTEM: SAVE / LOAD & DARK MODE
========================================================================= */
function saveGame() {
    localStorage.setItem('starCoffeeSave', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('starCoffeeSave');
    if (saved) {
        state = JSON.parse(saved);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-ui').style.display = 'flex';
        updateUI();
    } else {
        alert("Không tìm thấy dữ liệu save!");
    }
}

function resetGame() {
    localStorage.removeItem('starCoffeeSave');
    location.reload();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
}