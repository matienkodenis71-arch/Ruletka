const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

let balance = parseInt(localStorage.getItem('rouletteBalance')) || 1000;
let currentBet = null;
let isSpinning = false;

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

function updateUI() {
    document.getElementById('balance').textContent = balance;
    localStorage.setItem('rouletteBalance', balance);
}

function placeBet(type, multiplier, event) {
    if (isSpinning) return;
    
    const amount = parseInt(document.getElementById('betAmount').value) || 10;
    
    if (amount > balance) {
        alert('Недостаточно средств!');
        return;
    }
    if (amount < 1) {
        alert('Минимальная ставка 1₽');
        return;
    }
    
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentBet = { type, multiplier, amount };
    document.getElementById('spinBtn').disabled = false;
    document.getElementById('result').textContent = `Ставка: ${type} на ${amount}₽`;
    document.getElementById('result').className = 'result';
}

function spin() {
    if (isSpinning || !currentBet) return;
    
    if (currentBet.amount > balance) {
        alert('Недостаточно средств!');
        return;
    }
    
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    
    balance -= currentBet.amount;
    updateUI();
    
    const winningNumber = Math.floor(Math.random() * 37);
    
    let winningColor;
    if (winningNumber === 0) winningColor = 'green';
    else if (RED_NUMBERS.includes(winningNumber)) winningColor = 'red';
    else winningColor = 'black';
    
    const wheel = document.getElementById('wheel');
    const spins = 5 + Math.random() * 5;
    const totalRotation = spins * 360 + Math.random() * 360;
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    
    setTimeout(() => {
        let win = false;
        let winAmount = 0;
        
        if (currentBet.type === 'red' && winningColor === 'red') {
            win = true;
            winAmount = currentBet.amount * currentBet.multiplier;
        } else if (currentBet.type === 'black' && winningColor === 'black') {
            win = true;
            winAmount = currentBet.amount * currentBet.multiplier;
        } else if (currentBet.type === 'green' && winningColor === 'green') {
            win = true;
            winAmount = currentBet.amount * currentBet.multiplier;
        }
        
        const resultEl = document.getElementById('result');
        const colorName = winningColor === 'red' ? 'КРАСНОЕ' : winningColor === 'black' ? 'ЧЁРНОЕ' : 'ЗЕРО';
        
        if (win) {
            balance += winAmount;
            resultEl.textContent = `🎉 Выпало ${winningNumber} (${colorName})! Выигрыш: ${winAmount}₽`;
            resultEl.className = 'result win';
        } else {
            resultEl.textContent = `😢 Выпало ${winningNumber} (${colorName}). Проигрыш: ${currentBet.amount}₽`;
            resultEl.className = 'result lose';
        }
        
        addToHistory(winningNumber, winningColor);
        updateUI();
        
        isSpinning = false;
        currentBet = null;
        document.getElementById('spinBtn').disabled = true;
        document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
        
        setTimeout(() => {
            wheel.style.transition = 'none';
            wheel.style.transform = `rotate(${totalRotation % 360}deg)`;
            setTimeout(() => {
                wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            }, 50);
        }, 1000);
        
        if (balance <= 0) {
            setTimeout(() => alert('Игра окончена! Обновите страницу для сброса.'), 500);
        }
    }, 4200);
}

function addToHistory(number, color) {
    const history = document.getElementById('history');
    const item = document.createElement('div');
    item.className = `history-item ${color}`;
    item.textContent = number;
    history.insertBefore(item, history.firstChild);
    if (history.children.length > 10) history.removeChild(history.lastChild);
}

updateUI();
