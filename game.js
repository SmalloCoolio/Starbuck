/* =========================================================================
   STATE QUẢN LÝ GAME
========================================================================= */
let state = {
    name: "Manager",
    day: 1,
    money: 1000,
    reputation: 3.0, 
    level: 1,
    prices: { coffee: 3, latte: 5, frapp: 7, macchiato: 6, matcha: 8, coldbrew: 10 },
    upgrades: { marketing: 0, quality: 0 },
    costs: { rent: 20, staff: 15, cup: 1.0 },
    isDayActive: false,
    unlockedDrinks: { matcha: false, coldbrew: false },
    claimedRewards: { star4: false, star5: false }
};

const CONFIG = {
    dayDurationMS: 12000,
    events: [
        { name: "Bình thường", mult: 1.0, msg: "Một ngày bình yên." },
        { name: "Khuyến mãi", mult: 1.5, msg: "Trào lưu MXH! Khách đông." },
        { name: "Mưa lớn", mult: 0.5, msg: "Thời tiết xấu, vắng khách." }
    ]
};

let dailyStats = { revenue: 0, cupsSold: 0, cost: 0, angryCustomers: 0 };
let audioCtx = null;

/* =========================================================================
   HỆ THỐNG ÂM THANH (Sửa lỗi không nghe tiếng)
========================================================================= */
function playSound(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

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
   CÁC HÀM GIAO DIỆN & NÂNG CẤP
========================================================================= */
function initGame() {
    const nameInput = document.getElementById('player-name');
    const nameValue = nameInput.value.trim();
    if (!nameValue) {
        nameInput.classList.add('input-error');
        if (typeof playSound === "function") playSound('error');
        setTimeout(() => { nameInput.classList.remove('input-error'); }, 500);
        return;
    }
    state.name = nameValue;
    document.getElementById('login-screen').style.display = 'none';
    const gameUI = document.getElementById('game-ui');
    gameUI.style.display = 'flex';
    gameUI.style.opacity = 0;
    setTimeout(() => { gameUI.style.opacity = 1; }, 50);

    // Kích hoạt âm thanh ngay khi click nút Bắt đầu
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().then(() => {
        playSound('coin');
    });

    updateUI();
}

function updateUI() {
    // 1. Cập nhật các chỉ số cơ bản
    if (document.getElementById('ui-name')) document.getElementById('ui-name').innerText = state.name;
    if (document.getElementById('ui-money')) document.getElementById('ui-money').innerText = state.money.toFixed(2);
    if (document.getElementById('ui-rep')) document.getElementById('ui-rep').innerText = state.reputation.toFixed(1);
    if (document.getElementById('ui-day')) document.getElementById('ui-day').innerText = state.day;
    if (document.getElementById('ui-level-badge')) document.getElementById('ui-level-badge').innerText = state.level;
    if (document.getElementById('ui-level-text')) document.getElementById('ui-level-text').innerText = "Quản lý cấp " + state.level;

    // 2. Cập nhật giá đồ uống
    const items = ['coffee', 'latte', 'frapp', 'macchiato', 'matcha', 'coldbrew'];
    items.forEach(item => {
        const el = document.getElementById(`price-${item}`);
        if (el) el.innerText = `$${state.prices[item]}`;
    });

    // 3. Mở khóa giao diện đồ uống
    if (state.unlockedDrinks.matcha) {
        document.getElementById('item-matcha')?.classList.remove('sold-out');
        if (document.getElementById('tag-matcha')) document.getElementById('tag-matcha').style.display = 'none';
        if (document.getElementById('ctrl-matcha')) document.getElementById('ctrl-matcha').style.display = 'flex';
    }
    if (state.unlockedDrinks.coldbrew) {
        document.getElementById('item-coldbrew')?.classList.remove('sold-out');
        if (document.getElementById('tag-coldbrew')) document.getElementById('tag-coldbrew').style.display = 'none';
        if (document.getElementById('ctrl-coldbrew')) document.getElementById('ctrl-coldbrew').style.display = 'flex';
    }

    // 4. Cập nhật giá nâng cấp
    const mCost = Math.floor(100 * Math.pow(1.4, state.upgrades.marketing));
    const qCost = Math.floor(150 * Math.pow(1.4, state.upgrades.quality));
    if (document.getElementById('lvl-marketing')) document.getElementById('lvl-marketing').innerText = state.upgrades.marketing; 
    if (document.getElementById('btn-upg-marketing')) document.getElementById('btn-upg-marketing').innerHTML = `$${mCost} <i class="fa-solid fa-cart-shopping"></i>`;
    if (document.getElementById('lvl-quality')) document.getElementById('lvl-quality').innerText = state.upgrades.quality; 
    if (document.getElementById('btn-upg-quality')) document.getElementById('btn-upg-quality').innerHTML = `$${qCost} <i class="fa-solid fa-cart-shopping"></i>`;

    // 5. Cập nhật chi phí
    if (document.getElementById('ui-cost-rent')) document.getElementById('ui-cost-rent').innerText = `-$${state.costs.rent}`;
    if (document.getElementById('ui-cost-staff')) document.getElementById('ui-cost-staff').innerText = `-$${state.costs.staff}`;
    if (document.getElementById('ui-cost-cup')) document.getElementById('ui-cost-cup').innerText = `-$${state.costs.cup.toFixed(1)}`;

    const btnStartDay = document.getElementById('btn-start-day');
    if (btnStartDay) btnStartDay.disabled = state.isDayActive;

    // --- LOGIC LÊN CẤP & HIỆN POPUP (ĐÃ FIX LỖI TRÙNG LẶP) ---
    let oldLevel = state.level; 

    if(state.reputation >= 4.0 && state.level === 1) {
        state.level = 2;
    } else if(state.reputation >= 5.0 && state.level === 2) {
        state.level = 3;
    }

    if (state.level > oldLevel) {
        showLevelUpPopup(state.level); 
    }
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
    const baseCost = (type === 'marketing' ? 100 : 150);
    const cost = Math.floor(baseCost * Math.pow(1.4, state.upgrades[type]));
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
   VÒNG LẶP GAME & KHÁCH HÀNG
========================================================================= */
let isDayRunning = false;

function startDay() {
    if (isDayRunning || state.isDayActive) return; 
    isDayRunning = true;
    state.isDayActive = true;
    
    dailyStats = { 
        revenue: 0, 
        cupsSold: 0, 
        cost: state.costs.rent + state.costs.staff,
        angryCustomers: 0 
    };
    
    const btn = document.getElementById('btn-start-day');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-store-slash"></i> Đang bán...';
    document.getElementById('current-event').innerText = "Khách đang vào...";
    document.getElementById('current-event').style.color = "#006241"; 

    let progress = 0;
    const progressBar = document.getElementById('day-progress');
    progressBar.style.width = '0%';

    const dayInterval = setInterval(() => {
        progress += 2; 
        progressBar.style.width = progress + '%';
        if (Math.random() > 0.6) spawnCustomer();
        if (progress >= 100) {
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
    let availableItems = ['coffee', 'latte', 'frapp', 'macchiato'];
    if (state.unlockedDrinks?.matcha) availableItems.push('matcha');
    if (state.unlockedDrinks?.coldbrew) availableItems.push('coldbrew');
    
    const chosenItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const price = state.prices[chosenItem];
    
    const baseWillingness = chosenItem === 'coffee' ? 4 : 
                           (chosenItem === 'latte' ? 6 : 
                           (chosenItem === 'matcha' ? 10 : 
                           (chosenItem === 'coldbrew' ? 13 : 8))); 
                           
    const maxWillingness = baseWillingness + (state.reputation * 0.5) + (state.upgrades.quality * 2);
    
    if (price <= maxWillingness) {
        dailyStats.revenue += price;
        dailyStats.cupsSold++;
        dailyStats.cost += state.costs.cup;
        state.money += price;
        
        showFloatingText(`+$${price}`, xPos, true);
        playSound('coin');

        // CHỈNH SỬA: Hạ mốc từ 3 xuống 2 để dễ thở hơn ở giai đoạn đầu
        if (maxWillingness - price >= 2) { 
            let repBonus = 0.05; 
            if (state.reputation >= 4.5) repBonus = 0.005; 
            else if (state.reputation >= 4.0) repBonus = 0.02;  
            else if (state.reputation >= 3.0) repBonus = 0.03;  

            state.reputation = Math.min(5.0, state.reputation + repBonus);
            
            if (state.reputation >= 4.0 && !state.claimedRewards.star4) {
                state.claimedRewards.star4 = true;
                state.unlockedDrinks.matcha = true;
                state.upgrades.marketing++;
                state.upgrades.quality++;
            }
            if (state.reputation >= 5.0 && !state.claimedRewards.star5) {
                state.claimedRewards.star5 = true;
                state.unlockedDrinks.coldbrew = true;
                state.upgrades.marketing++;
                state.upgrades.quality++;
            }
        }
    } else {
        dailyStats.angryCustomers++;
        state.reputation = Math.max(1.0, state.reputation - 0.1); 
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

/* =========================================================================
   TỔNG KẾT NGÀY
========================================================================= */
function endDay() {
    isDayRunning = false;
    const btn = document.getElementById('btn-start-day');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-store"></i> Mở Cửa';
    
    document.getElementById('current-event').innerText = "Ngày mới sẵn sàng!";
    document.getElementById('current-event').style.color = "#1e3932";
    
    state.money -= dailyStats.cost;
    state.day++;
    state.isDayActive = false;
    
    const netProfit = dailyStats.revenue - dailyStats.cost;
    
    state.costs.rent += 5; 
    state.costs.staff += 2; 
    state.costs.cup = parseFloat((state.costs.cup + 0.2).toFixed(1)); 
    
    let modalHtml = `
        <div class="receipt-container">
            <div class="receipt-header">
                <i class="fa-solid fa-mug-hot"></i>
                <h3>STAR-COFFEE</h3>
                <p>--- Báo cáo Ngày ${state.day - 1} ---</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-item"><span>Số ly bán ra</span><span>${dailyStats.cupsSold}</span></div>
                <div class="receipt-item"><span>Khách chê đắt</span><span class="text-red">${dailyStats.angryCustomers}</span></div>
                <div class="receipt-divider"></div>
                <div class="receipt-item"><span>Doanh Thu</span><span class="text-green">+$${dailyStats.revenue.toFixed(2)}</span></div>
                <div class="receipt-item"><span>Chi Phí</span><span class="text-red">-$${dailyStats.cost.toFixed(2)}</span></div>
                <div class="receipt-divider"></div>
                <div class="receipt-total"><span>LỢI NHUẬN</span><span class="${netProfit >= 0 ? 'text-green' : 'text-red'}">${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}</span></div>
            </div>
            <div class="receipt-footer">
                <p style="color: #e74c3c; font-size: 11px; font-style: italic;">⚠️ Lạm phát: Ngày mai chi phí sẽ tăng lên!</p>
                <p>Số dư quỹ: $${state.money.toFixed(2)}</p>
                <div class="barcode">||| |||| || ||| || |||||</div>
                <p>Cảm ơn Quản lý ${state.name}!</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal-body').innerHTML = modalHtml;
    if(document.getElementById('modal-title')) document.getElementById('modal-title').style.display = 'none'; 
    
    const modalBtn = document.getElementById('modal-btn');
    if (state.money <= 0) {
        modalBtn.innerHTML = '<i class="fa-solid fa-skull"></i> Phá Sản - Chơi Lại';
        modalBtn.style.background = "var(--danger)";
        modalBtn.onclick = resetGame;
    } else {
        modalBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tiếp Tục Kinh Doanh';
        modalBtn.style.background = "var(--primary-green)";
        modalBtn.onclick = closeModal;
        saveGame();
    }

    document.getElementById('modal-overlay').style.display = 'flex';
    updateUI(); 
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

/* =========================================================================
   HỆ THỐNG PHỤ TRỢ
========================================================================= */
function saveGame() {
    localStorage.setItem('starCoffeeSave', JSON.stringify(state));
}

function resetGame() {
    localStorage.removeItem('starCoffeeSave');
    location.reload();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
}

function toggleProfileMenu(event) {
    event.stopPropagation(); 
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown.classList.contains('active')) {
        closeProfileMenu();
    } else {
        dropdown.style.display = 'flex';
        requestAnimationFrame(() => dropdown.classList.add('active'));
    }
}

function closeProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
        setTimeout(() => dropdown.style.display = 'none', 300); 
    }
}

window.addEventListener('click', (event) => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
        if (!event.target.closest('.user-profile-container')) closeProfileMenu();
    }
});

function toggleMenuDropdown() {
    const menuBody = document.getElementById('menu-dropdown-body');
    const icon = document.getElementById('menu-toggle-icon');
    menuBody.classList.toggle('collapsed');
    icon.style.transform = menuBody.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
}

function showLevelUpPopup(level) {
    const overlay = document.getElementById('level-up-overlay');
    const levelNum = document.getElementById('level-number-popup');
    const perksList = document.querySelector('.unlocked-perks'); 
    
    if (overlay && levelNum) {
        levelNum.innerText = level;
        if (level === 2) {
            perksList.innerHTML = `
                <div class="perk-item"><i class="fa-solid fa-circle-check"></i> <span>Mở khóa: <b>Matcha Latte</b></span></div>
                <div class="perk-item"><i class="fa-solid fa-gift"></i> <span>Thưởng: <b>+1 Marketing, +1 Chất lượng</b></span></div>
            `;
        } else if (level === 3) {
            perksList.innerHTML = `
                <div class="perk-item"><i class="fa-solid fa-circle-check"></i> <span>Mở khóa: <b>Cold Brew</b></span></div>
                <div class="perk-item"><i class="fa-solid fa-gift"></i> <span>Thưởng: <b>+1 Marketing, +1 Chất lượng</b></span></div>
            `;
        }
        overlay.style.display = 'flex';
        playSound('coin'); 
    }
}

function closeLevelUp() {
    document.getElementById('level-up-overlay').style.display = 'none';
}