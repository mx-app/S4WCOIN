// استيراد المفاتيح من ملف config.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './Scripts/config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// إنشاء اتصال بـ Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تعريف حالة اللعبة
let gameState = {
    balance: 0,
    energy: 500,
    maxEnergy: 500,
    fillEnergyCount: 0,
    lastFillTime: Date.now(),
    autClickCount: 0,    // عدد المحاولات
    lastAutClickTime: Date.now(),  // آخر وقت تم فيه استخدام النقر التلقائي
};

// استيراد العناصر من DOM
const uiElements = {
    purchaseNotification: document.getElementById('purchaseNotification'),
    energyBar: document.getElementById('energyBar'),
    energyInfo: document.getElementById('energyInfo'),
    fillEnergyButton: document.getElementById('fillEnergyButton'),
    closePopupButton: document.getElementById('closePopupButton'),
    energyAttemptsText: document.getElementById('energyAttemptsText'),
    energyPopup: document.getElementById('energyPopup'),
    free1: document.getElementById('free1'), // العنصر المسؤول عن ملء الطاقة
};

// فتح النافذة المنبثقة عند النقر على العنصر "Full Tank"
uiElements.free1.addEventListener('click', openEnergyPopup);

// دالة لفتح النافذة المنبثقة
function openEnergyPopup() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;  // 24 ساعة بالميلي ثانية

    // تحديث المحاولات
    uiElements.energyAttemptsText.innerText = `Attempts: ${gameState.fillEnergyCount}/2`;

    // إظهار النافذة
    uiElements.energyPopup.style.display = 'block';

    // منطق زر ملء الطاقة
    if (gameState.fillEnergyCount < 2) {
        uiElements.fillEnergyButton.textContent = 'Fill Energy';
        uiElements.fillEnergyButton.disabled = false;
        uiElements.fillEnergyButton.removeEventListener('click', fillEnergyAction);
        uiElements.fillEnergyButton.addEventListener('click', fillEnergyAction);
    } else {
        if (currentTime - gameState.lastFillTime < twentyFourHours) {
            const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastFillTime)) / 1000);
            uiElements.fillEnergyButton.textContent = `Wait ${formatTime(remainingTime)} before refilling`;
            uiElements.fillEnergyButton.disabled = true;
        } else {
            uiElements.fillEnergyButton.textContent = 'Refill Energy';
            uiElements.fillEnergyButton.disabled = false;
            uiElements.fillEnergyButton.removeEventListener('click', fillEnergyAction);
            uiElements.fillEnergyButton.addEventListener('click', fillEnergyAction);
        }
    }

    // إضافة مستمع الحدث لإغلاق النافذة
    uiElements.closePopupButton.addEventListener('click', closeEnergyPopup);
}

// دالة لإغلاق النافذة المنبثقة
function closeEnergyPopup() {
    uiElements.energyPopup.style.display = 'none';
}

// دالة لملء الطاقة
async function fillEnergyAction() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;  // 24 ساعة بالميلي ثانية

    // التحقق إذا كانت المحاولات أقل من 2
    if (gameState.fillEnergyCount < 2) {
        gameState.energy = gameState.maxEnergy;  // ملء الطاقة
        gameState.fillEnergyCount += 1;  // زيادة المحاولات
        gameState.lastFillTime = currentTime;  // تحديث وقت آخر ملء للطاقة

        // تحديث واجهة المستخدم
        updateUI();
        showNotification('Energy filled!');

        // تحديث حالة اللعبة في قاعدة البيانات
        await saveGameState();
        await updateUserData();

        // إعادة تحديث النص الخاص بالمحاولات
        uiElements.energyAttemptsText.innerText = `Attempts: ${gameState.fillEnergyCount}/2`;
    } else {
        // إذا تم استهلاك المحاولات
        if (currentTime - gameState.lastFillTime >= twentyFourHours) {
            gameState.fillEnergyCount = 0;  // إعادة تعيين المحاولات بعد 24 ساعة
            gameState.lastFillTime = currentTime;
            showNotification('You can refill energy again!');
        } else {
            const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastFillTime)) / 1000);
            showNotification(`You need to wait for ${formatTime(remainingTime)} before refilling.`);
        }
    }
}

// دالة لصياغة الوقت (الساعات:الدقائق:الثواني)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// دالة لعرض الإشعار
function showNotification(message) {
    if (!uiElements.purchaseNotification) return;
    uiElements.purchaseNotification.innerText = message;
    uiElements.purchaseNotification.classList.add('show');
    setTimeout(() => {
        uiElements.purchaseNotification.classList.remove('show');
    }, 4000);
}

// تحديث واجهة المستخدم
function updateUI() {
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    if (uiElements.energyBar) {
        uiElements.energyBar.style.width = `${energyPercent}%`;
    }

    if (uiElements.energyInfo) {
        uiElements.energyInfo.innerText = `${gameState.energy}/${gameState.maxEnergy} ⚡`;
    }
}

// دالة لحفظ حالة اللعبة
async function saveGameState() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const updatedData = {
        energy: gameState.energy,
        fill_energy_count: gameState.fillEnergyCount,
        last_fill_time: new Date(gameState.lastFillTime).toISOString(),
    };

    try {
        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('telegram_id', userId);

        if (error) {
            console.error('Error saving game state:', error.message);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// دالة لتحديث البيانات في قاعدة البيانات
async function updateUserData() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({
            energy: gameState.energy,
            fill_energy_count: gameState.fillEnergyCount,
            last_fill_time: new Date(gameState.lastFillTime).toISOString(),
        })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating user data:', error);
    }
}

// استيراد البيانات من قاعدة البيانات عند تحميل الصفحة
async function loadGameState() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error loading game state from Supabase:', error);
            return;
        }

        if (data) {
            gameState = { ...gameState, ...data };
            updateUI();
        } else {
            console.warn('No game state found for this user.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// تحميل حالة اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadGameState);





// استيراد العناصر من DOM
const uiElements = {
    autClickButton: document.getElementById('AutoclickButton'),
    autClickAttemptsText: document.getElementById('AutoclickAttemptsText'),
    autClickPopup: document.getElementById('AutoclickPopup'),
    clickableImg: document.getElementById('clickableImg'),
    mainPage: document.getElementById('mainPage'),
    free2Element: document.getElementById('free2'),
    updateAttemptsElement: document.getElementById('UpdateAttempts'),
    closeAutoclick: document.getElementById('closeAutoclick')
};

// استعراض نافذة النقر التلقائي عند النقر على العنصر
uiElements.free2Element.addEventListener('click', openAutoclickPopup);

// فتح نافذة النقر التلقائي
function openAutoclickPopup() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;  // 24 ساعة بالميلي ثانية

    // تحديث عدد المحاولات المعروضة
    uiElements.updateAttemptsElement.innerText = `${gameState.autClickCount}/2`;

    // منطق تفعيل النقر التلقائي
    if (gameState.autClickCount < 2) {
        uiElements.autClickButton.textContent = 'Activate Auto Click';
        uiElements.autClickButton.disabled = false;
        uiElements.autClickButton.removeEventListener('click', activateAutoclick);
        uiElements.autClickButton.addEventListener('click', activateAutoclick);
    } else {
        if (currentTime - gameState.lastAutClickTime < twentyFourHours) {
            const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastAutClickTime)) / 1000);
            uiElements.autClickButton.textContent = `Wait ${formatTime(remainingTime)} before using again`;
            uiElements.autClickButton.disabled = true;
        } else {
            uiElements.autClickButton.textContent = 'Activate Auto Click';
            uiElements.autClickButton.disabled = false;
            uiElements.autClickButton.removeEventListener('click', activateAutoclick);
            uiElements.autClickButton.addEventListener('click', activateAutoclick);
        }
    }

    uiElements.autClickPopup.style.display = 'block';
}

// إغلاق نافذة النقر التلقائي
uiElements.closeAutoclick.addEventListener('click', closeAutoclickPopup);
function closeAutoclickPopup() {
    uiElements.autClickPopup.style.display = 'none';
}

// تنسيق الوقت (الساعة:الدقيقة:الثانية)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// تفعيل النقر التلقائي
async function activateAutoclick() {
    const currentTime = Date.now();
    const clickDuration = 60 * 1000;  // دقيقة واحدة بالميلي ثانية
    const startTime = Date.now();

    // منطق تفعيل النقر التلقائي لمدة دقيقة
    function clickElement() {
        const currentTime = Date.now();
        if (currentTime - startTime < clickDuration) {
            uiElements.clickableImg.click();  // محاكاة النقر
            createClickEffect(Math.random() * uiElements.clickableImg.offsetWidth, Math.random() * uiElements.clickableImg.offsetHeight);  // إنشاء تأثير النقر
            setTimeout(clickElement, 100);  // تكرار النقر كل 100 ميلي ثانية
        } else {
            console.log("Auto-click stopped.");
        }
    }

    clickElement();  // بدء النقر التلقائي

    // الانتقال إلى الصفحة الرئيسية بعد تفعيل النقر
    navigateToMainPage();

    // تحديث المحاولات
    const twentyFourHours = 24 * 60 * 60 * 1000;
    gameState.autClickCount++;
    gameState.lastAutClickTime = currentTime;

    // تحديث واجهة المستخدم
    updateAutoclickUI();

    // حفظ حالة اللعبة (لا حاجة لإضافتها هنا لأنها موجودة في الملف الرئيسي)
}

// الانتقال إلى الصفحة الرئيسية
function navigateToMainPage() {
    uiElements.mainPage.classList.add('active');  // إظهار الصفحة الرئيسية
    console.log("Navigating to the main page.");
}

// إنشاء تأثير النقر العشوائي
function createClickEffect(x, y) {
    const clickEffect = document.createElement('div');
    clickEffect.classList.add('click-effect');
    clickEffect.style.left = `${x}px`;
    clickEffect.style.top = `${y}px`;
    document.body.appendChild(clickEffect);

    setTimeout(() => {
        clickEffect.remove();  // إزالة التأثير بعد أن ينتهي
    }, 500);
}

// تحديث واجهة المستخدم
function updateAutoclickUI() {
    uiElements.autClickAttemptsText.innerText = `Attempts: ${gameState.autClickCount}/2`;
    if (gameState.autClickCount >= 2) {
        uiElements.autClickButton.disabled = true;
    }
    uiElements.updateAttemptsElement.innerText = `${gameState.autClickCount}/2`;  // تحديث المحاولات في العنصر
}

// إضافة مستمع الحدث عند النقر على الزر
uiElements.autClickButton.addEventListener('click', activateAutoclick);

