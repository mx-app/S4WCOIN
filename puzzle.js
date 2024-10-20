// تحميل الأحجية من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json');
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles.slice(0, 3); // اختيار 3 أحجيات يومية فقط
    } catch (error) {
        console.error(error);
        showNotification(puzzleNotification, 'Error loading puzzle. Please try again later.');
    }
}

// الحصول على أحجية اليوم
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // افتراضًا نختار أول أحجية
}

// تعريف عناصر DOM
const puzzlecloseModal = document.getElementById('puzzlecloseModal');
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');
const remainingAttemptsDisplay = document.createElement('div');
remainingAttemptsDisplay.id = 'remainingAttempts';
document.querySelector('.puzzle-content').appendChild(remainingAttemptsDisplay);

// حالة اللعبة
let currentPuzzle;
let attempts = 0;
let puzzleSolved = false;
let countdownInterval;
const maxAttempts = 3;
const penaltyAmount = 500; // العقوبة عند الإجابة الخاطئة

// تحميل الأحجية وعرضها
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles();
    currentPuzzle = getTodaysPuzzle(puzzles);

    // التحقق مما إذا كان المستخدم قد حل هذه الأحجية من قبل
    const puzzleProgress = gameState.puzzlesprogress?.find(p => p.puzzle_id === currentPuzzle.id);
    puzzleSolved = puzzleProgress?.solved || false;

    if (puzzleSolved) {
        showNotification(puzzleNotification, 'You have already solved today\'s puzzle.');
        return;
    }

    // عرض السؤال والتلميح
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;

    // عرض الخيارات كأزرار
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden');
    closePuzzleBtn.classList.add('hidden');
    updateRemainingAttempts();
    startCountdown();
}

// دالة المؤقت
function startCountdown() {
    let timeLeft = 60.00;
    timerDisplay.innerText = timeLeft.toFixed(2);

    countdownInterval = setInterval(() => {
        timeLeft -= 0.01;
        timerDisplay.innerText = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            handlePuzzleTimeout();
        }
    }, 10);
}

// التعامل مع انتهاء الوقت
function handlePuzzleTimeout() {
    clearInterval(countdownInterval);
    showNotification(puzzleNotification, "Time's up! You failed to solve the puzzle.");
    updateBalance(-penaltyAmount); // خصم العملات
    updatePuzzleProgressInGameState(currentPuzzle.id, false, maxAttempts); // تحديث حالة الأحجية
    closePuzzle();
}

// التحقق من إجابة المستخدم
function checkPuzzleAnswer(selectedOption) {
    if (puzzleSolved || attempts >= maxAttempts) {
        showNotification(puzzleNotification, puzzleSolved ? 'You have already solved this puzzle.' : 'You have failed. Please try again later.');
        return;
    }

    const userAnswer = selectedOption.innerText.trim();

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess();
    } else {
        handlePuzzleWrongAnswer();
    }
}

// التعامل مع الإجابة الصحيحة
function handlePuzzleSuccess() {
    clearInterval(countdownInterval);
    puzzleSolved = true;
    const puzzleReward = currentPuzzle.reward; // مكافأة من ملف الأحجية
    showNotification(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`);
    updateBalance(puzzleReward); // إضافة المكافأة
    updatePuzzleProgressInGameState(currentPuzzle.id, true, attempts); // تحديث حالة الأحجية
    closePuzzleBtn.classList.remove('hidden');
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
}

// التعامل مع الإجابة الخاطئة
function handlePuzzleWrongAnswer() {
    attempts++;
    updateRemainingAttempts();

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval);
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount); // خصم العملات
        updatePuzzleProgressInGameState(currentPuzzle.id, false, maxAttempts); // تسجيل فشل المحاولة
        closePuzzle();
    } else {
        showNotification(puzzleNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// تحديث عرض المحاولات المتبقية
function updateRemainingAttempts() {
    remainingAttemptsDisplay.innerText = `${maxAttempts - attempts}/${maxAttempts} Attempts`;
}

// تحديث تقدم الأحجية في gameState
function updatePuzzleProgressInGameState(puzzleId, solved, attempts) {
    const puzzleIndex = gameState.puzzlesprogress?.findIndex(p => p.puzzle_id === puzzleId);
    if (puzzleIndex > -1) {
        gameState.puzzlesprogress[puzzleIndex].solved = solved;
        gameState.puzzlesprogress[puzzleIndex].attempts = attempts;
    } else {
        if (!gameState.puzzlesprogress) {
            gameState.puzzlesprogress = [];
        }
        gameState.puzzlesprogress.push({ puzzle_id: puzzleId, solved: solved, attempts: attempts });
    }
    saveGameState(); // حفظ حالة اللعبة
}

// دالة لتحديث الرصيد في gameState
function updateBalance(amount) {
    gameState.balance += amount;
    updateUI(); // تحديث واجهة المستخدم
    saveGameState(); // حفظ حالة اللعبة
}

// دالة لإغلاق الأحجية
function closePuzzle() {
    clearInterval(countdownInterval);
    puzzleContainer.classList.add('hidden');
    puzzleOptions.innerHTML = '';
    puzzleNotification.innerText = '';
    closePuzzleBtn.classList.remove('hidden');
    attempts = 0;
    puzzleSolved = false;
}

// ربط الأحداث مع الأزرار
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target);
    }
});
openPuzzleBtn.addEventListener('click', displayTodaysPuzzle);
closePuzzleBtn.addEventListener('click', closePuzzle);

document.getElementById('puzzlecloseModal').addEventListener('click', function() {
    document.getElementById('puzzleContainer').classList.add('hidden');
});
document.getElementById('openPuzzleBtn').addEventListener('click', function() {
    document.getElementById('puzzleContainer').classList.remove('hidden');
});
