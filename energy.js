// استيراد المفاتيح من ملف config.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './Scripts/config.js';
import { createClient } from '@supabase/supabase-js';

// إنشاء اتصال بـ Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تعريف حالة اللعبة
let gameState = {
    balance: 0,
    energy: 500,
    maxEnergy: 500,
    fillEnergyCount: 0,
    lastFillTime: Date.now(),
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

        // تحديث قاعدة البيانات
        await saveGameState();
        await updateUserData();
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
