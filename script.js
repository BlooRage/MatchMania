let emojis = ['🎮', '🎲', '🎸', '🎨', '🎭', '🎪', '🎯', '🎳'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let flipDelay = 1000;

let initialTimer = 0;
let currentGameMode = 'classic';
let currentDifficulty = 'easy';
let soundEnabled = false;
let vibrationEnabled = false;
let gameHasEnded = false;

let backgroundMusic = new Audio('https://example.com/background-music.mp3');
backgroundMusic.loop = true;

const gameModes = {
    classic: ['🎮', '🎲', '🎸', '🎨', '🎭', '🎪', '🎯', '🎳'],
    'time-trial': ['🎮', '🎲', '🎸', '🎨', '🎭', '🎪', '🎯', '🎳'],
    places: ['🏰', '🗽', '🗼', '🎡', '⛰️', '🌋', '🏖️', '🏟️'],
    animals: ['🐶', '🐱', '🐯', '🦁', '🐘', '🦒', '🦊', '🐼'],
    food: ['🍕', '🍔', '🌮', '🍣', '🍜', '🍖', '🍎', '🍇']
};

function initializeGame() {
    const gameContainer = document.getElementById('gameContainer');
    if (!gameContainer) return;

    gameContainer.innerHTML = '';
    cards = [...emojis, ...emojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false
        }));

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.onclick = () => flipCard(card.id);
        cardElement.style.visibility = 'hidden';
        gameContainer.appendChild(cardElement);
    });

    flippedCards = [];
    moves = 0;
    matchedPairs = 0;
    updateStats();
    startTimer();
}

function toggleDifficulty(mode) {
    const modeWrappers = document.querySelectorAll('.game-mode-wrapper');
    const difficultySections = document.querySelectorAll('.difficulty-options');

    // Check if difficulty options are already visible for the selected mode
    const selectedDifficulty = document.getElementById(`${mode}-difficulty`);
    const isDifficultyVisible = selectedDifficulty && selectedDifficulty.style.display === 'block';

    // If difficulty options are visible, hide them and show all game modes
    if (isDifficultyVisible) {
        selectedDifficulty.style.display = 'none';
        modeWrappers.forEach(wrapper => {
            wrapper.style.display = 'block';
        });
    } else {
        // Hide all difficulty options and show all game modes
        difficultySections.forEach(section => {
            section.style.display = 'none';
        });
        modeWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });

        // Show the difficulty options for the selected mode
        selectedDifficulty.style.display = 'block';
    }
}





function startGame(mode, difficulty) {
    gameHasEnded = false;
    currentGameMode = mode;
    currentDifficulty = difficulty;

    const landing = document.getElementById('landing-page');
    const game = document.getElementById('game-page');
    if (!landing || !game) return;

    landing.style.display = 'none';
    game.style.display = 'block';

    const header = document.querySelector('#game-page h1');
    const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
    const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    if (header) {
        header.textContent = `${modeName} Mode - ${difficultyName}`;
        header.classList.add('game-title');
    }

    emojis = [...gameModes[mode]];

    switch (difficulty) {
        case 'easy':
            emojis = emojis.slice(0, 4);
            flipDelay = 1000;
            initialTimer = 30;
            break;
        case 'medium':
            emojis = emojis.slice(0, 6);
            flipDelay = 1000;
            initialTimer = 40;
            break;
        case 'hard':
            emojis = emojis.slice(0, 8);
            flipDelay = 1000;
            initialTimer = 50;
            break;
        case 'extreme':
            emojis = emojis.slice(0, 8);
            flipDelay = 500;
            initialTimer = 60;
            break;
    }

    timer = currentGameMode === 'time-trial' ? initialTimer : 0;

    showCountdown(() => {
        // Callback already handled inside showCountdown
    });
}

function showCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    if (!overlay || !text) return;

    let count = 3;
    overlay.style.display = 'flex';
    text.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            text.textContent = count;
        } else if (count === 0) {
            text.textContent = "GO!";
        } else {
            clearInterval(countdownInterval);
            setTimeout(() => {
                overlay.style.display = 'none';
                initializeGame();
                revealCards();
                if (typeof callback === 'function') callback();
            }, 500);
        }
    }, 1000);
}

function revealCards() {
    const gameContainer = document.getElementById('gameContainer');
    const allCards = gameContainer.querySelectorAll('.card');
    allCards.forEach(card => {
        card.style.visibility = 'visible';
    });
}

function backToMenu() {
    const gamePage = document.getElementById('game-page');
    const landingPage = document.getElementById('landing-page');

    if (gamePage.style.display === 'block') {
        if (gameHasEnded) {
            landingPage.style.display = 'block';
            gamePage.style.display = 'none';
            clearInterval(timerInterval);
        } else {
            const userConfirmation = confirm("Are you sure you want to end the game?");
            if (userConfirmation) {
                endGameEarly("Game Over!");
                setTimeout(() => {
                    landingPage.style.display = 'block';
                    gamePage.style.display = 'none';
                    clearInterval(timerInterval);
                }, 2000);
            } else {
                return;
            }
        }

        const modeWrappers = document.querySelectorAll('.game-mode-wrapper');
        modeWrappers.forEach(wrapper => wrapper.style.display = 'block');

        const difficultySections = document.querySelectorAll('.difficulty-options');
        difficultySections.forEach(section => section.style.display = 'none');
    } else {
        landingPage.style.display = 'block';
        gamePage.style.display = 'none';
    }
}

function flipCard(id) {
    const card = cards.find(c => c.id === id);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length === 2) return;

    card.isFlipped = true;
    flippedCards.push(card);
    updateCardDisplay(id);

    if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate(100);
    }

    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.emoji === card2.emoji;

    setTimeout(() => {
        if (isMatch) {
            card1.isMatched = true;
            card2.isMatched = true;
            matchedPairs++;

            updateCardDisplay(card1.id);
            updateCardDisplay(card2.id);

            const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
            const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
            if (card1Element && card2Element) {
                card1Element.classList.add('matched');
                card2Element.classList.add('matched');
            }

            if (matchedPairs === emojis.length) {
                endGame();
            }
        } else {
            card1.isFlipped = false;
            card2.isFlipped = false;
            updateCardDisplay(card1.id);
            updateCardDisplay(card2.id);
        }
        flippedCards = [];
    }, flipDelay);
}

function updateCardDisplay(id) {
    const card = cards.find(c => c.id === id);
    const cardElement = document.querySelector(`[data-id="${id}"]`);
    if (!card || !cardElement) return;

    cardElement.textContent = card.isFlipped ? card.emoji : '';
    cardElement.className = `card${card.isFlipped ? ' flipped' : ''}${card.isMatched ? ' matched' : ''}`;
}

function updateStats() {
    const moveDisplay = document.getElementById('moves');
    const timeDisplay = document.getElementById('time');
    if (moveDisplay) moveDisplay.textContent = moves;
    if (timeDisplay) timeDisplay.textContent = timer;
}

function startTimer() {
    clearInterval(timerInterval);

    if (currentGameMode === 'time-trial') {
        timerInterval = setInterval(() => {
            if (timer > 0) {
                timer--;
                updateStats();
            } else {
                clearInterval(timerInterval);
                endGameEarly("Time's up!");
            }
        }, 1000);
    } else {
        timerInterval = setInterval(() => {
            timer++;
            updateStats();
        }, 1000);
    }
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

function showWinMessage() {
    const existing = document.querySelector('.win-message');
    if (existing) existing.remove();

    const message = document.createElement('div');
    message.className = 'win-message';
    message.innerHTML = '🎉 Congratulations! 🎉<br>You Won!';
    document.body.appendChild(message);

    requestAnimationFrame(() => {
        message.classList.add('show');
    });

    setTimeout(() => message.remove(), 3000);
}

function endGame() {
    gameHasEnded = true;
    clearInterval(timerInterval);
    const container = document.getElementById('gameContainer');
    if (!container) return;

    container.classList.add('game-won');
    createConfetti();
    showWinMessage();

    setTimeout(() => {
        alert(`You won in ${moves} moves and ${timer} seconds!`);
        container.classList.remove('game-won');
    }, 3000);
}

function resetGame() {
    gameHasEnded = false;
    clearInterval(timerInterval);
    timer = currentGameMode === 'time-trial' ? initialTimer : 0;
    moves = 0;
    matchedPairs = 0;

    // Show the game page again if needed
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-page').classList.remove('hidden');

    // Clear any win or game over messages
    document.querySelectorAll('.win-message').forEach(msg => msg.remove());

    // Run countdown, then initialize and reveal cards
    showCountdown(() => {
        initializeGame();
        revealCards();   // briefly show cards before starting
        startTimer();
    });
}


function endGameEarly(message = "Time's up!") {
    gameHasEnded = true;
    clearInterval(timerInterval);
    const winMessage = document.createElement('div');
    winMessage.className = 'win-message';
    winMessage.innerHTML = `${message}<br>Game Over!`;
    document.body.appendChild(winMessage);

    requestAnimationFrame(() => {
        winMessage.classList.add('show');
    });

    const gameContainer = document.getElementById('gameContainer');
    const allCards = gameContainer.querySelectorAll('.card');
    allCards.forEach(card => card.style.pointerEvents = 'none');

    setTimeout(() => {
        winMessage.remove();
    }, 2000);
}

// Toggle switches
document.getElementById('soundToggle')?.addEventListener('change', function (e) {
    soundEnabled = e.target.checked;
    if (soundEnabled) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
});

document.getElementById('vibrationToggle')?.addEventListener('change', function (e) {
    vibrationEnabled = e.target.checked;
});
