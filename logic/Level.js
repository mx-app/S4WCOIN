// مستويات اللعبة المتناسقة
const levelThresholds = [
    { level: 1, threshold: 1000, name: 'Beginner', image: 'i/lvl1.png' },
    { level: 2, threshold: 3000, name: 'Learner', image: 'i/lvl2.png' },
    { level: 3, threshold: 5000, name: 'Novice', image: 'i/lvl3.png' },
    { level: 4, threshold: 10000, name: 'Apprentice', image: 'i/lvl4.png' },
    { level: 5, threshold: 20000, name: 'Explorer', image: 'i/lvl5.png' },
    { level: 6, threshold: 30000, name: 'Adept', image: 'i/lvl6.png' },
    { level: 7, threshold: 50000, name: 'Skilled', image: 'i/lvll7.png' },
    { level: 8, threshold: 100000, name: 'Proficient', image: 'i/lvl8.png' },
    { level: 9, threshold: 150000, name: 'Specialist', image: 'i/lvl9.png' },
    { level: 10, threshold: 300000, name: 'Expert', image: 'i/lvl10.png' },
    { level: 11, threshold: 400000, name: 'Veteran', image: 'i/lvl11.png' },
    { level: 12, threshold: 500000, name: 'Master', image: 'i/lvl12.png' },
    { level: 13, threshold: 600000, name: 'Guru', image: 'i/lvl13.png' },
    { level: 14, threshold: 700000, name: 'Sage', image: 'i/lvl14.png' },
    { level: 15, threshold: 800000, name: 'Legend', image: 'i/lvl15.png' },
    { level: 16, threshold: 900000, name: 'Hero', image: 'i/lvl16.png' },
    { level: 17, threshold: 1000000, name: 'Champion', image: 'i/lvl17.png' },
    { level: 18, threshold: 1100000, name: 'Guardian', image: 'i/lvl18.png' },
    { level: 19, threshold: 1500000, name: 'Titan', image: 'i/lvl19.png' },
    { level: 20, threshold: 2000000, name: 'Mythic', image: 'i/lvl20.png' },
    { level: 21, threshold: 2500000, name: 'Deity', image: 'i/lvl21.png' },
    { level: 22, threshold: 3000000, name: 'Immortal', image: 'i/lvl22.png' },
    { level: 23, threshold: 3500000, name: 'Supreme', image: 'i/lvl23.png' },
    { level: 24, threshold: 4000000, name: 'Celestial', image: 'i/lvl24.png' },
    { level: 25, threshold: 4500000, name: 'Divine', image: 'i/lvl25.png' },
    { level: 26, threshold: 5000000, name: 'Omni', image: 'i/lvl26.png' },
    { level: 27, threshold: 5500000, name: 'Cosmic', image: 'i/lvl27.png' },
    { level: 28, threshold: 6000000, name: 'Infinite', image: 'i/lvl28.png' },
    { level: 29, threshold: 6500000, name: 'Transcendent', image: 'i/lvl29.png' },
    { level: 30, threshold: 7000000, name: 'Epoch', image: 'i/lvl30.png' },
    { level: 31, threshold: 7500000, name: 'Eon', image: 'i/lvl31.png' },
    { level: 32, threshold: 8500000, name: 'Legendary', image: 'i/lvl32.png' },
    { level: 33, threshold: 9000000, name: 'Eternal', image: 'i/lvl33.png' },
    { level: 34, threshold: 9500000, name: 'Sentinel', image: 'i/lvl34.png' },
    { level: 35, threshold: 10000000, name: 'Archon', image: 'i/lvl35.png' },
    { level: 36, threshold: 10500000, name: 'Ascendant', image: 'i/lvl36.png' },
    { level: 37, threshold: 11050000, name: 'Paragon', image: 'i/lvl37.png' },
    { level: 38, threshold: 12000000, name: 'Aether', image: 'i/lvl38.png' },
    { level: 39, threshold: 13000000, name: 'Quantum', image: 'i/lvl39.png' },
    { level: 40, threshold: 13050000, name: 'Infinity', image: 'i/lvl40.png' },
    { level: 41, threshold: 14000000, name: 'Etheric', image: 'i/lvl41.png' },
    { level: 42, threshold: 15000000, name: 'Void', image: 'i/lvl42.png' },
    { level: 43, threshold: 16000000, name: 'Anomaly', image: 'i/lvl43.png' },
    { level: 44, threshold: 17000000, name: 'Zenith', image: 'i/lvl44.png' },
    { level: 45, threshold: 18000000, name: 'Nirvana', image: 'i/lvl45.png' },
    { level: 46, threshold: 19000000, name: 'Absolute', image: 'i/lvl46.png' },
    { level: 47, threshold: 20000000, name: 'Omega', image: 'i/lvl47.png' },
    { level: 48, threshold: 25000000, name: 'Prime', image: 'i/lvl48.png' },
    { level: 49, threshold: 30000000, name: 'Supernova', image: 'i/lvl49.png' },
    { level: 50, threshold: 40000000, name: 'Ascension', image: 'i/lvl50.png' },
];



// التحقق من الترقية إلى مستوى أعلى
async function checkForLevelUp() {
    for (let i = 0; i < levelThresholds.length; i++) {
        const levelData = levelThresholds[i];

        // تحقق من شروط الترقية
        if (
            gameState.balance >= levelData.threshold &&  // تحقق إذا كان الرصيد يكفي
            gameState.currentLevel < levelData.level &&  // تحقق إذا كان المستوى الحالي أقل
            !gameState.achievedLevels.includes(levelData.level)  // تحقق إذا لم يتم الوصول إلى هذا المستوى مسبقًا
        ) {
            // ترقية المستخدم إلى المستوى الجديد
            gameState.currentLevel = levelData.level;

            // تسجيل المستوى الجديد
            gameState.achievedLevels.push(levelData.level);

            // عرض إشعار الترقية
            showNotification(
                uiElements.purchaseNotification,
                `You have been promoted to level ${gameState.currentLevel}!`
            );

            // تحديث واجهة المستخدم
            updateUI();

            // تحديث قاعدة البيانات
            const updatedData = {
                currentLevel: gameState.currentLevel,
                achieved_levels: gameState.achievedLevels,
            };

            const isUpdated = await updateGameStateInDatabase(updatedData);

            if (!isUpdated) {
                console.error('Failed to update levels in the database.');
            }

            // كسر الحلقة لأن المستخدم تمت ترقيته
            break;
        }
    }
}


//المستويات 
function updateLevelDisplay() {
    checkForLevelUp(); // تحقق من الترقية

    const currentLevelData = levelThresholds.find(lvl => lvl.level === gameState.currentLevel);

    if (currentLevelData) {
        const progress = Math.min(gameState.balance / currentLevelData.threshold, 1) * 100; // حساب التقدم المشترك

        // تحديث العناصر الرئيسية
        const mainLevelCoinsElement = document.getElementById('currentLevelCoins');
        const mainEnergyFill = document.getElementById('levelEnergyFill');

        if (mainLevelCoinsElement && mainEnergyFill) {
            mainLevelCoinsElement.innerText = `Next Lvl : ${Math.round(progress)}%`;
            mainEnergyFill.style.width = `${progress}%`;
        }

        // تحديث صفحة المستويات
        const levelPageImage = document.getElementById('currentLevelImagee');
        const levelPageName = document.getElementById('levelPageCurrentLevelName');
        const levelPageCoinsElement = document.getElementById('levelPageCurrentLevelCoins');
        const levelPageEnergyFill = document.getElementById('levelPageEnergyFill');

        if (levelPageImage && levelPageName && levelPageCoinsElement && levelPageEnergyFill) {
            levelPageImage.src = currentLevelData.image;
            levelPageImage.alt = `Level : ${gameState.currentLevel}`;
            levelPageName.innerText = `Lvl : ${currentLevelData.name}`;

            applyGradientToLevel(levelPageName, gameState.currentLevel);

            levelPageCoinsElement.innerText = `Next Lvl : ${Math.round(progress)}%`;
            levelPageEnergyFill.style.width = `${progress}%`;
        }

        // تحديث الزر العائم
        const floatingButtonImage = document.getElementById('currentLevelImage');
        const floatingButtonName = document.getElementById('currentLevelName');

        if (floatingButtonImage && floatingButtonName) {
            floatingButtonImage.src = currentLevelData.image;
            floatingButtonImage.alt = ` ${gameState.currentLevel}`;
            floatingButtonName.innerText = ` ${currentLevelData.name}`;

            floatingButtonName.classList.remove('gradient-level-1', 'gradient-level-2', 'gradient-level-3', 'gradient-level-4', 'gradient-level-5');
        }
    }

    // تحديد العنصر النشط
    document.querySelectorAll('.level-item').forEach(item => {
        item.classList.remove('current-level');
    });

    const currentLevelElement = document.getElementById(`level${gameState.currentLevel}`);
    if (currentLevelElement) {
        currentLevelElement.classList.add('current-level');
    }
}


///////////////////


function applyGradientToLevel(element, level) {
    element.className = ""; // إزالة جميع الفئات الحالية

    if (level <= 10) {
        element.classList.add('gradient-level-1');
    } else if (level <= 20) {
        element.classList.add('gradient-level-2');
    } else if (level <= 30) {
        element.classList.add('gradient-level-3');
    } else if (level <= 40) {
        element.classList.add('gradient-level-4');
    } else if (level <= 50) {
        element.classList.add('gradient-level-5');
    }
}

