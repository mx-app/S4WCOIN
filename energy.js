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
    autClickCount: 0,    // عدد محاولات النقر التلقائي
    lastAutClickTime: Date.now(),  // آخر وقت تم فيه استخدام النقر التلقائي
};

// استيراد العناصر من DOM
const uiElements = {
    purchaseNotification: document.getElementById('purchaseNotification'),
    energyBar: document.getElementById('energyBar'),
    energyInfo: document.getElementById('energyInfo'),
    fillEnergyButton: document.getElementById('fillEnergyButton'),
    autClickButton: document.getElementById('AutoclickButton'),
    updateAttemptsElement: document.getElementById('UpdateAttempts'),
    energyAttemptsText: document.getElementById('energyAttemptsText'),
    autClickAttemptsText: document.getElementById('AutoclickAttemptsText'),
    autClickPopup: document.getElementById('AutoclickPopup'),
    free1: document.getElementById('free1'), // زر تعبئة الطاقة
    free2Element: document.getElementById('free2'), // زر النقر التلقائي
    mainPage: document.getElementById('mainPage'),
};

// ** دوال إدارة الطاقة **

// فتح نافذة الطاقة
uiElements.free1.addEventListener('click', openEnergyPopup);

function openEnergyPopup() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية

    // تحديث المحاولات
    uiElements.energyAttemptsText.innerText = `Attempts: ${gameState.fillEnergyCount}/2`;

    // عرض النافذة
    uiElements.energyPopup.style.display = 'block';

    // منطق زر تعبئة الطاقة
    if (gameState.fillEnergyCount < 2) {
        uiElements.fillEnergyButton.textContent = 'Fill Energy';
        uiElements.fillEnergyButton.disabled = false;
        uiElements.fillEnergyButton.addEventListener('click', fillEnergyAction);
    } else {
        if (currentTime - gameState.lastFillTime < twentyFourHours) {
            const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastFillTime)) / 1000);
            uiElements.fillEnergyButton.textContent = `Wait ${formatTime(remainingTime)} before refilling`;
            uiElements.fillEnergyButton.disabled = true;
        } else {
            uiElements.fillEnergyButton.textContent = 'Refill Energy';
            uiElements.fillEnergyButton.disabled = false;
            uiElements.fillEnergyButton.addEventListener('click', fillEnergyAction);
        }
    }

    uiElements.closePopupButton.addEventListener('click', closeEnergyPopup);
}

// إغلاق نافذة الطاقة
function closeEnergyPopup() {
    uiElements.energyPopup.style.display = 'none';
}

// تعبئة الطاقة
async function fillEnergyAction() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (gameState.fillEnergyCount < 2) {
        gameState.energy = gameState.maxEnergy;
        gameState.fillEnergyCount += 1;
        gameState.lastFillTime = currentTime;

        // تحديث واجهة المستخدم
        updateEnergyUI();
        showNotification('Energy filled!');
    } else if (currentTime - gameState.lastFillTime >= twentyFourHours) {
        gameState.fillEnergyCount = 0;
        gameState.lastFillTime = currentTime;
        showNotification('You can refill energy again!');
    } else {
        const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastFillTime)) / 1000);
        showNotification(`Wait ${formatTime(remainingTime)} before refilling.`);
    }

    // تحديث قاعدة البيانات
    updateUserData();
}

// تحديث واجهة الطاقة
function updateEnergyUI() {
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    uiElements.energyBar.style.width = `${energyPercent}%`;
    uiElements.energyInfo.innerText = `${gameState.energy}/${gameState.maxEnergy} ⚡`;
}

// ** دوال النقر التلقائي (Autoclick) **

uiElements.free2Element.addEventListener('click', openAutoclickPopup);

// فتح نافذة النقر التلقائي
function openAutoclickPopup() {
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    uiElements.updateAttemptsElement.innerText = `${gameState.autClickCount}/2`;

    if (gameState.autClickCount < 2) {
        uiElements.autClickButton.textContent = 'Activate Auto Click';
        uiElements.autClickButton.disabled = false;
        uiElements.autClickButton.addEventListener('click', activateAutoclick);
    } else {
        if (currentTime - gameState.lastAutClickTime < twentyFourHours) {
            const remainingTime = Math.floor((twentyFourHours - (currentTime - gameState.lastAutClickTime)) / 1000);
            uiElements.autClickButton.textContent = `Wait ${formatTime(remainingTime)} before using again`;
            uiElements.autClickButton.disabled = true;
        } else {
            uiElements.autClickButton.textContent = 'Activate Auto Click';
            uiElements.autClickButton.disabled = false;
            uiElements.autClickButton.addEventListener('click', activateAutoclick);
        }
    }

    uiElements.autClickPopup.style.display = 'block';
}

// تفعيل النقر التلقائي
async function activateAutoclick() {
    const clickDuration = 30 * 1000; // 30 ثانية
    const startTime = Date.now();

    function clickElement() {
        const currentTime = Date.now();
        if (currentTime - startTime < clickDuration) {
            // لمحاكاة النقر السريع
            createClickEffect(
                Math.random() * uiElements.clickableImg.offsetWidth,
                Math.random() * uiElements.clickableImg.offsetHeight
            );
            setTimeout(clickElement, 100); // تكرار النقر كل 100ms
        } else {
            navigateToMainPage();
        }
    }

    clickElement();
    gameState.autClickCount += 1;
    gameState.lastAutClickTime = Date.now();
    uiElements.updateAttemptsElement.innerText = `${gameState.autClickCount}/2`;

    // تحديث قاعدة البيانات
    updateUserData();
}

// إنشاء تأثير النقر
function createClickEffect(x, y) {
    const clickEffect = document.createElement('div');
    clickEffect.classList.add('click-effect');
    clickEffect.style.left = `${x}px`;
    clickEffect.style.top = `${y}px`;
    document.body.appendChild(clickEffect);
    setTimeout(() => clickEffect.remove(), 500);
}

// ** دوال مساعدة **

// عرض إشعار
function showNotification(message) {
    if (!uiElements.purchaseNotification) return;
    uiElements.purchaseNotification.innerText = message;
    uiElements.purchaseNotification.classList.add('show');
    setTimeout(() => uiElements.purchaseNotification.classList.remove('show'), 4000);
}

// صياغة الوقت (الساعات:الدقائق:الثواني)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ** حفظ التحديثات في قاعدة البيانات **

async function updateUserData() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const updatedData = {
        balance: gameState.balance,
        energy: gameState.energy,
        max_energy: gameState.maxEnergy,
        fill_energy_count: gameState.fillEnergyCount,
        last_fill_time: new Date(gameState.lastFillTime).toISOString(),
        aut_click_count: gameState.autClickCount,
        last_aut_click_time: new Date(gameState.lastAutClickTime).toISOString(),
    };

    try {
        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('telegram_id', userId);

        if (error) {
            console.error('Error updating user data:', error);
        }
    } catch (err) {
        console.error('Unexpected error while updating user data:', err);
    }
}