// ============ DATABASE (LocalStorage) ============
const DB = {
    defaultData: {
        balance: 1000,
        stats: {
            wagered: 0,
            won: 0,
            lost: 0,
            games: 0,
            wins: 0,
            biggestWin: 0
        }
    },

    load() {
        const data = localStorage.getItem('royalCasinoV5');
        if (data) {
            return JSON.parse(data);
        }
        return { ...this.defaultData };
    },

    save(data) {
        localStorage.setItem('royalCasinoV5', JSON.stringify(data));
    },

    getBalance() {
        return this.load().balance;
    },

    setBalance(amount) {
        const data = this.load();
        data.balance = Math.max(0, Math.round(amount));
        this.save(data);
        updateBalanceDisplay();
    },

    addBalance(amount) {
        this.setBalance(this.getBalance() + amount);
    },

    getStats() {
        return this.load().stats;
    },

    updateStats(wagered, won, isWin) {
        const data = this.load();
        data.stats.wagered += wagered;
        data.stats.games += 1;
        if (isWin) {
            data.stats.won += won;
            data.stats.wins += 1;
            if (won > data.stats.biggestWin) {
                data.stats.biggestWin = won;
            }
        } else {
            data.stats.lost += wagered;
        }
        this.save(data);
    },

    reset() {
        localStorage.removeItem('royalCasinoV5');
        location.reload();
    }
};

// ============ UI HELPERS ============
function updateBalanceDisplay() {
    document.getElementById('balance').textContent = DB.getBalance().toLocaleString();
}

function updateStats() {
    const stats = DB.getStats();
    document.getElementById('statWagered').textContent = '$' + stats.wagered.toLocaleString();
    document.getElementById('statWon').textContent = '$' + stats.won.toLocaleString();
    document.getElementById('statLost').textContent = '$' + stats.lost.toLocaleString();
    
    const profit = stats.won - stats.lost;
    const profitEl = document.getElementById('statProfit');
    profitEl.textContent = (profit >= 0 ? '+$' : '-$') + Math.abs(profit).toLocaleString();
    profitEl.className = 'stat-value ' + (profit >= 0 ? 'positive' : 'negative');
    
    document.getElementById('statGames').textContent = stats.games;
    document.getElementById('statWinRate').textContent = stats.games > 0 ? 
        Math.round((stats.wins / stats.games) * 100) + '%' : '0%';
    document.getElementById('statBigWin').textContent = '$' + stats.biggestWin.toLocaleString();
}

function toggleStats() {
    const modal = document.getElementById('statsModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        updateStats();
    }
}

function resetStats() {
    if (confirm('Are you sure? This will reset your balance and all statistics.')) {
        DB.reset();
    }
}

function showWinAnimation() {
    const overlay = document.getElementById('winOverlay');
    overlay.innerHTML = '';
    overlay.classList.add('active');
    
    const colors = ['#f4c430', '#39ff14', '#00fff7', '#bf00ff', '#ff3131'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animation = `confettiFall ${1 + Math.random()}s ease-out forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        overlay.appendChild(confetti);
    }
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2000);
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Quick bet setters
function setSlotsBet(amount) { 
    document.getElementById('slotsBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setDiceBet(amount) { 
    document.getElementById('diceBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setFlipBet(amount) { 
    document.getElementById('flipBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setCrashBet(amount) { 
    document.getElementById('crashBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setRouletteBet(amount) { 
    document.getElementById('rouletteBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setWheelBet(amount) { 
    document.getElementById('wheelBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}
function setPlinkoBet(amount) { 
    document.getElementById('plinkoBet').value = amount === 'max' ? DB.getBalance() : Math.min(amount, DB.getBalance()); 
}

function takeCredit() {
    const creditAmount = 500;
    DB.addBalance(creditAmount);
    showNotification(`Credit taken: $${creditAmount}`, 'info');
}

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(400px)';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ============ NAVIGATION ============
const navItems = document.querySelectorAll('.nav-item');
const gameScenes = document.querySelectorAll('.game-scene');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const gameName = item.dataset.game;
        
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        gameScenes.forEach(scene => {
            scene.classList.remove('active');
            if (scene.id === gameName) {
                scene.classList.add('active');
            }
        });

        // Auto-scroll to active nav item
        const nav = item.parentElement.parentElement;
        const itemRect = item.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        
        if (itemRect.left < navRect.left || itemRect.right > navRect.right) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
});

// ============ GAME LOGIC ============
const game = {
    // ===== SLOTS =====
    slots: {
        symbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'],
        spinning: false,

        spin() {
            if (this.spinning) return;
            
            const bet = parseInt(document.getElementById('slotsBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.spinning = true;
            DB.addBalance(-bet);

            const reels = [
                document.getElementById('reel1'),
                document.getElementById('reel2'),
                document.getElementById('reel3')
            ];

            // Remove winner class
            reels.forEach(r => r.classList.remove('winner'));

            // Start spinning
            reels.forEach(reel => reel.classList.add('spinning'));

            // Generate results
            const results = [];
            for (let i = 0; i < 3; i++) {
                results.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
            }

            // Stop reels sequentially
            reels.forEach((reel, index) => {
                setTimeout(() => {
                    reel.classList.remove('spinning');
                    reel.querySelector('.reel-symbol').textContent = results[index];
                    
                    if (index === 2) {
                        this.checkWin(results, bet);
                    }
                }, 500 + index * 300);
            });
        },

        checkWin(results, bet) {
            const statusEl = document.getElementById('slotsStatus');
            const reels = document.querySelectorAll('.reel');
            let multiplier = 0;
            let message = '';

            // Check for 777
            if (results.every(r => r === '7️⃣')) {
                multiplier = 50;
                message = '🎉 JACKPOT! 777! ';
            }
            // Check for 3 of a kind
            else if (results[0] === results[1] && results[1] === results[2]) {
                multiplier = 10;
                message = '🎉 THREE OF A KIND! ';
            }
            // Check for 2 of a kind
            else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
                multiplier = 2;
                message = '✨ Two matching! ';
            }

            if (multiplier > 0) {
                const winnings = bet * multiplier;
                DB.addBalance(winnings);
                DB.updateStats(bet, winnings, true);
                statusEl.className = 'status-message win';
                statusEl.textContent = message + `Won $${winnings.toLocaleString()}!`;
                reels.forEach(r => r.classList.add('winner'));
                if (multiplier >= 10) showWinAnimation();
            } else {
                DB.updateStats(bet, 0, false);
                statusEl.className = 'status-message lose';
                statusEl.textContent = 'No match. Try again!';
            }

            this.spinning = false;
        }
    },

    // ===== MINES =====
    mines: {
        grid: [],
        bombs: [],
        revealed: 0,
        currentBet: 0,
        bombCount: 0,
        isPlaying: false,

        start() {
            const bet = parseInt(document.getElementById('minesBet').value) || 0;
            const bombs = parseInt(document.getElementById('minesBombs').value) || 3;

            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');
            if (bombs < 3 || bombs > 24) return alert('Bombs must be 3-24');

            this.currentBet = bet;
            this.bombCount = bombs;
            this.revealed = 0;
            this.isPlaying = true;

            DB.addBalance(-bet);

            // Generate bomb positions
            this.bombs = [];
            while (this.bombs.length < bombs) {
                const pos = Math.floor(Math.random() * 25);
                if (!this.bombs.includes(pos)) this.bombs.push(pos);
            }

            // Create grid
            const gridEl = document.getElementById('minesGrid');
            gridEl.innerHTML = '';
            this.grid = [];

            for (let i = 0; i < 25; i++) {
                const tile = document.createElement('div');
                tile.className = 'mine-tile';
                tile.dataset.index = i;
                tile.onclick = () => this.reveal(i);
                gridEl.appendChild(tile);
                this.grid.push(tile);
            }

            // Update UI
            document.getElementById('minesStartBtn').style.display = 'none';
            document.getElementById('minesCashBtn').style.display = 'block';
            document.getElementById('minesStats').style.display = 'flex';
            this.updateStats();

            document.getElementById('minesStatus').className = 'status-message info';
            document.getElementById('minesStatus').textContent = 'Click tiles to reveal gems!';
        },

        reveal(index) {
            if (!this.isPlaying) return;
            const tile = this.grid[index];
            if (tile.classList.contains('revealed')) return;

            tile.classList.add('revealed');

            if (this.bombs.includes(index)) {
                // Hit bomb
                tile.classList.add('bomb');
                tile.innerHTML = '💣';
                this.gameOver(false);
            } else {
                // Found gem
                tile.classList.add('gem');
                tile.innerHTML = '💎';
                this.revealed++;
                this.updateStats();

                // Check if all gems found
                if (this.revealed === 25 - this.bombCount) {
                    this.cashout();
                }
            }
        },

        getMultiplier() {
            if (this.revealed === 0) return 1;
            const safeSpots = 25 - this.bombCount;
            
            // Base multiplier from revealed tiles
            let mult = 1;
            for (let i = 0; i < this.revealed; i++) {
                mult *= (safeSpots + this.bombCount * 0.5) / (safeSpots - i);
            }
            
            // Risk bonus: more bombs = higher multiplier
            const riskBonus = 1 + (this.bombCount / 25) * 0.5; // Up to 50% bonus with 24 bombs
            mult *= riskBonus;
            
            return Math.min(mult * 0.96, 200); // 4% house edge, max 200x
        },

        updateStats() {
            const mult = this.getMultiplier();
            const profit = Math.floor(this.currentBet * mult) - this.currentBet;
            
            document.getElementById('minesFound').textContent = this.revealed;
            document.getElementById('minesMult').textContent = mult.toFixed(2) + 'x';
            document.getElementById('minesProfit').textContent = '$' + profit.toLocaleString();
            document.getElementById('minesCashBtn').textContent = 
                `Cashout: $${Math.floor(this.currentBet * mult).toLocaleString()}`;
        },

        cashout() {
            if (!this.isPlaying || this.revealed === 0) return;
            
            const mult = this.getMultiplier();
            const winnings = Math.floor(this.currentBet * mult);
            
            DB.addBalance(winnings);
            DB.updateStats(this.currentBet, winnings, true);
            
            document.getElementById('minesStatus').className = 'status-message win';
            document.getElementById('minesStatus').textContent = 
                `Cashed out $${winnings.toLocaleString()}! (${mult.toFixed(2)}x)`;
            
            if (mult >= 3) showWinAnimation();
            this.gameOver(true);
        },

        gameOver(won) {
            this.isPlaying = false;
            
            // Reveal all bombs
            this.bombs.forEach(pos => {
                const tile = this.grid[pos];
                if (!tile.classList.contains('revealed')) {
                    tile.classList.add('revealed', 'bomb', 'disabled');
                    tile.innerHTML = '💣';
                }
            });

            // Disable all tiles
            this.grid.forEach(tile => tile.classList.add('disabled'));

            if (!won) {
                DB.updateStats(this.currentBet, 0, false);
                document.getElementById('minesStatus').className = 'status-message lose';
                document.getElementById('minesStatus').textContent = 'BOOM! You hit a bomb!';
            }

            document.getElementById('minesStartBtn').style.display = 'block';
            document.getElementById('minesCashBtn').style.display = 'none';
        }
    },

    // ===== DICE =====
    dice: {
        prediction: null,
        rolling: false,

        selectPred(pred, btn) {
            if (this.rolling) return;
            
            document.querySelectorAll('#dice .pred-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.prediction = pred;
            document.getElementById('diceBtn').disabled = false;
        },

        roll() {
            if (this.rolling || !this.prediction) return;

            const bet = parseInt(document.getElementById('diceBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.rolling = true;
            DB.addBalance(-bet);

            const display = document.getElementById('diceDisplay');
            display.classList.add('rolling');
            display.classList.remove('win', 'lose');

            // Roll animation
            let count = 0;
            const rollInterval = setInterval(() => {
                display.textContent = Math.floor(Math.random() * 100);
                count++;
                if (count > 20) {
                    clearInterval(rollInterval);
                    
                    const result = Math.floor(Math.random() * 100);
                    display.textContent = result;
                    display.classList.remove('rolling');

                    const won = (this.prediction === 'under' && result < 50) || 
                                (this.prediction === 'over' && result > 50);

                    const statusEl = document.getElementById('diceStatus');

                    if (result === 50) {
                        // Exact 50 = lose
                        DB.updateStats(bet, 0, false);
                        display.classList.add('lose');
                        statusEl.className = 'status-message lose';
                        statusEl.textContent = 'Rolled 50! House wins!';
                    } else if (won) {
                        const winnings = Math.floor(bet * 1.98);
                        DB.addBalance(winnings);
                        DB.updateStats(bet, winnings, true);
                        display.classList.add('win');
                        statusEl.className = 'status-message win';
                        statusEl.textContent = `You won $${winnings.toLocaleString()}!`;
                    } else {
                        DB.updateStats(bet, 0, false);
                        display.classList.add('lose');
                        statusEl.className = 'status-message lose';
                        statusEl.textContent = `Rolled ${result}. Better luck next time!`;
                    }

                    this.rolling = false;
                }
            }, 50);
        }
    },

    // ===== COINFLIP =====
    coinflip: {
        choice: null,
        flipping: false,

        choose(side, btn) {
            if (this.flipping) return;
            
            document.querySelectorAll('#coinflip .choice-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.choice = side;
            document.getElementById('flipBtn').disabled = false;
        },

        flip() {
            if (this.flipping || !this.choice) return;

            const bet = parseInt(document.getElementById('flipBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.flipping = true;
            DB.addBalance(-bet);

            const coin = document.getElementById('coin');
            const result = Math.random() < 0.5 ? 'heads' : 'tails';

            // Reset transform
            coin.style.transform = '';
            coin.classList.remove('flipping', 'flipping-tails');

            // Force reflow
            void coin.offsetWidth;

            // Add animation class
            coin.classList.add(result === 'heads' ? 'flipping' : 'flipping-tails');

            setTimeout(() => {
                const won = result === this.choice;
                const statusEl = document.getElementById('flipStatus');

                if (won) {
                    const winnings = Math.floor(bet * 1.98);
                    DB.addBalance(winnings);
                    DB.updateStats(bet, winnings, true);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `${result.toUpperCase()}! You won $${winnings.toLocaleString()}!`;
                } else {
                    DB.updateStats(bet, 0, false);
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = `${result.toUpperCase()}! You lost!`;
                }

                this.flipping = false;
            }, 1000);
        }
    },

    // ===== BLACKJACK =====
    blackjack: {
        deck: [],
        playerHand: [],
        dealerHand: [],
        currentBet: 0,
        isPlaying: false,

        createDeck() {
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            this.deck = [];
            
            for (const suit of suits) {
                for (const value of values) {
                    this.deck.push({ suit, value });
                }
            }
            
            // Shuffle
            for (let i = this.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
            }
        },

        getCardValue(hand) {
            let value = 0;
            let aces = 0;
            
            for (const card of hand) {
                if (card.value === 'A') {
                    aces++;
                    value += 11;
                } else if (['K', 'Q', 'J'].includes(card.value)) {
                    value += 10;
                } else {
                    value += parseInt(card.value);
                }
            }
            
            while (value > 21 && aces > 0) {
                value -= 10;
                aces--;
            }
            
            return value;
        },

        renderCard(card, hidden = false) {
            if (hidden) {
                return '<div class="bj-card hidden"></div>';
            }
            const isRed = ['♥', '♦'].includes(card.suit);
            return `<div class="bj-card ${isRed ? 'red' : 'black'}">
                <span class="card-value">${card.value}</span>
                <span class="card-suit">${card.suit}</span>
            </div>`;
        },

        updateDisplay(hideDealer = true) {
            const playerCards = document.getElementById('playerCards');
            const dealerCards = document.getElementById('dealerCards');
            
            playerCards.innerHTML = this.playerHand.map(c => this.renderCard(c)).join('');
            
            if (hideDealer && this.dealerHand.length > 1) {
                dealerCards.innerHTML = this.renderCard(this.dealerHand[0]) + 
                    this.renderCard(null, true);
                document.getElementById('dealerScore').textContent = '?';
            } else {
                dealerCards.innerHTML = this.dealerHand.map(c => this.renderCard(c)).join('');
                document.getElementById('dealerScore').textContent = this.getCardValue(this.dealerHand);
            }
            
            document.getElementById('playerScore').textContent = this.getCardValue(this.playerHand);
        },

        start() {
            const bet = parseInt(document.getElementById('bjBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.currentBet = bet;
            this.isPlaying = true;
            DB.addBalance(-bet);

            this.createDeck();
            this.playerHand = [this.deck.pop(), this.deck.pop()];
            this.dealerHand = [this.deck.pop(), this.deck.pop()];

            this.updateDisplay(true);

            document.getElementById('bjStartBtn').style.display = 'none';
            document.getElementById('bjActions').style.display = 'grid';
            document.getElementById('bjStatus').className = 'status-message info';
            document.getElementById('bjStatus').textContent = 'Hit or Stand?';

            // Check for blackjack
            if (this.getCardValue(this.playerHand) === 21) {
                this.stand();
            }
        },

        hit() {
            if (!this.isPlaying) return;
            
            this.playerHand.push(this.deck.pop());
            this.updateDisplay(true);

            const value = this.getCardValue(this.playerHand);
            if (value > 21) {
                this.endGame('bust');
            } else if (value === 21) {
                this.stand();
            }
        },

        stand() {
            if (!this.isPlaying) return;
            
            // Dealer draws to 17
            while (this.getCardValue(this.dealerHand) < 17) {
                this.dealerHand.push(this.deck.pop());
            }
            
            this.updateDisplay(false);

            const playerValue = this.getCardValue(this.playerHand);
            const dealerValue = this.getCardValue(this.dealerHand);

            if (dealerValue > 21) {
                this.endGame('dealer_bust');
            } else if (playerValue > dealerValue) {
                this.endGame('win');
            } else if (playerValue < dealerValue) {
                this.endGame('lose');
            } else {
                this.endGame('push');
            }
        },

        endGame(result) {
            this.isPlaying = false;
            this.updateDisplay(false);
            
            const statusEl = document.getElementById('bjStatus');
            let winnings = 0;

            switch (result) {
                case 'bust':
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = 'Bust! You went over 21!';
                    DB.updateStats(this.currentBet, 0, false);
                    break;
                case 'dealer_bust':
                    winnings = this.currentBet * 2;
                    DB.addBalance(winnings);
                    DB.updateStats(this.currentBet, winnings, true);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `Dealer busts! You won $${winnings.toLocaleString()}!`;
                    break;
                case 'win':
                    winnings = this.currentBet * 2;
                    DB.addBalance(winnings);
                    DB.updateStats(this.currentBet, winnings, true);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `You win $${winnings.toLocaleString()}!`;
                    break;
                case 'lose':
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = 'Dealer wins!';
                    DB.updateStats(this.currentBet, 0, false);
                    break;
                case 'push':
                    DB.addBalance(this.currentBet);
                    statusEl.className = 'status-message info';
                    statusEl.textContent = 'Push! Bet returned.';
                    break;
            }

            document.getElementById('bjStartBtn').style.display = 'block';
            document.getElementById('bjActions').style.display = 'none';
        }
    },

    // ===== ROCKET =====
    crash: {
        multiplier: 1,
        crashPoint: 0,
        currentBet: 0,
        isPlaying: false,
        interval: null,

        start() {
            const bet = parseInt(document.getElementById('crashBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.currentBet = bet;
            this.multiplier = 1;
            this.isPlaying = true;
            
            // Generate crash point (house edge)
            const r = Math.random();
            this.crashPoint = Math.max(1, 0.99 / (1 - r));
            
            DB.addBalance(-bet);

            document.getElementById('crashStartBtn').style.display = 'none';
            document.getElementById('crashCashBtn').style.display = 'block';
            document.getElementById('crashStatus').className = 'status-message info';
            document.getElementById('crashStatus').textContent = '🚀 Rocket flying! Cash out before explosion!';

            const multEl = document.getElementById('crashMult');
            const lineEl = document.getElementById('crashLine');
            multEl.classList.remove('crashed');

            this.interval = setInterval(() => {
                this.multiplier += 0.01;
                multEl.textContent = '🚀 ' + this.multiplier.toFixed(2) + 'x';
                lineEl.style.width = Math.min(this.multiplier * 30, 90) + '%';

                if (this.multiplier >= this.crashPoint) {
                    this.crash();
                }
            }, 50);
        },

        cashout() {
            if (!this.isPlaying) return;
            
            clearInterval(this.interval);
            this.isPlaying = false;

            const winnings = Math.floor(this.currentBet * this.multiplier);
            DB.addBalance(winnings);
            DB.updateStats(this.currentBet, winnings, true);

            document.getElementById('crashStatus').className = 'status-message win';
            document.getElementById('crashStatus').textContent = 
                `Cashed out at ${this.multiplier.toFixed(2)}x! Won $${winnings.toLocaleString()}!`;

            if (this.multiplier >= 2) showWinAnimation();

            document.getElementById('crashStartBtn').style.display = 'block';
            document.getElementById('crashCashBtn').style.display = 'none';
        },

        crash() {
            clearInterval(this.interval);
            this.isPlaying = false;

            const multEl = document.getElementById('crashMult');
            multEl.textContent = '💥 BOOM!';
            multEl.classList.add('crashed');

            DB.updateStats(this.currentBet, 0, false);

            document.getElementById('crashStatus').className = 'status-message lose';
            document.getElementById('crashStatus').textContent = 
                `Rocket exploded at ${this.crashPoint.toFixed(2)}x!`;

            document.getElementById('crashStartBtn').style.display = 'block';
            document.getElementById('crashCashBtn').style.display = 'none';
        }
    },

    // ===== ROULETTE =====
    roulette: {
        selectedBet: null,
        spinning: false,
        // Simplified: 18 red, 18 black, 1 green
        segments: [
            'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
            'red', 'black', 'green', 'black', 'red', 'black', 'red', 'black',
            'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
            'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
            'red', 'black', 'red', 'black', 'red'
        ],

        selectBet(bet, btn) {
            if (this.spinning) return;
            
            document.querySelectorAll('.roulette-bet-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedBet = bet;
            document.getElementById('rouletteBtn').disabled = false;
        },

        spin() {
            if (this.spinning || !this.selectedBet) return;

            const bet = parseInt(document.getElementById('rouletteBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.spinning = true;
            DB.addBalance(-bet);

            const wheel = document.getElementById('rouletteWheel');
            
            // Random result
            const resultIndex = Math.floor(Math.random() * 37);
            const result = resultIndex === 0 ? 'green' : (resultIndex % 2 === 0 ? 'black' : 'red');
            
            // Calculate rotation (5-8 full spins + result position)
            const spins = 5 + Math.random() * 3;
            const segmentAngle = 360 / 37;
            const resultAngle = resultIndex * segmentAngle;
            const totalRotation = spins * 360 + resultAngle;

            wheel.style.transform = `rotate(${totalRotation}deg)`;
            wheel.classList.add('spinning');

            document.getElementById('rouletteStatus').className = 'status-message info';
            document.getElementById('rouletteStatus').textContent = 'Spinning...';

            setTimeout(() => {
                wheel.classList.remove('spinning');
                
                const resultEl = document.getElementById('rouletteResult');
                resultEl.textContent = result === 'green' ? '0' : (result === 'red' ? 'R' : 'B');
                resultEl.style.color = result === 'green' ? 'var(--green)' : 
                                       (result === 'red' ? 'var(--red)' : '#ccc');

                const statusEl = document.getElementById('rouletteStatus');
                
                if (result === this.selectedBet) {
                    const mult = result === 'green' ? 14 : 2;
                    const winnings = bet * mult;
                    DB.addBalance(winnings);
                    DB.updateStats(bet, winnings, true);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `${result.toUpperCase()}! You won $${winnings.toLocaleString()}!`;
                    if (result === 'green') showWinAnimation();
                } else {
                    DB.updateStats(bet, 0, false);
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = `${result.toUpperCase()}! You lost!`;
                }

                this.spinning = false;
            }, 5000);
        }
    },

    // ===== WHEEL OF FORTUNE =====
    wheel: {
        spinning: false,
        segments: [
            { mult: 0, color: '#1a1a1a', label: '0x' },
            { mult: 1.5, color: '#3498db', label: '1.5x' },
            { mult: 0.5, color: '#e74c3c', label: '0.5x' },
            { mult: 2, color: '#2ecc71', label: '2x' },
            { mult: 0, color: '#1a1a1a', label: '0x' },
            { mult: 1.2, color: '#9b59b6', label: '1.2x' },
            { mult: 3, color: '#f39c12', label: '3x' },
            { mult: 0.5, color: '#e74c3c', label: '0.5x' },
            { mult: 1.5, color: '#3498db', label: '1.5x' },
            { mult: 5, color: '#f4c430', label: '5x' },
            { mult: 0, color: '#1a1a1a', label: '0x' },
            { mult: 2, color: '#2ecc71', label: '2x' },
        ],

        init() {
            this.drawWheel();
        },

        drawWheel() {
            const wheel = document.getElementById('wheelFortune');
            const svg = wheel.querySelector('svg');
            const segments = this.segments;
            const segmentAngle = 360 / segments.length;
            
            let html = '';
            segments.forEach((seg, i) => {
                const startAngle = i * segmentAngle - 90;
                const endAngle = (i + 1) * segmentAngle - 90;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 50 + 45 * Math.cos(startRad);
                const y1 = 50 + 45 * Math.sin(startRad);
                const x2 = 50 + 45 * Math.cos(endRad);
                const y2 = 50 + 45 * Math.sin(endRad);
                
                const largeArc = segmentAngle > 180 ? 1 : 0;
                
                html += `<path d="M50,50 L${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} Z" 
                         fill="${seg.color}" stroke="#333" stroke-width="0.5"/>`;
                
                // Add text
                const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                const textX = 50 + 32 * Math.cos(midAngle);
                const textY = 50 + 32 * Math.sin(midAngle);
                const textRotate = (startAngle + endAngle) / 2 + 90;
                
                html += `<text x="${textX}" y="${textY}" fill="white" font-size="5" 
                         font-family="Bebas Neue" text-anchor="middle" 
                         transform="rotate(${textRotate}, ${textX}, ${textY})">${seg.label}</text>`;
            });
            
            svg.innerHTML = html;
        },

        spin() {
            if (this.spinning) return;

            const bet = parseInt(document.getElementById('wheelBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.spinning = true;
            DB.addBalance(-bet);

            const wheel = document.getElementById('wheelFortune');
            
            // FIRST determine result, THEN calculate rotation to it
            const resultIndex = Math.floor(Math.random() * this.segments.length);
            const segment = this.segments[resultIndex];
            
            // Calculate rotation to land on the selected segment
            // Pointer is at 0 degrees (right side), segments start at -90 degrees
            const spins = 5 + Math.random() * 3;
            const segmentAngle = 360 / this.segments.length;
            
            // Calculate the angle where the segment center should be at pointer (0 degrees)
            // Each segment starts at (i * segmentAngle - 90), center is at start + segmentAngle/2
            const segmentCenterAngle = resultIndex * segmentAngle - 90 + segmentAngle / 2;
            
            // We want segmentCenterAngle to be at 0 degrees (pointer position)
            // So we need to rotate by (-segmentCenterAngle) to align it
            const targetAngle = -segmentCenterAngle + 90; // +90 to account for pointer being at right (0°)
            const totalRotation = spins * 360 + targetAngle;

            wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            wheel.style.transform = `rotate(${totalRotation}deg)`;

            document.getElementById('wheelStatus').className = 'status-message info';
            document.getElementById('wheelStatus').textContent = 'Spinning...';

            setTimeout(() => {
                const statusEl = document.getElementById('wheelStatus');
                
                if (segment.mult > 1) {
                    const winnings = Math.floor(bet * segment.mult);
                    DB.addBalance(winnings);
                    DB.updateStats(bet, winnings, true);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `${segment.label}! You won $${winnings.toLocaleString()}!`;
                    if (segment.mult >= 3) showWinAnimation();
                } else if (segment.mult > 0) {
                    const winnings = Math.floor(bet * segment.mult);
                    DB.addBalance(winnings);
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = `${segment.label}! Returned $${winnings.toLocaleString()}`;
                    DB.updateStats(bet, 0, false);
                } else {
                    DB.updateStats(bet, 0, false);
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = `${segment.label}! You lost!`;
                }

                this.spinning = false;
                
                // Reset wheel transform for next spin
                setTimeout(() => {
                    wheel.style.transition = 'none';
                    wheel.style.transform = `rotate(${totalRotation % 360}deg)`;
                }, 100);
            }, 5000);
        }
    },

    // ===== PLINKO =====
    plinko: {
        dropping: false,
        riskLevel: 'low',
        multipliers: {
            low: [0.5, 0.7, 1, 1.3, 1.5, 1.3, 1, 0.7, 0.5],
            medium: [0.3, 0.5, 1, 2, 3, 2, 1, 0.5, 0.3],
            high: [0.2, 0.3, 0.5, 2, 5, 2, 0.5, 0.3, 0.2]
        },

        init() {
            this.drawPegs();
            this.drawMultipliers();
        },

        selectRisk(risk, btn) {
            if (this.dropping) return;
            document.querySelectorAll('.plinko-risk-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.riskLevel = risk;
            this.drawMultipliers();
        },

        drawPegs() {
            const board = document.getElementById('plinkoBoard');
            const rows = 12;
            const pegSpacing = 30;
            const startX = 175;
            const startY = 30;

            // Clear existing pegs
            const existingPegs = board.querySelectorAll('.plinko-peg');
            existingPegs.forEach(peg => peg.remove());

            for (let row = 0; row < rows; row++) {
                const pegsInRow = row + 3;
                const rowWidth = (pegsInRow - 1) * pegSpacing;
                const rowStartX = startX - rowWidth / 2;

                for (let col = 0; col < pegsInRow; col++) {
                    const peg = document.createElement('div');
                    peg.className = 'plinko-peg';
                    peg.style.left = (rowStartX + col * pegSpacing) + 'px';
                    peg.style.top = (startY + row * 30) + 'px';
                    board.appendChild(peg);
                }
            }
        },

        drawMultipliers() {
            const container = document.getElementById('plinkoMultipliers');
            const mults = this.multipliers[this.riskLevel];
            
            container.innerHTML = '';
            mults.forEach(mult => {
                const slot = document.createElement('div');
                slot.className = 'plinko-mult-slot';
                if (mult >= 2) slot.classList.add('gold');
                else if (mult >= 1) slot.classList.add('green');
                else slot.classList.add('red');
                slot.textContent = mult + 'x';
                container.appendChild(slot);
            });
        },

        drop() {
            if (this.dropping) return;

            const bet = parseInt(document.getElementById('plinkoBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.dropping = true;
            DB.addBalance(-bet);

            const board = document.getElementById('plinkoBoard');
            const ball = document.createElement('div');
            ball.className = 'plinko-ball';
            ball.style.left = '168px';
            ball.style.top = '10px';
            board.appendChild(ball);

            document.getElementById('plinkoBtn').disabled = true;
            document.getElementById('plinkoStatus').className = 'status-message info';
            document.getElementById('plinkoStatus').textContent = 'Ball dropping...';

            // FIRST determine the final slot, THEN animate to it
            const rows = 12;
            const finalSlot = Math.floor(Math.random() * 9); // 0-8 slots
            
            // Generate path to reach that slot (binomial distribution)
            const path = [];
            let position = 4; // Start at middle
            for (let i = 0; i < rows; i++) {
                // Calculate direction needed to reach final slot
                const stepsRemaining = rows - i;
                const needsToMove = finalSlot - position;
                
                let goRight;
                if (position <= 0) {
                    goRight = true; // Must go right
                } else if (position >= 8) {
                    goRight = false; // Must go left
                } else if (needsToMove > stepsRemaining) {
                    goRight = true; // Need to go right more
                } else if (needsToMove < -stepsRemaining) {
                    goRight = false; // Need to go left more
                } else {
                    // Add randomness but bias towards target
                    const rightProbability = 0.5 + (needsToMove / stepsRemaining) * 0.3;
                    goRight = Math.random() < rightProbability;
                }
                
                if (goRight) {
                    position = Math.min(8, position + 1);
                } else {
                    position = Math.max(0, position - 1);
                }
                path.push(position);
            }

            // Animate ball following the path
            let currentRow = 0;
            let x = 168;
            let y = 10;
            let slot = 4;

            const dropInterval = setInterval(() => {
                if (currentRow >= rows) {
                    clearInterval(dropInterval);
                    
                    // Highlight winning slot
                    const slots = document.querySelectorAll('.plinko-mult-slot');
                    slots[finalSlot].classList.add('active');

                    const multiplier = this.multipliers[this.riskLevel][finalSlot];
                    const winnings = Math.floor(bet * multiplier);
                    
                    const statusEl = document.getElementById('plinkoStatus');
                    
                    if (multiplier >= 1) {
                        DB.addBalance(winnings);
                        DB.updateStats(bet, winnings, true);
                        statusEl.className = 'status-message win';
                        statusEl.textContent = `${multiplier}x! You won $${winnings.toLocaleString()}!`;
                        if (multiplier >= 3) showWinAnimation();
                    } else {
                        const returned = winnings;
                        DB.addBalance(returned);
                        DB.updateStats(bet, 0, false);
                        statusEl.className = 'status-message lose';
                        statusEl.textContent = `${multiplier}x! Lost $${(bet - returned).toLocaleString()}`;
                    }

                    setTimeout(() => {
                        ball.remove();
                        slots[finalSlot].classList.remove('active');
                        this.dropping = false;
                        document.getElementById('plinkoBtn').disabled = false;
                    }, 2000);
                    return;
                }

                // Follow the predetermined path
                const newSlot = path[currentRow];
                const deltaX = (newSlot - slot) * 15;
                x += deltaX;
                slot = newSlot;
                
                y += 30;
                currentRow++;

                ball.style.left = x + 'px';
                ball.style.top = y + 'px';
            }, 150);
        }
    },

    // ===== LADDER =====
    ladder: {
        playing: false,
        currentRow: 0,
        bet: 0,
        multiplier: 1,
        totalRows: 8,
        board: [],

        init() {
            this.drawBoard();
        },

        drawBoard() {
            const boardEl = document.getElementById('ladderBoard');
            boardEl.innerHTML = '';

            for (let row = this.totalRows - 1; row >= 0; row--) {
                const rowEl = document.createElement('div');
                rowEl.className = 'ladder-row';
                rowEl.dataset.row = row;

                const tilesPerRow = 3;
                for (let col = 0; col < tilesPerRow; col++) {
                    const tile = document.createElement('div');
                    tile.className = 'ladder-tile disabled';
                    tile.innerHTML = '?';
                    tile.onclick = () => this.selectTile(row, col, tile);
                    rowEl.appendChild(tile);
                }

                boardEl.appendChild(rowEl);
            }
        },

        start() {
            const bet = parseInt(document.getElementById('ladderBet').value) || 0;
            if (bet < 10) return alert('Minimum bet is $10');
            if (bet > DB.getBalance()) return alert('Insufficient balance');

            this.playing = true;
            this.currentRow = 0;
            this.bet = bet;
            this.multiplier = 1;
            this.board = [];

            DB.addBalance(-bet);

            // Generate board
            for (let row = 0; row < this.totalRows; row++) {
                const winTile = Math.floor(Math.random() * 3);
                this.board[row] = { winTile };
            }

            this.drawBoard();
            this.updateInfo();
            this.enableRow(0);

            document.getElementById('ladderStartBtn').style.display = 'none';
            document.getElementById('ladderCashBtn').style.display = 'block';
            this.updateCashoutButton();

            document.getElementById('ladderStatus').className = 'status-message info';
            document.getElementById('ladderStatus').textContent = 'Choose a tile to climb!';
        },

        selectTile(row, col, tile) {
            if (!this.playing || row !== this.currentRow) return;
            if (tile.classList.contains('revealed')) return;

            const isWin = col === this.board[row].winTile;
            
            // Reveal all tiles in row
            const rowEl = tile.parentElement;
            const tiles = rowEl.querySelectorAll('.ladder-tile');
            tiles.forEach((t, idx) => {
                t.classList.add('revealed');
                t.classList.remove('active');
                if (idx === this.board[row].winTile) {
                    t.classList.add('win');
                    t.innerHTML = '⬆️';
                } else {
                    t.classList.add('lose');
                    t.innerHTML = '💀';
                }
                t.onclick = null;
            });

            if (isWin) {
                this.currentRow++;
                this.multiplier *= 1.5;
                this.updateInfo();
                this.updateCashoutButton();

                if (this.currentRow >= this.totalRows) {
                    // Won all rows
                    setTimeout(() => this.win(), 500);
                } else {
                    // Continue to next row
                    setTimeout(() => this.enableRow(this.currentRow), 500);
                    document.getElementById('ladderStatus').className = 'status-message win';
                    document.getElementById('ladderStatus').textContent = `Correct! Multiplier: ${this.multiplier.toFixed(2)}x`;
                }
            } else {
                // Lost
                setTimeout(() => this.lose(), 500);
            }
        },

        enableRow(row) {
            const rows = document.querySelectorAll('.ladder-row');
            const rowEl = rows[this.totalRows - 1 - row];
            const tiles = rowEl.querySelectorAll('.ladder-tile');
            tiles.forEach(tile => {
                tile.classList.remove('disabled');
                tile.classList.add('active');
            });
        },

        updateInfo() {
            document.getElementById('ladderRow').textContent = this.currentRow;
            document.getElementById('ladderMult').textContent = this.multiplier.toFixed(2) + 'x';
            const profit = Math.floor(this.bet * this.multiplier);
            document.getElementById('ladderProfit').textContent = '$' + profit.toLocaleString();
        },

        updateCashoutButton() {
            const btn = document.getElementById('ladderCashBtn');
            const amount = Math.floor(this.bet * this.multiplier);
            btn.textContent = `Cashout: $${amount.toLocaleString()}`;
        },

        cashout() {
            if (!this.playing || this.currentRow === 0) return;

            const winnings = Math.floor(this.bet * this.multiplier);
            DB.addBalance(winnings);
            DB.updateStats(this.bet, winnings, true);

            const statusEl = document.getElementById('ladderStatus');
            statusEl.className = 'status-message win';
            statusEl.textContent = `Cashed out at ${this.multiplier.toFixed(2)}x! Won $${winnings.toLocaleString()}!`;

            if (this.multiplier >= 3) showWinAnimation();

            this.reset();
        },

        win() {
            const winnings = Math.floor(this.bet * this.multiplier);
            DB.addBalance(winnings);
            DB.updateStats(this.bet, winnings, true);

            const statusEl = document.getElementById('ladderStatus');
            statusEl.className = 'status-message win';
            statusEl.textContent = `Reached the top! Won $${winnings.toLocaleString()} at ${this.multiplier.toFixed(2)}x!`;

            showWinAnimation();
            this.reset();
        },

        lose() {
            DB.updateStats(this.bet, 0, false);

            const statusEl = document.getElementById('ladderStatus');
            statusEl.className = 'status-message lose';
            statusEl.textContent = `Wrong choice! You lost $${this.bet.toLocaleString()}`;

            this.reset();
        },

        reset() {
            this.playing = false;
            this.currentRow = 0;
            this.multiplier = 1;
            
            document.getElementById('ladderStartBtn').style.display = 'block';
            document.getElementById('ladderCashBtn').style.display = 'none';
            
            setTimeout(() => this.drawBoard(), 2000);
        }
    },

    // ===== CASES =====
    cases: {
        opening: false,
        availableCases: [
            { id: 1, name: 'Bronze Case', icon: '📦', price: 50, skins: [
                { name: 'Basic Knife', rarity: 'common', value: 20, icon: '🔪' },
                { name: 'Simple Gun', rarity: 'common', value: 30, icon: '🔫' },
                { name: 'Blue Pistol', rarity: 'uncommon', value: 60, icon: '🔫' },
                { name: 'Rare Knife', rarity: 'rare', value: 120, icon: '🗡️' },
                { name: 'Golden AK', rarity: 'legendary', value: 300, icon: '💎' }
            ]},
            { id: 2, name: 'Silver Case', icon: '📦', price: 150, skins: [
                { name: 'Steel Blade', rarity: 'uncommon', value: 80, icon: '⚔️' },
                { name: 'Blue Rifle', rarity: 'uncommon', value: 100, icon: '🔫' },
                { name: 'Purple SMG', rarity: 'rare', value: 200, icon: '🔫' },
                { name: 'Dragon Knife', rarity: 'rare', value: 350, icon: '🐉' },
                { name: 'Diamond AWP', rarity: 'legendary', value: 800, icon: '💎' }
            ]},
            { id: 3, name: 'Gold Case', icon: '📦', price: 300, skins: [
                { name: 'Ruby Dagger', rarity: 'rare', value: 400, icon: '💎' },
                { name: 'Sapphire Gun', rarity: 'rare', value: 500, icon: '💎' },
                { name: 'Emerald Knife', rarity: 'legendary', value: 1000, icon: '💚' },
                { name: 'Golden Dragon', rarity: 'legendary', value: 1500, icon: '🐲' },
                { name: 'Mythic Blade', rarity: 'legendary', value: 2500, icon: '⚡' }
            ]}
        ],

        init() {
            this.loadInventory();
            this.drawCases();
        },

        drawCases() {
            const grid = document.getElementById('casesGrid');
            grid.innerHTML = '';
            
            this.availableCases.forEach(caseItem => {
                const div = document.createElement('div');
                div.className = 'case-item';
                div.innerHTML = `
                    <div class="case-icon">${caseItem.icon}</div>
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-price">$${caseItem.price}</div>
                `;
                div.onclick = () => this.openCase(caseItem);
                grid.appendChild(div);
            });
        },

        openCase(caseItem) {
            if (this.opening) return;
            if (DB.getBalance() < caseItem.price) {
                return alert('Insufficient balance!');
            }

            this.opening = true;
            DB.addBalance(-caseItem.price);

            // Determine winner
            const rand = Math.random();
            let wonSkin;
            if (rand < 0.02) {
                wonSkin = caseItem.skins[4]; // Legendary 2%
            } else if (rand < 0.10) {
                wonSkin = caseItem.skins[3]; // Rare 8%
            } else if (rand < 0.30) {
                wonSkin = caseItem.skins[2]; // Uncommon 20%
            } else if (rand < 0.60) {
                wonSkin = caseItem.skins[1]; // Common 30%
            } else {
                wonSkin = caseItem.skins[0]; // Common 40%
            }

            // Create reel with random skins
            const reel = document.getElementById('caseReel');
            const opening = document.getElementById('caseOpening');
            const grid = document.getElementById('casesGrid');
            
            opening.style.display = 'block';
            grid.style.display = 'none';
            reel.innerHTML = '';
            reel.style.transform = 'translateX(0)';

            // Generate 50 items for reel
            for (let i = 0; i < 50; i++) {
                const skin = i === 45 ? wonSkin : caseItem.skins[Math.floor(Math.random() * caseItem.skins.length)];
                const div = document.createElement('div');
                div.className = `case-skin ${skin.rarity}`;
                div.innerHTML = `
                    <div style="font-size:2rem;">${skin.icon}</div>
                    <div style="font-size:0.8rem;margin-top:5px;">${skin.name}</div>
                    <div style="color:var(--gold);font-size:0.75rem;">$${skin.value}</div>
                `;
                reel.appendChild(div);
            }

            document.getElementById('caseStatus').className = 'status-message info';
            document.getElementById('caseStatus').textContent = 'Opening...';

            // Animate
            setTimeout(() => {
                const offset = -(45 * 150) + (window.innerWidth / 2) - 70;
                reel.style.transform = `translateX(${offset}px)`;
            }, 100);

            setTimeout(() => {
                this.addToInventory(wonSkin);
                
                const statusEl = document.getElementById('caseStatus');
                statusEl.className = 'status-message win';
                statusEl.textContent = `You got ${wonSkin.name} worth $${wonSkin.value}!`;

                if (wonSkin.rarity === 'legendary') showWinAnimation();

                setTimeout(() => {
                    opening.style.display = 'none';
                    grid.style.display = 'grid';
                    this.opening = false;
                    statusEl.className = 'status-message info';
                    statusEl.textContent = 'Choose a case to open!';
                }, 3000);
            }, 5000);
        },

        loadInventory() {
            const data = DB.load();
            if (!data.inventory) {
                data.inventory = [];
                DB.save(data);
            }
            return data.inventory;
        },

        addToInventory(skin) {
            const data = DB.load();
            if (!data.inventory) data.inventory = [];
            data.inventory.push({ ...skin, id: Date.now() + Math.random() });
            DB.save(data);
            this.updateInventoryDisplay();
        },

        removeFromInventory(itemId) {
            const data = DB.load();
            data.inventory = data.inventory.filter(item => item.id !== itemId);
            DB.save(data);
            this.updateInventoryDisplay();
        },

        updateInventoryDisplay() {
            const inventory = this.loadInventory();
            const grid = document.getElementById('inventory');
            if (!grid) return;
            
            grid.innerHTML = '';
            if (inventory.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Empty inventory</div>';
                return;
            }

            inventory.forEach(item => {
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <div style="font-size:1.5rem;">${item.icon}</div>
                    <div style="font-size:0.7rem;margin-top:5px;">${item.name}</div>
                    <div style="color:var(--gold);font-size:0.65rem;">$${item.value}</div>
                `;
                div.onclick = () => {
                    if (document.getElementById('upgrade').classList.contains('active')) {
                        game.upgrade.selectItem(item);
                    }
                };
                grid.appendChild(div);
            });
        }
    },

    // ===== UPGRADE =====
    upgrade: {
        selectedItem: null,
        targetItem: null,
        upgrading: false,

        init() {
            game.cases.updateInventoryDisplay();
        },

        selectItem(item) {
            this.selectedItem = item;
            
            const fromSlot = document.getElementById('upgradeFrom');
            fromSlot.innerHTML = `
                <div style="font-size:2rem;">${item.icon}</div>
                <div style="font-size:0.9rem;">${item.name}</div>
                <div style="color:var(--gold);font-size:0.8rem;">$${item.value}</div>
            `;
            fromSlot.classList.add('filled');

            // Generate target item (worth 1.5x - 2x more)
            const targetValue = Math.floor(item.value * (1.5 + Math.random() * 0.5));
            const rarities = ['uncommon', 'rare', 'legendary'];
            const icons = ['🗡️', '⚔️', '🐉', '💎', '💚', '🐲', '⚡'];
            
            this.targetItem = {
                name: `Upgraded ${item.name}`,
                value: targetValue,
                rarity: rarities[Math.min(2, Math.floor(targetValue / 300))],
                icon: icons[Math.floor(Math.random() * icons.length)]
            };

            const toSlot = document.getElementById('upgradeTo');
            toSlot.innerHTML = `
                <div style="font-size:2rem;">${this.targetItem.icon}</div>
                <div style="font-size:0.9rem;">${this.targetItem.name}</div>
                <div style="color:var(--gold);font-size:0.8rem;">$${this.targetItem.value}</div>
            `;

            // Calculate chance (higher value items have lower chance)
            const chance = Math.max(20, Math.min(80, 100 - (targetValue / item.value - 1) * 50));
            document.getElementById('upgradeChance').innerHTML = `
                <div style="font-size:1.2rem;color:var(--cyan);">Success Chance: ${chance.toFixed(1)}%</div>
            `;

            document.getElementById('upgradeBtn').disabled = false;
            document.getElementById('upgradeStatus').className = 'status-message info';
            document.getElementById('upgradeStatus').textContent = 'Ready to upgrade!';
        },

        attempt() {
            if (this.upgrading || !this.selectedItem || !this.targetItem) return;

            this.upgrading = true;
            const chance = Math.max(20, Math.min(80, 100 - (this.targetItem.value / this.selectedItem.value - 1) * 50));
            const success = Math.random() * 100 < chance;

            document.getElementById('upgradeBtn').disabled = true;
            document.getElementById('upgradeStatus').className = 'status-message info';
            document.getElementById('upgradeStatus').textContent = 'Upgrading...';

            setTimeout(() => {
                game.cases.removeFromInventory(this.selectedItem.id);

                const statusEl = document.getElementById('upgradeStatus');
                if (success) {
                    game.cases.addToInventory(this.targetItem);
                    statusEl.className = 'status-message win';
                    statusEl.textContent = `Success! Got ${this.targetItem.name} worth $${this.targetItem.value}!`;
                    showWinAnimation();
                } else {
                    statusEl.className = 'status-message lose';
                    statusEl.textContent = `Failed! Lost ${this.selectedItem.name}`;
                }

                this.reset();
                this.upgrading = false;
            }, 2000);
        },

        reset() {
            this.selectedItem = null;
            this.targetItem = null;
            
            document.getElementById('upgradeFrom').innerHTML = `
                <div style="font-size:2rem;">📦</div>
                <div style="color:var(--text-muted);">Select Item</div>
            `;
            document.getElementById('upgradeFrom').classList.remove('filled');
            
            document.getElementById('upgradeTo').innerHTML = `
                <div style="font-size:2rem;">❓</div>
                <div style="color:var(--text-muted);">Target Item</div>
            `;
            
            document.getElementById('upgradeChance').textContent = 'Select items to see chance';
            document.getElementById('upgradeBtn').disabled = true;
        },

        selectFromInventory() {
            document.getElementById('upgradeStatus').className = 'status-message info';
            document.getElementById('upgradeStatus').textContent = 'Click an item in your inventory below';
        }
    }
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    updateBalanceDisplay();
    
    // Initialize mines grid placeholder
    const minesGrid = document.getElementById('minesGrid');
    for (let i = 0; i < 25; i++) {
        const tile = document.createElement('div');
        tile.className = 'mine-tile disabled';
        minesGrid.appendChild(tile);
    }

    // Initialize wheel
    game.wheel.init();
    
    // Initialize plinko
    game.plinko.init();
    
    // Initialize ladder
    game.ladder.init();
    
    // Initialize cases
    // game.cases.init();
    
    // Initialize upgrade
    // game.upgrade.init();

    // Show navigation scroll hint on first visit
    const nav = document.querySelector('nav');
    const navWrapper = nav.querySelector('.nav-wrapper');
    if (navWrapper.scrollWidth > nav.clientWidth) {
        nav.classList.add('show-hint');
        setTimeout(() => nav.classList.remove('show-hint'), 6000);
    }

    // Remove hint on first scroll
    nav.addEventListener('scroll', () => {
        nav.classList.remove('show-hint');
    }, { once: true });

    // Activate first game by default
    const firstNavItem = navItems[0];
    const firstGameScene = gameScenes[0];
    if (firstNavItem && firstGameScene) {
        firstNavItem.classList.add('active');
        firstGameScene.classList.add('active');
    }

    // Auto-save balance check (ensure minimum balance)
    if (DB.getBalance() <= 0) {
        DB.setBalance(1000);
        alert('Your balance was reset to $1,000!');
    }
});

// Prevent zoom on double tap
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - (window.lastTap || 0) < 300) {
        e.preventDefault();
    }
    window.lastTap = now;
}, { passive: false });
