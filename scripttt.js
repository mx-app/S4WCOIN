import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تعريف عناصر DOM
const uiElements = {
    balanceDisplay: document.getElementById('balanceAmount'),
    energyBar: document.getElementById('energyBar'),
    energyInfo: document.getElementById('energyInfo'),
    languageBtn: document.getElementById('languageSwitchBtn'),
    boostLevelDisplay: document.getElementById('boostLevel'),
    multiplierDisplay: document.getElementById('clickMultiplier'),
    coinBoostLevelDisplay: document.getElementById('coinBoostLevel'),
    currentLevel: document.getElementById('currentLevel'),  // عنصر يعرض المستوى الحالي
    currentCoins: document.getElementById('currentCoins'),  // عنصر يعرض العملات الحالية
    upgradeCost: document.getElementById('upgradeCost'),    // عنصر يعرض تكلفة الترقية
    purchaseNotification: document.getElementById('purchaseNotification'),
    copyInviteNotification: document.getElementById('copyInviteNotification'),
    clickableImg: document.getElementById('clickableImg'),
    navButtons: document.querySelectorAll('.menu button'),
    contentScreens: document.querySelectorAll('.screen-content'),
    splashScreen: document.querySelector('.splash-screen'),
    mainContainer: document.querySelector('.container'),
    levelFloatingBtn: document.getElementById('levelFloatingBtn'),
    confirmUpgradeBtn: document.getElementById('confirmUpgradeBtn'),
    cancelUpgradeBtn: document.getElementById('cancelUpgradeBtn'),
    upgradeModal: document.getElementById('upgradeConfirmation'),
    closeModal: document.getElementById('closeModal'),
    fillEnergyBtn: document.getElementById('fillEnergyBtn'),
    withdrawBtn: document.getElementById('withdrawBtn'),
    withdrawalForm: document.getElementById('withdrawalForm'),
    confirmWithdrawalBtn: document.getElementById('confirmWithdrawalBtn'),
    maxWithdrawBtn: document.getElementById('maxWithdrawBtn'),
    withdrawAmountInput: document.getElementById('withdrawAmount'),
    userTelegramNameDisplay: document.getElementById('userTelegramName'),
    userTelegramIdDisplay: document.getElementById('userTelegramId'),
    //taskTwoBtn: document.getElementById('taskTwoBtn'),
    //taskThreeBtn: document.getElementById('taskThreeBtn'),
   // taskTwoProgress: document.getElementById('taskTwoProgress'),
    //taskThreeProgress: document.getElementById('taskThreeProgress'),
    levelInfoDisplay: document.getElementById('currentLevelInfo') || { innerText: '' },
    friendsListDisplay: document.getElementById('friendsList') || { innerHTML: '' },
    displayedLevel: document.getElementById('displayedLevel'),
    currentLevelName: document.getElementById('currentLevelName'),
    levelOneProgress: document.getElementById('levelOneProgress'),
    levelTwoProgress: document.getElementById('levelTwoProgress'),
    levelThreeProgress: document.getElementById('levelThreeProgress'),
    levelFourProgress: document.getElementById('levelFourProgress'),
    levelFiveProgress: document.getElementById('levelFiveProgress'),
    levelSixProgress: document.getElementById('levelSixProgress'),
    levelSevenProgress: document.getElementById('levelSevenProgress'),
    levelEightProgress: document.getElementById('levelEightProgress'),
    levelNineProgress: document.getElementById('levelNineProgress'),
    levelTenProgress: document.getElementById('levelTenProgress'),
    boostUpgradeBtn: document.getElementById('boostUpgradeBtn'),
    coinUpgradeBtn: document.getElementById('coinUpgradeBtn'),
    fillEnergyUpgradeBtn: document.getElementById('fillEnergyBtn'),
    inviteFriendsBtn: document.getElementById('inviteFriendsBtn'),
    copyInviteLinkBtn: document.getElementById('copyInviteLinkBtn'),

};

// حالة اللعبة
let gameState = {
    balance: 0,
    energy: 500,
    maxEnergy: 500,
    clickMultiplier: 0.5,
    boostLevel: 1,
    coinBoostLevel: 1,
    energyBoostLevel: 1,
    currentLevel: 1,
    friends: 0,
    fillEnergyCount: 0,
    lastFillTime: Date.now(),
    freeEnergyFillTime: null,
    invites: [],
    claimedRewards: { levels: [] }, 
    tasksprogress: [],
    puzzlesprogress:[], 
    usedPromoCodes: [],
    ciphersProgress:[],
    lastLoginDate: null, // تاريخ آخر تسجيل دخول
    consecutiveDays: 0,  // عدد الأيام المتتالية التي تم المطالبة فيها بالمكافآت
    
};

// استعادة حالة اللعبة من localStorage إذا كانت موجودة
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        const currentTime = Date.now();
        const timeDiff = currentTime - gameState.lastFillTime;
        const recoveredEnergy = Math.floor(timeDiff / (4 * 60 * 1000)); // استعادة الطاقة بناءً على الفارق الزمني 4 ساعات
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + recoveredEnergy);
        updateUI();
    }
}

// حفظ حالة اللعبة في localStorage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// مستويات اللعبة المتناسقة
const levelThresholds = [
    { level: 1, threshold: 50000, name: 'Novice', image: 'i/lvl1.png' },
    { level: 2, threshold: 200000, name: 'Challenger', image: 'i/lvl2.png' },
    { level: 3, threshold: 300000, name: 'Apprentice', image: 'i/lvl3.png' },
    { level: 4, threshold: 500000, name: 'Skilled', image: 'i/lvl4.png' },
    { level: 5, threshold: 800000, name: 'Advanced', image: 'i/lvl5.png' },
    { level: 6, threshold: 1000000, name: 'Expert', image: 'i/lvl6.png' },
    { level: 7, threshold: 3000000, name: 'Master', image: 'i/Lvll7.png' },
    { level: 8, threshold: 5000000, name: 'Grandmaster', image: 'i/lvl8.png' },
    { level: 9, threshold: 10000000, name: 'Legendary', image: 'i/lvl9.png' },
    { level: 10, threshold: 20000000, name: 'Apex', image: 'i/lvl10.png' }
];

// التحقق من الترقية إلى مستوى أعلى
function checkForLevelUp() {
    for (let i = 0; i < levelThresholds.length; i++) {
        if (gameState.balance >= levelThresholds[i].threshold && gameState.currentLevel < levelThresholds[i].level && !gameState.claimedRewards.levels.includes(levelThresholds[i].level)) {
            gameState.currentLevel = levelThresholds[i].level;
            gameState.balance += levelThresholds[i].threshold; 
            gameState.claimedRewards.levels.push(levelThresholds[i].level);
            showNotification(uiElements.purchaseNotification, `Upgraded to level ${gameState.currentLevel}! ${formatNumber(levelThresholds[i].threshold)} coins added to your balance.`);
            updateUserData();
            saveGameState();  // حفظ حالة اللعبة والمكافأة
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    loadGameState();
    await initializeApp();
    updateInviteFriendsButton();
});

// دالة تهيئة التطبيق
async function initializeApp() {
    try {
        console.log('Initializing app...');

        // جلب بيانات المستخدم من Telegram وSupabase
        await fetchUserDataFromTelegram();

        // إخفاء شاشة البداية وعرض المحتوى الرئيسي
         setTimeout(() => {
       if (uiElements.splashScreen) uiElements.splashScreen.style.display = 'none';
       if (uiElements.mainContainer) uiElements.mainContainer.style.display = 'flex';
    }, 3000); // 10000 ميلي ثانية تعني 10 ثوانٍ

        
        // استمع إلى التغييرات في البيانات
        listenToRealtimeChanges();

        // إعداد واجهة المستخدم
        updateUI();
        registerEventHandlers();
        startEnergyRecovery();
        
        console.log('App initialized successfully.');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotificationWithStatus(uiElements.purchaseNotification, 'Failed to initialize app.', 'lose');
        if (uiElements.splashScreen) uiElements.splashScreen.style.display = 'none';
        if (uiElements.mainContainer) uiElements.mainContainer.style.display = 'flex';
    }
}

// جلب بيانات المستخدم من Telegram والتحقق في قاعدة البيانات
async function fetchUserDataFromTelegram() {
    const telegramApp = window.Telegram.WebApp;
    telegramApp.ready();

    const userTelegramId = telegramApp.initDataUnsafe.user?.id;
    const userTelegramName = telegramApp.initDataUnsafe.user?.username;

    if (!userTelegramId || !userTelegramName) {
        throw new Error("Failed to fetch Telegram user data.");
    }

    uiElements.userTelegramIdDisplay.innerText = userTelegramId;
    uiElements.userTelegramNameDisplay.innerText = userTelegramName;

    // تحقق من المستخدم في قاعدة البيانات، سجل إذا لم يكن موجودًا
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userTelegramId)
        .maybeSingle(); 

    if (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user data');
    }

    if (data) {
        // المستخدم مسجل مسبقاً
        gameState = { ...gameState, ...data };
        saveGameState();
        loadFriendsList(); // تحميل قائمة الأصدقاء بعد جلب البيانات
    } else {
        // تسجيل مستخدم جديد
        await registerNewUser(userTelegramId, userTelegramName);
    }
}

// تسجيل مستخدم جديد في قاعدة البيانات
async function registerNewUser(userTelegramId, userTelegramName) {
    const { error } = await supabase
        .from('users')
        .insert([{ telegram_id: userTelegramId, username: userTelegramName, balance: gameState.balance }]);
    if (error) {
        console.error('Error inserting new user:', error);
        throw new Error('Failed to register new user');
   
     }
  }

// الاستماع إلى التغييرات في قاعدة البيانات
function listenToRealtimeChanges() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    supabase
        .channel('public:users')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `telegram_id=eq.${userId}` }, payload => {
            console.log('Change received!', payload);
            gameState = { ...gameState, ...payload.new };
            updateUI();
            saveGameState();
        })
        .subscribe();
}

// تحديث واجهة المستخدم بناءً على حالة اللعبة
function updateUI() {
    if (uiElements.balanceDisplay) {
    uiElements.balanceDisplay.innerText = gameState.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    if (uiElements.energyBar) {
        uiElements.energyBar.style.width = `${energyPercent}%`;
    }

    if (uiElements.energyInfo) {
        uiElements.energyInfo.innerText = `${formatNumber(gameState.energy)}/${formatNumber(gameState.maxEnergy)}⚡`;
    }
    
    if (uiElements.currentLevelName) {
        uiElements.currentLevelName.innerText = levelThresholds[gameState.currentLevel - 1].name;
    }

    if (uiElements.displayedLevel) {
        uiElements.displayedLevel.innerText = `Level ${gameState.currentLevel}`;
    }

    updateBoostsDisplay();
    updateLevelDisplay();
}

function formatNumber(value) {
    if (value >= 1_000_000_000_000) {
        return `${(value / 1_000_000_000_000).toFixed(2)}T`;
    } else if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`; // الملايين
    } else if (value >= 1_000) {
        return `${(value / 1_000).toFixed(2)}K`; // الآلاف
    } else {
        return value.toLocaleString();
    }
}

// تسجيل الأحداث للمستخدم
function registerEventHandlers() {
    if (uiElements.clickableImg) {
        uiElements.clickableImg.addEventListener('click', handleClick);
        uiElements.clickableImg.addEventListener('touchstart', handleClick);
    }

    if (uiElements.navButtons) {
        uiElements.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetScreen = button.getAttribute('data-target');
                navigateToScreen(targetScreen);
            });
        });
    }

    if (uiElements.levelFloatingBtn) {
        uiElements.levelFloatingBtn.addEventListener('click', () => {
            navigateToScreen('levelPage');
            if (uiElements.levelInfoDisplay) {
                uiElements.levelInfoDisplay.innerText = `You are currently on level ${gameState.currentLevel}`;
            }
            if (uiElements.displayedLevel) {
                uiElements.displayedLevel.innerText = gameState.currentLevel;
            }
        });
    }

    if (uiElements.confirmUpgradeBtn) {
        uiElements.confirmUpgradeBtn.addEventListener('click', confirmUpgradeAction);
    }

    if (uiElements.cancelUpgradeBtn) {
        uiElements.cancelUpgradeBtn.addEventListener('click', () => {
            if (uiElements.upgradeModal) uiElements.upgradeModal.style.display = 'none';
        });
    }

    if (uiElements.fillEnergyBtn) {
        uiElements.fillEnergyBtn.addEventListener('click', fillEnergyAction);
    }
    
    
    if (uiElements.boostUpgradeBtn) {
        uiElements.boostUpgradeBtn.addEventListener('click', () => {
            showUpgradeModal('boost');
        });
    }

    if (uiElements.coinUpgradeBtn) {
        uiElements.coinUpgradeBtn.addEventListener('click', () => {
            showUpgradeModal('coin');
        });
    }

    if (uiElements.fillEnergyUpgradeBtn) {
        uiElements.fillEnergyUpgradeBtn.addEventListener('click', () => {
            showUpgradeModal('energy');
        });
    }

  //  if (uiElements.withdrawBtn) {
     //   uiElements.withdrawBtn.addEventListener('click', () => {
           // showNotification(uiElements.purchaseNotification, 'Coming Soon!');
     //   });
  //  }

    if (uiElements.confirmWithdrawalBtn) {
        uiElements.confirmWithdrawalBtn.addEventListener('click', () => {
            showNotification(uiElements.purchaseNotification, 'Coming Soon!');
        });
    }

    if (uiElements.languageBtn) {
        uiElements.languageBtn.addEventListener('click', () => {
            showNotification(uiElements.purchaseNotification, 'Language switch coming soon!');
        });
    }

    if (uiElements.inviteFriendsBtn) {
        uiElements.inviteFriendsBtn.addEventListener('click', () => {
            openTelegramChat();
        });
    }

    if (uiElements.copyInviteLinkBtn) {
        uiElements.copyInviteLinkBtn.addEventListener('click', copyInviteLink);
    }

    if (uiElements.maxWithdrawBtn) {
        uiElements.maxWithdrawBtn.addEventListener('click', () => {
            if (uiElements.withdrawAmountInput) {
                uiElements.withdrawAmountInput.value = gameState.balance;
            }
        });
    }
}

//////////////////////////


// عرض الإشعارات للمستخدم
function showNotification(notificationElement, message) {
    if (!notificationElement) return;
    notificationElement.innerText = message;
    notificationElement.classList.add('show');
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 4000);
}

function showNotificationWithStatus(notificationElement, message, status = '') {
    if (!notificationElement) return;

    // مسح الفئات السابقة للفوز أو الخسارة
    notificationElement.classList.remove('win', 'lose');

    // إعداد رابط الصورة بناءً على الحالة
    let imageUrl = '';
    if (status === 'win') {
        notificationElement.classList.add('win');
        imageUrl = 'i/done.png'; // رابط الصورة لحالة الفوز
    } else if (status === 'lose') {
        notificationElement.classList.add('lose');
        imageUrl = 'i/highlight.png'; // رابط الصورة لحالة الخسارة
    }

    // إضافة الصورة مع الرسالة باستخدام innerHTML
    notificationElement.innerHTML = `<img src="${imageUrl}" class="notification-image" alt=""> ${message}`;

    // إظهار الإشعار
    notificationElement.classList.add('show');

    // إخفاء الإشعار بعد 4 ثوانٍ
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 4000);
}


////////////////////////


// عرض النافذة المنبثقة بناءً على نوع الترقية (النقر أو العملات)
function showUpgradeModal(upgradeType) {
    if (uiElements.upgradeModal) {
        uiElements.upgradeModal.style.display = 'block';
        uiElements.upgradeModal.setAttribute('data-upgrade-type', upgradeType);

        let cost;
        if (upgradeType === 'boost') {
            cost = gameState.boostLevel * 500 + 500;
            uiElements.upgradeText.innerText = `Are you sure you want to upgrade your click multiplier? It will cost ${cost} coins.`;
            uiElements.currentLevel.innerText = `Current Click Multiplier: ×${gameState.clickMultiplier}`;
        } else if (upgradeType === 'coin') {
            cost = gameState.coinBoostLevel * 500 + 500;
            uiElements.upgradeText.innerText = `Are you sure you want to upgrade your max coins? It will cost ${cost} coins.`;
            uiElements.currentLevel.innerText = `Current Max Coins: ${formatNumber(gameState.maxEnergy)}`;
        }

        // تحديث العملات المتاحة وتكلفة الترقية
        uiElements.currentCoins.innerText = formatNumber(gameState.balance);
        uiElements.upgradeCost.innerText = cost;
    }
}

// ربط أزرار الترقية بالنافذة المنبثقة
document.getElementById('boostUpgradeBtn').addEventListener('click', function() {
    showUpgradeModal('boost');
});

document.getElementById('coinUpgradeBtn').addEventListener('click', function() {
    showUpgradeModal('coin');
});

// دالة تأكيد الترقية وتحديث حالة اللعبة بعد الترقية
function confirmUpgradeAction() {
    let cost;
    let upgradeType = uiElements.upgradeModal.getAttribute('data-upgrade-type');

    if (upgradeType === 'boost') {
        cost = gameState.boostLevel * 500 + 500;
    } else if (upgradeType === 'coin') {
        cost = gameState.coinBoostLevel * 500 + 500;
    }

    // التحقق إذا كان لدى المستخدم ما يكفي من العملات للترقية
    if (gameState.balance >= cost) {
        gameState.balance -= cost;  // خصم تكلفة الترقية

        // زيادة المستوى بعد الترقية
        if (upgradeType === 'boost') {
            gameState.boostLevel += 1;
            gameState.clickMultiplier += 0.5;
        } else if (upgradeType === 'coin') {
            gameState.coinBoostLevel += 1;
            gameState.maxEnergy += 500;
        }

        // تحديث واجهة المستخدم والإشعارات بعد الترقية
        updateUI();
        showNotificationWithStatus(uiElements.purchaseNotification, `Successfully upgraded!`, 'win');
        updateUserData();
        saveGameState();
    } else {
        showNotificationWithStatus(uiElements.purchaseNotification, `Not enough coins!`, 'lose');
    }
    uiElements.upgradeModal.style.display = 'none';  // إخفاء النافذة المنبثقة بعد الترقية
}


// ملء الطاقة
function fillEnergyAction() {
    const twelveHours = 12 * 60 * 60 * 1000;
    const currentTime = Date.now();

    if (gameState.fillEnergyCount < 2 && currentTime - gameState.lastFillTime >= twelveHours) {
        gameState.energy = gameState.maxEnergy;
        gameState.fillEnergyCount += 1;
        gameState.lastFillTime = currentTime;
        updateUI();
        showNotification(uiElements.purchaseNotification, 'Energy filled!');
    } else {
        showNotification(uiElements.purchaseNotification, 'You need to wait for the next free energy fill.');
    }
    updateUserData();
    saveGameState();
}



// التعامل مع النقرات لتوليد العملات
// دالة النقرة
function handleClick(event) {
    event.preventDefault(); // منع الأحداث المكررة
    const touchPoints = event.touches ? event.touches : [event];  // التعامل مع اللمس أو النقر الواحد

    for (let i = 0; i < touchPoints.length; i++) {
        const touch = touchPoints[i];
        createDiamondCoinEffect(touch.pageX, touch.pageY);
    }

    // التحقق من توافر الطاقة اللازمة لكل نقرة
    const requiredEnergy = gameState.clickMultiplier * touchPoints.length;
    if (gameState.energy >= requiredEnergy) {
        gameState.balance += gameState.clickMultiplier * touchPoints.length;
        gameState.energy -= requiredEnergy;
        updateUI();
        updateUserData();
        saveGameState();  // التأكد من حفظ حالة اللعبة بعد كل نقرة
    } else {
        showNotification(uiElements.purchaseNotification, 'Not enough energy!');
    }
}



// تأثير النقر لعرض عملات الألماس
function createDiamondCoinEffect(x, y) {
    const diamond = document.createElement('div');
    diamond.classList.add('diamond-coin');
    const multiplierText = document.createElement('span');
    multiplierText.textContent = `+${gameState.clickMultiplier}`;
    diamond.appendChild(multiplierText);
    document.body.appendChild(diamond);

    diamond.style.left = `${x - 15}px`; // Adjust for the diamond size
    diamond.style.top = `${y - 15}px`;

    const balanceRect = uiElements.balanceDisplay.getBoundingClientRect();

    setTimeout(() => {
        diamond.style.transform = `translate(${balanceRect.left - x}px, ${balanceRect.top - y}px) scale(1)`;
        setTimeout(() => {
            diamond.remove();
        }, 1000);
    }, 50);
}


// الانتقال بين الشاشات
function navigateToScreen(screenId) {
    if (uiElements.contentScreens) {
        uiElements.contentScreens.forEach(screen => {
            screen.classList.remove('active');
        });
    }
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active');

    if (screenId === 'boostsPage') {
        
        if (uiElements.boostUpgradeBtn) uiElements.boostUpgradeBtn.style.display = 'block';
        if (uiElements.coinUpgradeBtn) uiElements.coinUpgradeBtn.style.display = 'block';
        if (uiElements.fillEnergyUpgradeBtn) uiElements.fillEnergyUpgradeBtn.style.display = 'block';
    }
    
}

// بدء استعادة الطاقة تلقائياً
function startEnergyRecovery() {
    setInterval(() => {
        const currentTime = Date.now();
        const timeDiff = currentTime - gameState.lastFillTime;
        const recoveredEnergy = Math.floor(timeDiff / (4 * 60 * 1000)); // استعادة الطاقة بناءً على الفارق الزمني 4 ساعات
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + recoveredEnergy);
            updateUI();
            updateUserData();
            saveGameState();
        }
    }, 5000);
}

// التحقق من ملء الطاقة
function checkEnergyFill() {
    const currentTime = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    if (currentTime - gameState.lastFillTime >= twelveHours) {
        gameState.fillEnergyCount = 0;
        updateUI();
        updateUserData();
        saveGameState();
    }
}


// تحديث المستوي 
// تحديث المستوي
function updateLevelDisplay() {
    checkForLevelUp();

    // عرض صورة واسم المستوى الحالي داخل الزر
    const currentLevelData = levelThresholds.find(lvl => lvl.level === gameState.currentLevel);
    if (currentLevelData) {
        const levelImageElement = document.getElementById('currentLevelImage');
        const levelNameElement = document.getElementById('currentLevelName');

        levelImageElement.src = currentLevelData.image;
        levelImageElement.alt = `Level ${gameState.currentLevel}`;
        levelNameElement.innerText = `${currentLevelData.name}`;  // إضافة كلمة "lvl"

        levelNameElement.classList.remove('level-gradient-green', 'level-gradient-brown', 'level-gradient-blue');

        if (gameState.currentLevel >= 1 && gameState.currentLevel <= 3) {
            levelNameElement.classList.add('level-gradient-green');
        } else if (gameState.currentLevel >= 4 && gameState.currentLevel <= 6) {
            levelNameElement.classList.add('level-gradient-brown');
        } else if (gameState.currentLevel >= 7 && gameState.currentLevel <= 10) {
            levelNameElement.classList.add('level-gradient-blue');
        }
    }

    document.querySelectorAll('.level-item').forEach(item => {
        item.classList.remove('current-level');
    });

    const currentLevelElement = document.getElementById(`level${gameState.currentLevel}`);
    if (currentLevelElement) {
        currentLevelElement.classList.add('current-level');
    }

    // تحديث شريط التقدم لكل مستوى
    if (uiElements.level1Progress) uiElements.level1Progress.style.width = `${(gameState.balance / levelThresholds[0].threshold) * 100}%`;

    const currentThreshold = levelThresholds.find(lvl => lvl.level === gameState.currentLevel);
    if (currentThreshold) {
        const currentLevelCoinsElement = document.getElementById('currentLevelCoins');
        const levelEnergyFill = document.getElementById('levelEnergyFill'); // شريط الطاقة الجديد

        if (currentLevelCoinsElement && levelEnergyFill) {
            const progress = Math.min(gameState.balance / currentThreshold.threshold, 1) * 100;
            currentLevelCoinsElement.innerText = `Next Lvl ${Math.round(progress)}%`;  // عرض النسبة المئوية
            levelEnergyFill.style.width = `${progress}%`; // تحديث عرض شريط الطاقة
        }
    }
}



// تحديث عرض التحسينات
function updateBoostsDisplay() {
    const boostUpgradeCost = gameState.boostLevel * 500 + 500;
    const coinUpgradeCost = gameState.coinBoostLevel * 500 + 500;

    if (uiElements.boostUpgradeBtn) {
        document.getElementById('boostUpgradeCost').innerText = boostUpgradeCost;
    }
    if (uiElements.coinUpgradeBtn) {
        document.getElementById('coinUpgradeCost').innerText = coinUpgradeCost;
    }

    if (uiElements.boostLevelDisplay) {
        uiElements.boostLevelDisplay.innerText = gameState.boostLevel;
    }
    if (uiElements.multiplierDisplay) {
        uiElements.multiplierDisplay.innerText = gameState.clickMultiplier;
    }
    if (uiElements.coinBoostLevelDisplay) {
        uiElements.coinBoostLevelDisplay.innerText = gameState.coinBoostLevel;
    }
}


// تحسين عرض قائمة الأصدقاء
async function loadFriendsList() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    if (!userId) {
        console.error("User ID is missing.");
        uiElements.friendsListDisplay.innerHTML = `<li>Error: Unable to load friends list. Please try again later.</li>`;
        return;
    }

    try {
        // جلب قائمة الأصدقاء الذين تمت دعوتهم بواسطة المستخدم الحالي فقط
        const { data, error } = await supabase
            .from('users')
            .select('invites')
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error fetching friends list:', error.message);
            uiElements.friendsListDisplay.innerHTML = `<li>Error: Unable to fetch friends at the moment.</li>`;
            return;
        }

        // التأكد من أن الدعوات تخص المستخدم الحالي فقط
        if (data && data.invites && data.invites.length > 0) {
            uiElements.friendsListDisplay.innerHTML = ''; // مسح القائمة القديمة
            data.invites.forEach(friend => {
                const li = document.createElement('li');
                li.innerText = friend;
                uiElements.friendsListDisplay.appendChild(li);
            });
            
        const invitedCountElement = document.getElementById('invitedCount');
            if (invitedCountElement) {
                invitedCountElement.innerText = data.invites.length; // عرض العدد الإجمالي للأصدقاء
            }
        } else {
            uiElements.friendsListDisplay.innerHTML = '<li>No friends invited yet.</li>';
            const invitedCountElement = document.getElementById('invitedCount');
            if (invitedCountElement) {
                invitedCountElement.innerText = 0; // إذا لم يكن هناك أصدقاء مدعوون
            }
        }
        
    } catch (err) {
        console.error("Unexpected error loading friends list:", err);
        uiElements.friendsListDisplay.innerHTML = `<li>Error: Unexpected issue occurred while loading friends.</li>`;
    }
}


// نسخ رابط الدعوة
function copyInviteLink() {
    const inviteLink = `https://t.me/SAWCOIN_BOT?start=${uiElements.userTelegramIdDisplay?.innerText || ''}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
        showNotification(uiElements.copyInviteNotification, 'Invite link copied!');
    }).catch(err => {
        showNotification(uiElements.purchaseNotification, 'Failed to copy invite link.');
    });
}

// مشاركة الدعوة عبر Telegram
function openTelegramChat() {
    const inviteLink = `https://t.me/share/url?text=Join SAW COIN GAME and earn 50,000 coins!&url=https://t.me/SAWCOIN_BOT?start=${uiElements.userTelegramIdDisplay?.innerText || ''}`;
    window.open(inviteLink, '_blank');
}

// تحديث بيانات المستخدم في Supabase
async function updateUserData() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({
            balance: gameState.balance,
            energy: gameState.energy,
            max_energy: gameState.maxEnergy,
            click_multiplier: gameState.clickMultiplier,
            boost_level: gameState.boostLevel,
            coin_boost_level: gameState.coinBoostLevel,
            energy_boost_level: gameState.energyBoostLevel,
            current_level: gameState.currentLevel,
            friends: gameState.friends,
            fill_energy_count: gameState.fillEnergyCount,
            last_fill_time: new Date(gameState.lastFillTime).toISOString(),
            invites: gameState.invites,
            claimed_rewards: gameState.claimedRewards, // حفظ المكافآت المحصلة في قاعدة البيانات
            tasks_progress: gameState.tasksprogress, 
            puzzles_progress: gameState.puzzlesprogress, 
            used_Promo_Codes: gameState.usedPromoCodes, 
            morse_ciphers_progress: gameState.ciphersProgress, 
            last_login_date: gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toISOString() : null,
            consecutive_days: gameState.consecutiveDays
            
        })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating user data:', error);
    }
}


//

document.querySelectorAll('button[data-target]').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        document.querySelectorAll('.screen-content').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});


// إغلاق النافذة المنبثقة
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('upgradeConfirmation').style.display = 'none';
});



let currentLevelIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.level-container');
    const totalLevels = document.querySelectorAll('.level-item').length;
    const leftArrow = document.querySelector('.arrow-btn.left');
    const rightArrow = document.querySelector('.arrow-btn.right');

    // تحديث حالة الأزرار
    function updateArrows() {
        if (currentLevelIndex === 0) {
            leftArrow.classList.add('disabled');
        } else {
            leftArrow.classList.remove('disabled');
        }

        if (currentLevelIndex === totalLevels - 1) {
            rightArrow.classList.add('disabled');
        } else {
            rightArrow.classList.remove('disabled');
        }
    }

    function scrollLeft() {
        const levelWidth = container.clientWidth;
        if (currentLevelIndex > 0) {
            currentLevelIndex--;
            container.scrollTo({
                left: currentLevelIndex * levelWidth,
                behavior: 'smooth'
            });
        }
        updateArrows();
    }

    function scrollRight() {
        const levelWidth = container.clientWidth;
        if (currentLevelIndex < totalLevels - 1) {
            currentLevelIndex++;
            container.scrollTo({
                left: currentLevelIndex * levelWidth,
                behavior: 'smooth'
            });
        }
        updateArrows();
    }

    // إرفاق الأحداث للأزرار
    leftArrow.addEventListener('click', scrollLeft);
    rightArrow.addEventListener('click', scrollRight);

    // تحديث حالة الأزرار عند البدء
    updateArrows();
});


/////////////////////////////////////////////////



const buttons = document.querySelectorAll('.menu button');

// تفعيل الزر النشط بناءً على الصفحة الحالية عند تحميل الصفحة
window.addEventListener('load', () => {
    const currentPage = window.location.pathname; // الحصول على اسم الصفحة الحالية

    // إزالة الصنف "active" من جميع الأزرار للتأكد من بداية نظيفة
    buttons.forEach(button => button.classList.remove('active'));
    
    // تعيين الزر الرئيسي كزر نشط افتراضي
    buttons[0].classList.add('active');

    // تعيين الزر النشط إذا تطابق "data-target" مع الصفحة الحالية
    buttons.forEach(button => {
        const target = button.getAttribute('data-target'); // الحصول على قيمة "data-target" من كل زر
        if (currentPage.includes(target)) {
            // إزالة الصنف "active" من جميع الأزرار
            buttons.forEach(btn => btn.classList.remove('active'));

            // إضافة الصنف "active" للزر المتطابق مع الصفحة
            button.classList.add('active');
        }
    });
});

// إضافة مستمع للأحداث (Event Listener) لكل زر لاستماع للنقرات
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // إزالة الصنف "active" من جميع الأزرار عند النقر على زر
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // إضافة الصنف "active" للزر الذي تم النقر عليه
        this.classList.add('active');
        
        // الحصول على اسم الصفحة أو القسم المستهدف من الزر
        const targetPage = this.getAttribute('data-target');
        
        // تغيير الصفحة بناءً على الزر
        console.log("التنقل إلى الصفحة:", targetPage); // هذا للعرض فقط في الكونسول
    });
});



//////////////////////////////////////



document.addEventListener('DOMContentLoaded', () => {
    const taskContainer = document.querySelector('#taskcontainer');
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    // Fetch tasks from JSON file
    fetch('tasks.json')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-item');

                // Task Image
                const img = document.createElement('img');
                img.src = task.image;
                img.alt = 'Task Image';
                img.classList.add('task-img');
                taskElement.appendChild(img);

                // Create a container for description and reward
                const infoContainer = document.createElement('div');
                infoContainer.classList.add('info-task'); // This will hold both description and reward

                // Task Description
                const description = document.createElement('p');
                description.textContent = task.description;
                infoContainer.appendChild(description);

                // Task Reward with Coin Image
                const rewardContainer = document.createElement('div');
                rewardContainer.classList.add('task-reward-container');
                
                const rewardIcon = document.createElement('img');
                rewardIcon.src = 'i/coii.png'; // مسار صورة العملة
                rewardIcon.alt = 'Coinreward';
                rewardIcon.classList.add('reward-coin-icon'); // معرف جديد للرمز
                rewardContainer.appendChild(rewardIcon);

                const rewardText = document.createElement('span');
                rewardText.textContent = ` ${task.reward} `;
                rewardText.classList.add('task-reward');
                rewardContainer.appendChild(rewardText);

                infoContainer.appendChild(rewardContainer); // Append reward below description

                taskElement.appendChild(infoContainer); // Append the info container to the task element

                // Task Button
                const button = document.createElement('button');
                button.classList.add('task-button');
                button.setAttribute('data-task-id', task.id);
                button.setAttribute('data-url', task.url);
                button.setAttribute('data-reward', task.reward);
                taskElement.appendChild(button);
                taskContainer.appendChild(taskElement);

                const taskId = task.id;
                const taskurl = task.url;
                const taskReward = task.reward;

                const taskProgressData = gameState.tasksprogress.find(t => t.task_id === taskId);
                let taskProgress = taskProgressData ? taskProgressData.progress : 0;

                button.textContent = taskProgress >= 2 ? '✓' : taskProgress === 1 ? 'Verify' : 'Go';
                button.disabled = taskProgress >= 2;

                let countdownTimer;

                button.onclick = () => {
                    if (taskProgress === 0) {
                        showLoading(button); // عرض الدائرة فقط بدون نص
                        openTaskLink(taskurl, () => {
                            taskProgress = 1;
                            updateTaskProgressInGameState(taskId, taskProgress);
                            hideLoading(button, 'Verify');
                            showNotification(uiElements.purchaseNotification, 'Task opened. Verify to claim your reward.');
                        });
                    } else if (taskProgress === 1) {
                        showLoading(button); // عرض الدائرة فقط بدون نص
                        clearTimeout(countdownTimer);

                        let countdown = 5;
                        countdownTimer = setInterval(() => {
                            if (countdown > 0) {
                                button.innerHTML = `<span class="loading-spinner"></span>`;
                                countdown--;
                            } else {
                                clearInterval(countdownTimer);
                                taskProgress = 2;
                                updateTaskProgressInGameState(taskId, taskProgress);
                                hideLoading(button, 'Claim');
                                showNotification(uiElements.purchaseNotification, 'Task verified. You can now claim the reward.');
                            }
                        }, 1000);
                    } else if (taskProgress === 2) {
                        claimTaskReward(taskId, taskReward);
                        button.textContent = '✓';
                        button.disabled = true;
                        showNotificationWithStatus(uiElements.purchaseNotification, 'Reward successfully claimed!', 'win');
                    }
                };
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
});

// Function to show loading animation only
function showLoading(button) {
    button.innerHTML = `<span class="loading-spinner"></span>`;
    button.disabled = true;
}

// Function to hide loading animation and restore text
function hideLoading(button, text) {
    button.disabled = false;
    button.innerHTML = text;
}


// Open task link function
function openTaskLink(taskurl, callback) {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.openLink(taskurl, { try_instant_view: true });
        setTimeout(callback, 1000); // Simulate load time
    } else {
        window.open(taskurl, '_blank');
        setTimeout(callback, 1000); // Simulate load time
    }
}

// Update task progress in gameState
function updateTaskProgressInGameState(taskId, progress) {
    const taskIndex = gameState.tasksprogress.findIndex(task => task.task_id === taskId);
    if (taskIndex > -1) {
        gameState.tasksprogress[taskIndex].progress = progress;
    } else {
        gameState.tasksprogress.push({ task_id: taskId, progress: progress, claimed: false });
    }
    saveGameState();
}

// Claim the task reward and update balance
function claimTaskReward(taskId, reward) {
    const task = gameState.tasksprogress.find(task => task.task_id === taskId);

    if (task && task.claimed) {
        showNotification(uiElements.purchaseNotification, 'You have already claimed this reward.');
        return;
    }

    gameState.balance += reward;
    if (task) {
        task.claimed = true;
    } else {
        gameState.tasksprogress.push({ task_id: taskId, progress: 2, claimed: true });
    }

    updateUI();
    showNotificationWithStatus(uiElements.purchaseNotification, `Successfully claimed ${reward} coins!`, 'win');
    updateUserData();
    saveGameState();
}





/////////////////////////////////////




window.Telegram.WebApp.setHeaderColor('#000000'); 
// تهيئة تكامل Telegram
function initializeTelegramIntegration() {
    const telegramApp = window.Telegram.WebApp;

    telegramApp.ready();
    
    // إظهار زر الرجوع
    telegramApp.BackButton.show();

    // تفعيل حدث زر الرجوع
    telegramApp.onEvent('backButtonClicked', () => {
        // تنفيذ الإجراء المطلوب عند النقر على زر الرجوع
        // مثال: العودة إلى الشاشة السابقة أو إغلاق النافذة الحالية
        history.back(); // العودة للصفحة السابقة
    });

    // إعدادات اللون والاسم
    if (uiElements.userTelegramNameDisplay) {
        uiElements.userTelegramNameDisplay.innerText = telegramApp.initDataUnsafe.user?.username || '';
    }
    if (uiElements.userTelegramIdDisplay) {
        uiElements.userTelegramIdDisplay.innerText = telegramApp.initDataUnsafe.user?.id || '';
    }

    if (telegramApp.colorScheme === 'dark') {
        document.documentElement.style.setProperty('--background-color-dark', '#000');
        document.documentElement.style.setProperty('--text-color-dark', '#000');
    }

    telegramApp.onEvent('share', () => {
        gameState.balance += 50000;
        updateUI();
        showNotification(uiElements.purchaseNotification, 'You received 50,000 coins for inviting a friend!');
        updateUserData();
        saveGameState();
    });
}

///////////////////////////////////////
     


// تعريف عناصر DOM
const puzzlecloseModal = document.getElementById('puzzlecloseModal');
const puzzleCountdown = document.getElementById('puzzleCountdown');
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const remainingAttemptsDisplay = document.getElementById('attemptsDisplay');
const puzzleRewardDisplay = document.getElementById('puzzleRewardDisplay');

// تعريف حالة اللعبة
let currentPuzzle;
let attempts = 0;
let puzzleSolved = false;
let countdownInterval;
const maxAttempts = 3; // أقصى عدد للمحاولات
const penaltyAmount = 500; // العقوبة عند الإجابة الخاطئة
const countdownDuration = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية

// تحميل الأحاجي من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json');
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error(error);
        showNotificationWithStatus(puzzleNotification, 'Error loading puzzle. Please try again later.', 'lose');
    }
}

// اختيار أحجية اليوم بناءً على التاريخ
function getTodaysPuzzle(puzzles) {
    const today = new Date().toDateString();
    return puzzles.find(p => new Date(p.availableDate).toDateString() === today);
}


// عرض مؤقت العد التنازلي في العنصر المخصص
function startCountdownOnButton(seconds) {
    openPuzzleBtn.disabled = true;

    // عرض العد التنازلي في العنصر puzzleCountdown
    const countdownDisplay = document.getElementById('puzzleCountdown');
    countdownDisplay.innerText = ` ${formatTime(seconds)}`;

    // استهداف العنصر المحدد فقط باستخدام الـ ID
    const puzzleItem = document.getElementById('puzzle1'); // استهداف العنصر حسب ID
    puzzleItem.classList.add('inactive'); // إضافة الفئة "inactive" لتفعيل تأثير الضباب والتوهج

    function updateCountdown() {
        if (seconds > 0) {
            seconds--;
            countdownDisplay.innerText = ` ${formatTime(seconds)}`;
            setTimeout(updateCountdown, 1000);
        } else {
            // عند انتهاء الوقت، إزالة التأثيرات
            countdownDisplay.innerText = 'Puzzle available now!';

            // إزالة الفئة "inactive" وإضافة الفئة "active"
            puzzleItem.classList.remove('inactive'); // إزالة الفئة "inactive"
            puzzleItem.classList.add('active'); // إضافة الفئة "active"

            openPuzzleBtn.disabled = false;
            openPuzzleBtn.innerText = 'Open Puzzle';
        }
    }

    updateCountdown();
}

// صياغة الوقت (الساعات:الدقائق:الثواني)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}


// عرض أحجية اليوم إذا كانت متاحة
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles();
    currentPuzzle = getTodaysPuzzle(puzzles);
    const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

    // جلب تقدم المستخدم من قاعدة البيانات
    const { data, error } = await supabase
        .from('users')
        .select('puzzles_progress')
        .eq('telegram_id', userTelegramId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching puzzle progress:', error);
        showNotification(puzzleNotification, 'Error loading puzzle progress. Please try again later.');
        return;
    }

    const puzzlesProgress = data?.puzzles_progress || {};
    const puzzleProgress = puzzlesProgress[currentPuzzle.id];

    // التحقق من انتهاء العد التنازلي لمدة 24 ساعة من قاعدة البيانات
    const lastSolvedTime = puzzleProgress?.last_solved_time;
    if (lastSolvedTime) {
        const timeElapsed = Date.now() - new Date(lastSolvedTime).getTime();
        if (timeElapsed < countdownDuration) {
            const remainingSeconds = Math.floor((countdownDuration - timeElapsed) / 1000);
            startCountdownOnButton(remainingSeconds);
            return;
        }
    }

    // عرض السؤال والتلميح والمكافأة
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint : ${currentPuzzle.hint}`;
    puzzleRewardDisplay.innerText = `Reward : ${currentPuzzle.reward} coins`;

    // عرض الخيارات كأزرار
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden');
    updateRemainingAttempts(puzzleProgress?.attempts || 0);
    startCountdown();
}

// تشغيل المؤقت
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
    showNotificationWithStatus(puzzleNotification, "Time's up! You failed to solve the puzzle.", 'lose');
    updateBalance(-penaltyAmount); // خصم العقوبة
    updatePuzzleProgressInDatabase(currentPuzzle.id, false, maxAttempts); // تحديث التقدم
    startCountdownOnButton(24 * 60 * 60); // بدء العد التنازلي لعرض أحجية اليوم التالي
    closePuzzle();
}

// التحقق من إجابة المستخدم
function checkPuzzleAnswer(selectedOption) {
    const userAnswer = selectedOption.innerText.trim();

    if (attempts >= maxAttempts || puzzleSolved) {
        showNotification(puzzleNotification, 'You have already solved or failed today\'s puzzle.');
        return;
    }

    if (userAnswer === currentPuzzle.answer) {
        handlePuzzleSuccess();
    } else {
        handlePuzzleWrongAnswer();
    }
}

// التعامل مع الإجابة الصحيحة
function handlePuzzleSuccess() {
    clearInterval(countdownInterval);

    const puzzleReward = currentPuzzle.reward;
    showNotificationWithStatus(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`, 'win');
    updateBalance(puzzleReward);

    updatePuzzleProgressInDatabase(currentPuzzle.id, true, attempts); // تحديث التقدم في قاعدة البيانات

    puzzleSolved = true;
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    startCountdownOnButton(24 * 60 * 60); // بدء العد التنازلي لعرض أحجية اليوم التالي
}

// التعامل مع الإجابة الخاطئة
function handlePuzzleWrongAnswer() {
    attempts++;
    updateRemainingAttempts(attempts);

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval);
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount);
        updatePuzzleProgressInDatabase(currentPuzzle.id, false, maxAttempts); // تسجيل المحاولة الفاشلة
        startCountdownOnButton(24 * 60 * 60); // بدء العد التنازلي
        closePuzzle();
    } else {
        showNotification(puzzleNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// تحديث تقدم الأحجية في قاعدة البيانات
async function updatePuzzleProgressInDatabase(puzzleId, solved, attempts) {
    const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

    // جلب التقدم الحالي للمستخدم من قاعدة البيانات
    const { data, error } = await supabase
        .from('users')
        .select('puzzles_progress')
        .eq('telegram_id', userTelegramId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching puzzle progress:', error);
        return;
    }

    let puzzlesProgress = data?.puzzles_progress || {};

    // تحديث أو إضافة تقدم الأحجية الحالية
    puzzlesProgress[puzzleId] = {
        solved: solved,
        attempts: attempts,
        last_solved_time: solved ? new Date().toISOString() : null // تحديث وقت الحل الأخير
    };

    // تحديث البيانات في قاعدة البيانات
    const { updateError } = await supabase
        .from('users')
        .update({ puzzles_progress: puzzlesProgress })
        .eq('telegram_id', userTelegramId);

    if (updateError) {
        console.error('Error updating puzzle progress:', updateError);
    }
}

// تحديث عرض المحاولات المتبقية
function updateRemainingAttempts(attempts = 0) {
    remainingAttemptsDisplay.innerText = `${maxAttempts - attempts}/${maxAttempts}`;
}

// تحديث الرصيد
function updateBalance(amount) {
    gameState.balance += amount;
    updateUI(); // تحديث الواجهة
    saveGameState(); // حفظ حالة اللعبة
}

// إغلاق الأحجية
function closePuzzle() {
    clearInterval(countdownInterval); // إيقاف المؤقت عند الإغلاق
    puzzleContainer.classList.add('hidden');
    puzzleOptions.innerHTML = '';
    puzzleNotification.innerText = '';
    attempts = 0;
    puzzleSolved = false;
}

// مستمعات الأحداث
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target);
    }
});
openPuzzleBtn.addEventListener('click', displayTodaysPuzzle);

document.getElementById('puzzlecloseModal').addEventListener('click', function() {
    document.getElementById('puzzleContainer').classList.add('hidden');
});
document.getElementById('openPuzzleBtn').addEventListener('click', function() {
    document.getElementById('puzzleContainer').classList.remove('hidden');
});







 





///////////////////////////////////////////////////







document.getElementById('applyPromoCode').addEventListener('click', async () => {
    const applyButton = document.getElementById('applyPromoCode');
    const promoCodeInput = document.getElementById('promoCodeInput');
    const enteredCode = promoCodeInput.value;

    // إخفاء نص الزر وعرض دائرة تحميل
    applyButton.innerHTML = '';  // إخفاء النص
    applyButton.classList.add('loading');  // إضافة الكلاس loading لعرض دائرة التحميل

    // إنشاء دائرة التحميل
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    applyButton.appendChild(spinner);

    try {
        // تحميل البرومو كود من ملف JSON
        const response = await fetch('promocodes.json');
        const promoData = await response.json();
        const promoCodes = promoData.promoCodes;

        // تحقق مما إذا كان المستخدم قد استخدم هذا البرومو كود من قبل
        if (gameState.usedPromoCodes && gameState.usedPromoCodes.includes(enteredCode)) {
            // عرض علامة خطأ (❌) عند الاستخدام المسبق
            applyButton.innerHTML = '⛔';
            showNotificationWithStatus(uiElements.purchaseNotification, 'You have already used this promo code.', 'win');
            setTimeout(() => {
                applyButton.innerHTML = 'Apply';  // استرجاع النص الأصلي
                applyButton.classList.remove('loading');
                spinner.remove();  // إزالة دائرة التحميل
            }, 3000);
            return;
        }

        // التحقق مما إذا كان البرومو كود صحيحًا
        if (promoCodes[enteredCode]) {
            const reward = promoCodes[enteredCode];

            // إضافة المكافأة إلى رصيد المستخدم
            gameState.balance += reward;

            // تحديث واجهة المستخدم
            updateUI();

            // حفظ البرومو كود المستخدم
            if (!gameState.usedPromoCodes) {
                gameState.usedPromoCodes = [];
            }
            gameState.usedPromoCodes.push(enteredCode);

            // تحديث الأكواد المستخدمة في قاعدة البيانات
            await updateUsedPromoCodesInDB(gameState.usedPromoCodes);

            // عرض علامة صح (✔️) عند النجاح
            applyButton.innerHTML = '✔️';

            // إظهار إشعار بالمكافأة
            showNotificationWithStatus(uiElements.purchaseNotification, `Successfully added ${reward} coins to your balance!`, 'win');
        } else {
            // عرض علامة خطأ (❌) عند البرومو كود غير صحيح
            applyButton.innerHTML = '❌';

            // إظهار إشعار بالخطأ
            showNotificationWithStatus(uiElements.purchaseNotification, 'Invalid promo code.', 'lose');
        }
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        applyButton.innerHTML = 'Error';
    } finally {
        // إعادة النص العادي للزر بعد 3 ثواني
        setTimeout(() => {
            applyButton.innerHTML = 'Apply';
            applyButton.classList.remove('loading');
            spinner.remove();  // إزالة دائرة التحميل
        }, 3000);
    }
});

// تحديث الأكواد المستخدمة في قاعدة البيانات
async function updateUsedPromoCodesInDB(usedPromoCodes) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({
            used_Promo_Codes: usedPromoCodes  // تحديث الأكواد المستخدمة
        })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating used promo codes:', error);
        showNotification(uiElements.purchaseNotification, 'Failed to update promo codes in database.', true);
    }
}



//////////////////////////////////////////////






            



document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const morseCipherContainer = document.getElementById('morseCipherContainer');
    const morsecloseModal = document.getElementById('morsecloseModal');
    const morseCodeDisplay = document.getElementById('morseCode');
    const morseAnswerInput = document.getElementById('morseAnswerInput');
    const submitMorseAnswerBtn = document.getElementById('submitMorseAnswerBtn');
    const morseCipherNotification = document.getElementById('morseCipherNotification');
    const morseAttemptsDisplay = document.getElementById('morseRemainingAttempts');
    const morseCipherRewardDisplay = document.getElementById('morseCipherRewardDisplay');
    const openMorseCipherBtn = document.getElementById('openMorseCipherBtn');

    let currentMorseCipher;
    let morseAttempts = 0;
    let morseSolved = false;
    const morseMaxAttempts = 3;
    const morsePenaltyAmount = 500; // Penalty for wrong answer
    let countdownTimeout = null;

    // Format time for display (HH:MM:SS)
    // تعريف العنصر المخصص لعرض المؤقت
const MorseCiphersCountdownDisplay = document.getElementById('MorseCiphersCountdown');

// عرض مؤقت العد التنازلي في العنصر المخصص
function startCountdownOnButton(seconds) {
    openMorseCipherBtn.disabled = true;

    // عرض العد التنازلي في العنصر puzzleCountdown
    const countdownDisplay = document.getElementById('MorseCiphersCountdown');
    countdownDisplay.innerText = ` ${formatTime(seconds)}`;

    // استهداف العنصر المحدد فقط باستخدام الـ ID
    const puzzleItem = document.getElementById('puzzle2'); // استهداف العنصر حسب ID
    puzzleItem.classList.add('inactive'); // إضافة الفئة "inactive" لتفعيل تأثير الضباب والتوهج

    function updateCountdown() {
        if (seconds > 0) {
            seconds--;
            countdownDisplay.innerText = ` ${formatTime(seconds)}`;
            setTimeout(updateCountdown, 1000);
        } else {
            // عند انتهاء الوقت، إزالة التأثيرات
            countdownDisplay.innerText = 'Puzzle available now!';

            // إزالة الفئة "inactive" وإضافة الفئة "active"
            puzzleItem.classList.remove('inactive'); // إزالة الفئة "inactive"
            puzzleItem.classList.add('active'); // إضافة الفئة "active"

            openMorseCipherBtn.disabled = false;
            openMorseCipherBtn.innerText = 'Open ';
        }
    }

    updateCountdown();
}

// صياغة الوقت (الساعات:الدقائق:الثواني)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

    
    // Load Morse ciphers from JSON file
    async function loadMorseCiphers() {
        try {
            const response = await fetch('MorseCiphers.json');
            if (!response.ok) throw new Error('Failed to load ciphers');
            const data = await response.json();
            return data.morse_ciphers;
        } catch (error) {
            console.error(error);
            showNotification(morseCipherNotification, 'Error loading cipher. Please try again later.');
        }
    }

    // Get today's Morse cipher based on the date and user's progress
    async function getTodaysMorseCipher() {
        try {
            const ciphers = await loadMorseCiphers();
            const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

            const { data, error } = await supabase
                .from('users')
                .select('morse_ciphers_progress')
                .eq('telegram_id', userTelegramId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching Morse cipher progress:', error);
                showNotification(morseCipherNotification, 'Error loading Morse cipher progress. Please try again later.');
                return null;
            }

            const ciphersProgress = data?.morse_ciphers_progress || {};
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            const lastSolvedTime = ciphersProgress.last_solved_time;

            // Check if the user has a 24-hour cooldown
            if (lastSolvedTime && new Date() - new Date(lastSolvedTime) < 24 * 60 * 60 * 1000) {
                const remainingTime = 24 * 60 * 60 - Math.floor((new Date() - new Date(lastSolvedTime)) / 1000);
                startCountdownOnButton(remainingTime);
                showNotification(morseCipherNotification, 'Please wait until tomorrow for a new cipher.');
                return null;
            }

            // Find cipher for today's date
            const todayCipher = ciphers.find(cipher => cipher.date === today);

            if (!todayCipher) {
                showNotification(morseCipherNotification, 'No cipher available for today.');
                return null;
            }

            return {
                cipher: todayCipher,
                attempts: ciphersProgress[todayCipher.id]?.attempts || 0,
                solved: ciphersProgress[todayCipher.id]?.solved || false
            };
        } catch (err) {
            console.error('Error in getTodaysMorseCipher:', err);
            showNotificationWithStatus(morseCipherNotification, 'Unexpected error. Please try again later.', 'lose');
            return null;
        }
    }

    // Display today's Morse cipher
    async function displayTodaysMorseCipher() {
        const cipherData = await getTodaysMorseCipher();
        if (!cipherData) return;

        currentMorseCipher = cipherData.cipher;
        morseAttempts = cipherData.attempts;
        morseSolved = cipherData.solved;

        morseCodeDisplay.innerText = currentMorseCipher.morse_code;
        morseCipherRewardDisplay.innerText = `Reward : ${currentMorseCipher.reward} coins`;
        showNotification(morseCipherNotification, `Hint : ${currentMorseCipher.hint}`);

        morseCipherContainer.classList.remove('hidden');
        updateMorseRemainingAttempts(morseAttempts);
    }

    // Check user's Morse cipher answer
    async function checkMorseCipherAnswer() {
        const userAnswer = morseAnswerInput.value.trim().toUpperCase();

        // Ensure the user entered an answer
        if (!userAnswer) {
            showNotification(morseCipherNotification, 'Please enter an answer before submitting.');
            return;
        }

        if (morseAttempts >= morseMaxAttempts || morseSolved) {
            showNotification(morseCipherNotification, 'You have no attempts left or already solved the cipher.');
            return;
        }

        if (userAnswer === currentMorseCipher.answer) {
            await handleSuccess();
        } else {
            morseAttempts++;
            updateMorseRemainingAttempts(morseAttempts);

            if (morseAttempts >= morseMaxAttempts) {
                handleMorseCipherTimeout();
            } else {
                showNotificationWithStatus(morseCipherNotification, "Incorrect answer. Try again.", 'lose');
                await updateMorseCipherProgress(currentMorseCipher.id, false, morseAttempts);
            }
        }
    }

    // Handle successful cipher solution
    async function handleSuccess() {
        showNotificationWithStatus(morseCipherNotification, `Correct! You've earned ${currentMorseCipher.reward} coins.` , 'win');
        updateBalance(currentMorseCipher.reward);
        morseSolved = true;
        await updateMorseCipherProgress(currentMorseCipher.id, true, morseAttempts);
        closeMorseCipher();
        startCountdownOnButton(24 * 60 * 60); // Start 24-hour countdown
    }

    // Update remaining attempts display
    function updateMorseRemainingAttempts(attempts) {
        morseAttemptsDisplay.innerText = morseMaxAttempts - attempts;
    }

    // Handle Morse cipher timeout or failed attempt
    function handleMorseCipherTimeout() {
        showNotificationWithStatus(morseCipherNotification, "You've failed to solve the Morse cipher.", 'lose');
        updateBalance(-morsePenaltyAmount);
        updateMorseCipherProgress(currentMorseCipher.id, false, morseMaxAttempts);
        closeMorseCipher();
        startCountdownOnButton(24 * 60 * 60); // Start 24-hour countdown
    }

    // Update user progress in database
    async function updateMorseCipherProgress(cipherId, solved, attempts) {
        try {
            const userTelegramId = uiElements.userTelegramIdDisplay.innerText;
            const lastSolvedTime = solved ? new Date().toISOString() : null;

            const { data, error } = await supabase
                .from('users')
                .select('morse_ciphers_progress')
                .eq('telegram_id', userTelegramId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching Morse cipher progress:', error);
                return;
            }

            const updatedProgress = {
                last_cipher_id: cipherId,
                solved_today: solved,
                attempts_today: attempts,
                last_solved_time: lastSolvedTime || data?.morse_ciphers_progress?.last_solved_time,
            };

            const { error: updateError } = await supabase
                .from('users')
                .update({ morse_ciphers_progress: updatedProgress })
                .eq('telegram_id', userTelegramId);

            if (updateError) {
                console.error('Error updating Morse cipher progress:', updateError);
            }
        } catch (err) {
            console.error('Error in updateMorseCipherProgress:', err);
        }
    }

    // Close Morse cipher modal
    function closeMorseCipher() {
        morseCipherContainer.classList.add('hidden');
        morseAnswerInput.value = '';
    }

    // Event Listeners
    submitMorseAnswerBtn.addEventListener('click', checkMorseCipherAnswer);
    openMorseCipherBtn.addEventListener('click', displayTodaysMorseCipher);
    morsecloseModal.addEventListener('click', closeMorseCipher);
});


    


 






/////////////////////////////////////

const img = document.getElementById('clickableImg');

img.addEventListener('click', (event) => {
    // الحصول على حجم الصورة وموقع النقر
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // حساب النسبة المئوية لموقع النقر لتحديد الدوران المطلوب بدقة
    const rotateX = ((y / rect.height) - 0.6) * -20; // لتعديل درجة الهبوط والصعود
    const rotateY = ((x / rect.width) - 0.6) * 20;   // لتعديل الاتجاه الأفقي

    // تطبيق التحويلات لإمالة الصورة حسب الموقع
    img.style.transform = `translateY(-5px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // إعادة الصورة إلى وضعها الطبيعي بعد فترة قصيرة
    setTimeout(() => {
        img.style.transform = 'translateY(-5px)';
    }, 300);
});
// إعادة ضبط تأثير الإمالة عند النقر مرة أخرى
img.addEventListener('transitionend', () => {
    img.style.transition = 'none'; // تعطيل الانتقال لإعادة تعيين الإمالة
});




/////////////////////////////////////////////////





const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://sawcoin.vercel.app/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

async function connectToWallet() {
    const connectedWallet = await tonConnectUI.connectWallet();
    // يمكنك تنفيذ بعض العمليات باستخدام connectedWallet إذا لزم الأمر
    console.log(connectedWallet);
}

async function checkConnection() {
    try {
        const isConnected = await tonConnectUI.isWalletConnected();
        
        if (!isConnected) {
            // إذا لم يتم الربط، أظهر واجهة الربط
            await connectToWallet();
        } else {
            console.log("Wallet is already connected.");
        }
    } catch (error) {
        console.error("Error checking wallet connection:", error);
    }
}

// استدعاء دالة التحقق عند تحميل الصفحة
checkConnection();

tonConnectUI.uiOptions = {
    twaReturnUrl: 'https://t.me/SAWCOIN_BOT/GAME'
};


//////////////////////////////////////////////////



document.addEventListener("DOMContentLoaded", function () {
    let coinCounter = 0;
    let autoIncrementInterval;

    function startGame(gameUrl) {
        const gameFrameContainer = document.getElementById("gameFrameContainer");
        const gameFrame = document.getElementById("gameFrame");
        const counterDisplay = document.getElementById("counterDisplay");
        const counterContainer = document.querySelector(".counter-container");

        if (gameFrameContainer && gameFrame && counterContainer) {
            gameFrame.src = gameUrl;
            gameFrameContainer.style.display = "flex";
            counterContainer.style.display = "flex";
            coinCounter = 0;
            counterDisplay.innerText = coinCounter;

            
            // بدء زيادة العداد تلقائيًا بمقدار 0.2 عملة كل ثانية
            autoIncrementInterval = setInterval(() => {
                coinCounter += 0.05;
                counterDisplay.innerText = coinCounter.toFixed(1); // عرض الرقم بفاصلة عشرية واحدة
                gameState.balance += 0.05;
                updateUI();
                saveGameState();
            }, 1000); // كل ثانية يتم زيادة 0.2 عملة
        }
    }
    
    function closeGameElements() {
        const gameFrameContainer = document.getElementById("gameFrameContainer");
        const gameFrame = document.getElementById("gameFrame");
        const counterContainer = document.querySelector(".counter-container");

        if (gameFrameContainer && gameFrame && counterContainer) {
            // إخفاء جميع العناصر الخاصة باللعبة باستثناء صفحة الألعاب
            gameFrameContainer.style.display = "none";
            gameFrame.src = ""; // إزالة مصدر اللعبة لإيقافها
            counterContainer.style.display = "none";

            // إيقاف الزيادة التلقائية عند إغلاق العناصر
            clearInterval(autoIncrementInterval);
        }
    }

    function claimCoins() {
        gameState.balance += coinCounter;
        updateUI(); // تحديث واجهة المستخدم
        showNotificationWithStatus(uiElements.purchaseNotification, `You've claimed ${coinCounter} coins!`, 'win');
        saveGameState();
        closeGameElements(); // إخفاء العناصر بعد الجمع
    }

    // إضافة مستمع زر الإغلاق
    document.getElementById("closeGamePage").addEventListener("click", closeGameElements);

    // تعيين الدوال في النطاق العام
    window.startGame = startGame;
    window.closeGamePage = closeGameElements;
    window.claimCoins = claimCoins;
});



/////////////////////////////////////////



document.addEventListener('DOMContentLoaded', function() {
    // تأكد من تعريف المتغير THEME 
    const THEME = TonConnectUi.THEME;

    // تهيئة واجهة Ton Connect UI مع التخصيصات
    const tonConnectUI = new TonConnectUi.TonConnectUI({
        uiPreferences: {
            theme: THEME.DARK,
            borderRadius: 's',
            colorsSet: {
                [THEME.DARK]: {
                    connectButton: {
                        background: '#000000'  // لون خلفية الزر في الثيم الداكن
                    }
                },
                [THEME.LIGHT]: {
                    text: {
                        primary: '#FF0000'   // لون النص في الثيم الفاتح
                    }
                }
            }
        }
    });

    // ربط واجهة Ton Connect UI بالعنصر المحدد
    tonConnectUI.render('#ton-connect');
});


//////////////////////////////////////////



const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeModal = document.getElementById("SettingscloseModal");

// إظهار نافذة الإعدادات عند النقر على زر الإعدادات
settingsButton.addEventListener("click", () => {
    settingsPanel.style.display = "block"; // إظهار اللوحة
});

// إخفاء نافذة الإعدادات عند النقر على زر الإغلاق
closeModal.addEventListener("click", () => {
    settingsPanel.style.display = "none"; // إخفاء اللوحة
});



//////////////////////



function updateAccountSummary() {
  // تحديث العناصر الأساسية
  const invitedCountElement = document.getElementById('invitedCount');
  const balanceDisplayElement = document.getElementById('balanceDisplay');
  const currentLevelNameElement = document.getElementById('currentLevelName');

  // تحديث النسخ داخل لوحة الإعدادات
  const settingsInvitedCount = document.getElementById('settingsInvitedCount');
  const settingsBalanceDisplay = document.getElementById('settingsBalanceDisplay');
  const settingsCurrentLevelName = document.getElementById('settingsCurrentLevelName');

  const currentLevelIndex = gameState.currentLevel - 1;
  const currentLevelName = levelThresholds[currentLevelIndex]?.name || 'Unknown';

  if (invitedCountElement) invitedCountElement.innerText = gameState.invites.length;
  if (balanceDisplayElement) balanceDisplayElement.innerText = gameState.balance;
  if (currentLevelNameElement) currentLevelNameElement.innerText = currentLevelName;

  // تحديث النسخ في لوحة الإعدادات
  if (settingsInvitedCount) settingsInvitedCount.innerText = gameState.invites.length;
  if (settingsBalanceDisplay) settingsBalanceDisplay.innerText = gameState.balance;
  if (settingsCurrentLevelName) settingsCurrentLevelName.innerText = currentLevelName;
}

document.addEventListener('DOMContentLoaded', () => {
  loadGameState();
  updateAccountSummary();
});



///////////////////////////////////////////


function showContent(contentId) {
    // Hide all content sections
    document.getElementById('tasksContent').style.display = 'none';
    document.getElementById('gamesContent').style.display = 'none';

    // Remove active class from all switch buttons
    document.getElementById('tasksContentButton').classList.remove('active');
    document.getElementById('gamesContentButton').classList.remove('active');

    // Show selected content and add active class to corresponding button
    document.getElementById(contentId).style.display = 'block';
    if (contentId === 'tasksContent') {
        document.getElementById('tasksContentButton').classList.add('active');
    } else {
        document.getElementById('gamesContentButton').classList.add('active');
    }
}

///////////////////////////////////////



function updateBalances() {
  const balance = gameState.balance; // الحصول على الرصيد الحالي من حالة اللعبة
  const formattedBalance = balance.toLocaleString(); // تنسيق الرصيد بإضافة فواصل الآلاف
  
  // تحديث كل عناصر عرض الرصيد
  const elements = [
    'tasksBalanceDisplay',
    'levelBalanceDisplay',
    'gameBalanceDisplay',
    'walletBalanceDisplay',
    'puzzlesBalanceDisplay',
    'boostsBalanceDisplay',
    'AccountBalanceDisplay'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.innerText = formattedBalance;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadGameState();  // تحميل حالة اللعبة
  updateBalances();  // تحديث الأرصدة بعد تحميل حالة اللعبة
  updateAccountSummary(); // تحديث نافذة الإعدادات
});



/////////////////////////////////////////////




////////////////////////////////////////////////


// تعريف العناصر
const hourlyEarningsElement = document.getElementById('hourlyEarnings');  // العنصر لعرض الربح في الساعة
const earningsTextElement = document.getElementById('earningsText');  // العنصر لعرض النص فقط
let totalEarnings = 0; // إجمالي الأرباح المتراكمة
let lastActionTime = Date.now(); // وقت آخر نشاط (بداية التتبع)

// تحديث الربح في الساعة بناءً على النشاط المستمر
function updateHourlyEarnings() {
  const currentTime = Date.now();
  const hoursPassed = (currentTime - lastActionTime) / (1000 * 60 * 60); // حساب الوقت المنقضي بالساعة

  // حساب الربح في الساعة بناءً على النشاط
  const earningsPerHour = totalEarnings / hoursPassed; 
  earningsTextElement.textContent = `${earningsPerHour.toFixed(2)}/hr`; // عرض الربح في الساعة
}

// تتبع النشاط وزيادة الأرباح بناءً على النشاط
function trackActivity(earnings) {
  const currentTime = Date.now();
  
  // زيادة إجمالي الأرباح بناءً على النشاط
  totalEarnings += earnings;
  
  // تحديث الربح في الساعة بناءً على الوقت المنقضي
  updateHourlyEarnings();
  
  lastActionTime = currentTime; // تحديث وقت آخر نشاط
}

// تحديث الربح في الساعة بشكل دوري كل دقيقة
setInterval(updateHourlyEarnings, 60000);  // تحديث الربح كل دقيقة



/////////////////////////////////////////


    



 
document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM الضرورية
    const dailyButton = document.getElementById('DailyButton');
    const dailyCloseModal = document.getElementById('logindailycloseModal');
    const logindailyContainer = document.getElementById('logindailyContainer');
    const logindailyContent = document.querySelector('.logindaily-content');
    const loginClaimBtn = document.getElementById('loginclaimBtn');
    const loginNotification = document.getElementById('login');
    const dayElements = document.querySelectorAll('.daily-item');

    // مكافآت الأيام المتتالية
    const dailyRewards = [5000, 10000, 15000, 30000, 60000, 100000, 200000, 300000, 400000];

    // الدالة الرئيسية لتسجيل الدخول اليومي - تأخذ معرف المستخدم كمعامل
    async function handleDailyLogin(userTelegramId) {
        // جلب بيانات المستخدم من قاعدة البيانات
        const { data, error } = await supabase
            .from('users')
            .select('last_login_date, consecutive_days, balance')
            .eq('telegram_id', userTelegramId)
            .maybeSingle();

        if (error || !data) {
            console.error('Error fetching user data or user data not found:', error);
            loginNotification.innerText = 'Error loading daily login. Please try again later.';
            return;
        }

        let { last_login_date, consecutive_days } = data;
        const today = new Date().toISOString().split('T')[0]; // تاريخ اليوم الحالي

        // التحقق من حالة تسجيل الدخول اليومي
        if (last_login_date === today) {
            loginNotification.innerText = 'You have already claimed today\'s reward.';
            disableClaimButton();
            highlightRewardedDays(consecutive_days);
            return;
        }

        // التحقق من استمرارية الأيام المتتالية
        const lastLoginDateObj = new Date(last_login_date);
        const timeDiff = new Date(today) - lastLoginDateObj;
        const isConsecutive = timeDiff === 86400000; // 24 ساعة بالمللي ثانية

        if (isConsecutive) {
            consecutive_days++;
            if (consecutive_days > dailyRewards.length) consecutive_days = dailyRewards.length;
        } else {
            consecutive_days = 1; // إعادة تعيين إلى اليوم الأول إذا فات المستخدم يوم
        }

        // إضافة المكافأة للمستخدم بناءً على عدد الأيام المتتالية
        const reward = dailyRewards[consecutive_days - 1];
        updateBalance(reward);

        // تحديث واجهة المستخدم
        loginNotification.innerText = `Day ${consecutive_days}: You've earned ${reward} coins!`;
        updateClaimButton(consecutive_days, reward);
        highlightRewardedDays(consecutive_days);

        // تحديث قاعدة البيانات
        await updateDailyLoginInDatabase(userTelegramId, today, consecutive_days);
    }

    // تحديث زر المطالبة بالمكافأة
    function updateClaimButton(day, reward) {
        loginClaimBtn.innerText = `Claim Day ${day} Reward: ${reward}`;
        loginClaimBtn.disabled = false;
    }

    // تعطيل الزر بعد المطالبة بالمكافأة
    function disableClaimButton() {
        loginClaimBtn.disabled = true;
        loginClaimBtn.classList.add('disabled');
    }

    // تحديث واجهة الأيام المتتالية
    function highlightRewardedDays(dayCount) {
        dayElements.forEach((el, index) => {
            if (index < dayCount) {
                el.classList.add('claimed');
                el.style.filter = 'blur(2px)';
            } else {
                el.classList.remove('claimed');
                el.style.filter = 'none';
            }
        });
    }

    // تحديث بيانات المستخدم في قاعدة البيانات
    async function updateDailyLoginInDatabase(userTelegramId, today, consecutive_days) {
        const { error } = await supabase
            .from('users')
            .update({
                last_login_date: today,
                consecutive_days: consecutive_days
            })
            .eq('telegram_id', userTelegramId);

        if (error) {
            console.error('Error updating daily login data:', error);
            loginNotification.innerText = 'Error saving progress. Please try again later.';
        } else {
            console.log('Database updated successfully');
        }
    }

    // تحديث الرصيد
    function updateBalance(amount) {
        gameState.balance += amount;
        updateUI(); // تحديث واجهة المستخدم
        saveGameState(); // حفظ حالة اللعبة
    }

    // فتح نافذة تسجيل الدخول اليومي
    function openDailyLoginModal(userTelegramId) {
        logindailyContainer.classList.remove('hidden');
        logindailyContent.classList.remove('hidden');
        handleDailyLogin(userTelegramId);
    }

    // إغلاق نافذة تسجيل الدخول اليومي
    dailyCloseModal.addEventListener('click', function () {
        logindailyContainer.classList.add('hidden');
        logindailyContent.classList.add('hidden');
    });

    // عند الضغط على زر المطالبة بالمكافأة
    loginClaimBtn.addEventListener('click', async function () {
        const userTelegramId = "معرف المستخدم المحفوظ"; // تأكد من جلب معرف المستخدم من المكان الذي تم جلبه فيه مسبقًا
        await handleDailyLogin(userTelegramId);
        disableClaimButton();
    });

    // فتح النافذة عند دخول المستخدم
    dailyButton.addEventListener('click', function () {
        const userTelegramId = "معرف المستخدم المحفوظ"; // تأكد من جلب معرف المستخدم من المكان الذي تم جلبه فيه مسبقًا
        openDailyLoginModal(userTelegramId);
    });
});






//////////////////////////////////////




//localStorage.removeItem('gameState'); // مسح حالة اللعبة
//loadGameState(); // إعادة تحميل حالة اللعبة




//////////////////////////////////////////////////////////



// تفعيل التطبيق
initializeApp();



