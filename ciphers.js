import { gameState } from './Script.js'; 

// عناصر DOM
const caesarPuzzleBtn = document.getElementById("CaesarPuzzleBtn");
const caesarPuzzleContainer = document.getElementById("CaesarPuzzleContainer");
const caesarPuzzleQuestion = document.getElementById("CaesarPuzzleQuestion");
const caesarSolutionInput = document.getElementById("CaesarSolutionInput");
const caesarSubmitBtn = document.getElementById("CaesarSubmitBtn");
const caesarRewardDisplay = document.getElementById("CaesarRewardDisplay");

// المتغيرات
let currentPuzzle = null;
let remainingAttempts = 3;
let solvedPuzzles = []; // لتخزين الـID للشيفرات المحلولة
let puzzleData = [];
const maxAttempts = 3;

// جلب شيفرات القيصر من ملف JSON
async function fetchPuzzles() {
    try {
        const response = await fetch('path/to/your/jsonfile.json');
        puzzleData = await response.json();
        loadNextPuzzle();
    } catch (error) {
        caesarPuzzleQuestion.textContent = 'Failed to load puzzles.';
        console.error(error);
    }
}

// تحميل الأحجية التالية غير المحلولة
function loadNextPuzzle() {
    const availablePuzzles = puzzleData.filter(puzzle => !solvedPuzzles.includes(puzzle.CaesarPuzzleID));
    if (availablePuzzles.length > 0) {
        currentPuzzle = availablePuzzles[0];
        displayPuzzle();
    } else {
        caesarPuzzleQuestion.textContent = 'No more puzzles available.';
    }
}

// عرض الأحجية الحالية
function displayPuzzle() {
    caesarPuzzleQuestion.textContent = currentPuzzle.puzzle;
    caesarRewardDisplay.textContent = `Reward: ${currentPuzzle.reward} coins`;
    caesarSolutionInput.value = '';
    caesarNotification.textContent = '';
}

// التحقق من الحل المدخل من المستخدم
function checkSolution() {
    const userSolution = caesarSolutionInput.value.trim();
    if (userSolution === currentPuzzle.solution) {
        handleCorrectSolution();
    } else {
        handleWrongSolution();
    }
}

// التعامل مع الحل الصحيح
function handleCorrectSolution() {
    solvedPuzzles.push(currentPuzzle.CaesarPuzzleID);
    caesarNotification.textContent = `Correct! You've earned ${currentPuzzle.reward} coins.`;
    updateUserBalance(currentPuzzle.reward);
    saveSolvedPuzzle(); // حفظ الشيفرة المحلولة
    loadNextPuzzle();
}

// التعامل مع الحل الخاطئ
function handleWrongSolution() {
    remainingAttempts--;
    if (remainingAttempts > 0) {
        caesarNotification.textContent = `Wrong answer. You have ${remainingAttempts} attempts remaining.`;
    } else {
        caesarNotification.textContent = 'You have used all your attempts. Please try again tomorrow.';
        disablePuzzle();
    }
}

// تعطيل الأحجية بعد استنفاد المحاولات
function disablePuzzle() {
    caesarSubmitBtn.disabled = true;
    caesarSolutionInput.disabled = true;
}

// حفظ الشيفرة المحلولة في قاعدة البيانات للمستخدم
async function saveSolvedPuzzle() {
    const userTelegramId = uiElements.userTelegramIdDisplay.innerText; // الحصول على ID المستخدم من Telegram
    if (!userTelegramId || !currentPuzzle) return;

    // جلب بيانات المستخدم للتحقق من الشيفرات المحلولة
    const { data, error } = await supabase
        .from('users')
        .select('caesar_ciphers') // العمود الجديد 'caesar_ciphers' في قاعدة البيانات
        .eq('telegram_id', userTelegramId)
        .single();

    if (error) {
        console.error('Error fetching Caesar Cipher progress:', error);
        return;
    }

    let solvedCiphers = data.caesar_ciphers || []; // الشيفرات المحلولة

    // تحقق إذا كانت الشيفرة قد تم حلها بالفعل
    if (solvedCiphers.includes(currentPuzzle.CaesarPuzzleID)) {
        caesarNotification.textContent = 'You have already solved this puzzle and received the reward.';
        return;
    }

    // إضافة الشيفرة الحالية إلى قائمة الشيفرات المحلولة
    solvedCiphers.push(currentPuzzle.CaesarPuzzleID);

    // تحديث قاعدة البيانات بإضافة الشيفرة المحلولة
    const { updateError } = await supabase
        .from('users')
        .update({
            caesar_ciphers: solvedCiphers // تحديث العمود في قاعدة البيانات
        })
        .eq('telegram_id', userTelegramId);

    if (updateError) {
        console.error('Error updating Caesar Cipher progress:', updateError);
        caesarNotification.textContent = 'Error saving your progress. Please try again.';
    } else {
        caesarNotification.textContent = `Correct! You've earned ${currentPuzzle.reward} coins.`;
        updateUserBalance(currentPuzzle.reward); // إضافة المكافأة مرة واحدة
    }
}

// تحديث رصيد المستخدم بعد حل الأحجية بنجاح
function updateUserBalance(reward) {
    gameState.balance += reward;
    saveGameState(); // حفظ حالة اللعبة بعد التحديث
}

// تحميل حالة المستخدم (إذا كان هناك أحجيات تم حلها بالفعل)
async function loadUserProgress() {
    const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

    const { data, error } = await supabase
        .from('users')
        .select('caesar_ciphers') // استرجاع الشيفرات المحلولة
        .eq('telegram_id', userTelegramId)
        .single();

    if (error) {
        console.error('Error loading user progress:', error);
        return;
    }

    solvedPuzzles = data.caesar_ciphers || [];
}

// استدعاء هذه الدالة عند بدء اللعبة أو عند الضغط على زر الشيفرة
caesarPuzzleBtn.addEventListener("click", () => {
    caesarPuzzleContainer.classList.toggle("hidden");
    loadUserProgress(); // تحميل الشيفرات المحلولة للمستخدم
    fetchPuzzles(); // جلب الأحجيات عند الضغط على الزر
});

// التحقق من الحل عند الضغط على زر الإرسال
caesarSubmitBtn.addEventListener("click", () => {
    checkSolution();
});
