let emojis = ['🎮', '🎲', '🎸', '🎨', '🎭', '🎪', '🎯', '🎳'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let flipDelay = 1000;

let initialTimer = 0; // Store the initial timer value based on difficulty
let currentGameMode = 'classic';
let currentDifficulty = 'easy'; // Default to easy
let soundEnabled = false;
let vibrationEnabled = false;

let backgroundMusic = new Audio('https://example.com/background-music.mp3'); // Replace with a real URL
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

    cards = [...emojis, ...emojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false
        }));

    gameContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.onclick = () => flipCard(card.id);
        gameContainer.appendChild(cardElement);
    });

    flippedCards = [];
    moves = 0;
    matchedPairs = 0;
    updateStats();
    startTimer();
}

function toggleDifficulty(mode) {
    // Loop through all game-mode wrappers
    const modeWrappers = document.querySelectorAll('.game-mode-wrapper');
    modeWrappers.forEach(wrapper => {
        // Check if this wrapper contains the clicked mode
        if (wrapper.querySelector(`#${mode}-difficulty`)) {
            wrapper.style.display = 'block'; // Keep the selected mode visible
        } else {
            wrapper.style.display = 'none'; // Hide others
        }
    });

    // Hide all difficulty sections first
    const difficultySections = document.querySelectorAll('.difficulty-options');
    difficultySections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected difficulty section
    const selectedDifficulty = document.getElementById(`${mode}-difficulty`);
    if (selectedDifficulty) {
        selectedDifficulty.style.display = 'block';
    }
}


function startGame(mode, difficulty) {
    currentGameMode = mode;
    currentDifficulty = difficulty; // Store the difficulty for later use
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
            initialTimer = 30; // Easy mode, 30 seconds countdown for time trial
            break;
        case 'medium':
            emojis = emojis.slice(0, 6);
            flipDelay = 1000;
            initialTimer = 40; // Medium mode, 40 seconds countdown for time trial
            break;
        case 'hard':
            emojis = emojis.slice(0, 8);
            flipDelay = 1000;
            initialTimer = 50; // Hard mode, 50 seconds countdown for time trial
            break;
        case 'extreme':
            emojis = emojis.slice(0, 8);
            flipDelay = 500;
            initialTimer = 60; // Extreme mode, 60 seconds countdown for time trial
            break;
    }

    timer = currentGameMode === 'time-trial' ? initialTimer : 0; // Time-trial starts from countdown, others start from 0
    initializeGame();
}

function backToMenu() {
    const gamePage = document.getElementById('game-page');
    const landingPage = document.getElementById('landing-page');

    if (gamePage.style.display === 'block') {
        const userConfirmation = confirm("Are you sure you want to end the game?");
        if (userConfirmation) {
            endGameEarly("Game Over!");

            setTimeout(() => {
                landingPage.style.display = 'block';
                gamePage.style.display = 'none';
                clearInterval(timerInterval);

                // Restore all game mode buttons
                const modeWrappers = document.querySelectorAll('.game-mode-wrapper');
                modeWrappers.forEach(wrapper => {
                    wrapper.style.display = 'block';
                });

                // Hide all difficulty buttons
                const difficultySections = document.querySelectorAll('.difficulty-options');
                difficultySections.forEach(section => {
                    section.style.display = 'none';
                });
            }, 2000);
        }
    } else {
        landingPage.style.display = 'block';
        gamePage.style.display = 'none';

        // Restore game modes and hide any difficulty options
        const modeWrappers = document.querySelectorAll('.game-mode-wrapper');
        modeWrappers.forEach(wrapper => {
            wrapper.style.display = 'block';
        });

        const difficultySections = document.querySelectorAll('.difficulty-options');
        difficultySections.forEach(section => {
            section.style.display = 'none';
        });
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
            // Mark cards as matched and apply green color
            card1.isMatched = true;
            card2.isMatched = true;
            matchedPairs++;

            // Trigger the match effect by adding the 'matched' class
            updateCardDisplay(card1.id);
            updateCardDisplay(card2.id);

            // Add the 'matched' class for animation and green color
            const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
            const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
            if (card1Element && card2Element) {
                card1Element.classList.add('matched');
                card2Element.classList.add('matched');
            }

            // Check if all pairs are matched
            if (matchedPairs === emojis.length) {
                endGame();
            }
        } else {
            // If not matched, flip the cards back
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
    if (timeDisplay) timeDisplay.textContent = timer; // Display the current time
}

function startTimer() {
    clearInterval(timerInterval);
    
    if (currentGameMode === 'time-trial') {
        // Countdown timer for Time Trial mode
        timerInterval = setInterval(() => {
            if (timer > 0) {
                timer--;
                updateStats();
            } else {
                clearInterval(timerInterval);
                endGameEarly("Time's up!"); // End game if time is up
            }
        }, 1000);
    } else {
        // Count-up timer for other modes (Classic, Animals, Food, Places)
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
    clearInterval(timerInterval); // Stop the timer
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
    // Reset all game elements
    clearInterval(timerInterval);
    timer = currentGameMode === 'time-trial' ? initialTimer : 0;  // Reset the timer based on game mode
    moves = 0;  // Reset moves count
    matchedPairs = 0;  // Reset matched pairs count
    initializeGame();  // Reinitialize the game

    // Re-enable card flips once the game is reset
    const gameContainer = document.getElementById('gameContainer');
    const allCards = gameContainer.querySelectorAll('.card');
    allCards.forEach(card => card.style.pointerEvents = 'auto');  // Enable card clicks

    // Restart the timer
    startTimer();
}

function endGameEarly(message = "Time's up!") {
    clearInterval(timerInterval);  // Stop the timer
    const winMessage = document.createElement('div');
    winMessage.className = 'win-message';
    winMessage.innerHTML = `${message}<br>Game Over!`;
    document.body.appendChild(winMessage);

    requestAnimationFrame(() => {
        winMessage.classList.add('show');
    });

    // Disable further card flips when time is up
    const gameContainer = document.getElementById('gameContainer');
    const allCards = gameContainer.querySelectorAll('.card');
    allCards.forEach(card => card.style.pointerEvents = 'none');  // Disable card clicks

    setTimeout(() => {
        // Message will disappear after 2 seconds
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
