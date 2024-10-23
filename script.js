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
    energy: 10000,
    maxEnergy: 10000,
    clickMultiplier: 1,
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

// مستويات اللعبة
const levelThresholds = [
    { level: 1, threshold: 100000, name: 'junior' },
    { level: 2, threshold: 300000, name: 'Challenge' },
    { level: 3, threshold: 700000, name: 'Develop' },
    { level: 4, threshold: 1000000, name: 'Intro' },
    { level: 5, threshold: 2000000, name: 'Advanced' },
    { level: 6, threshold: 4000000, name: 'Expert' },
    { level: 7, threshold: 7000000, name: 'Master' },
    { level: 8, threshold: 10000000, name: 'Ultimate' },
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
    }, 2000); // 10000 ميلي ثانية تعني 10 ثوانٍ

        
        // استمع إلى التغييرات في البيانات
        listenToRealtimeChanges();

        // إعداد واجهة المستخدم
        updateUI();
        registerEventHandlers();
        startEnergyRecovery();
        
        console.log('App initialized successfully.');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification(uiElements.purchaseNotification, 'Failed to initialize app.');
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
        uiElements.balanceDisplay.innerText = formatNumber(gameState.balance);
    }

    if (uiElements.diamondBalanceDisplay) {
        uiElements.diamondBalanceDisplay.innerText = formatNumber(gameState.diamonds);
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

    if (uiElements.withdrawBtn) {
        uiElements.withdrawBtn.addEventListener('click', () => {
            showNotification(uiElements.purchaseNotification, 'Coming Soon!');
        });
    }

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

// عرض الإشعارات للمستخدم
function showNotification(notificationElement, message) {
    if (!notificationElement) return;
    notificationElement.innerText = message;
    notificationElement.classList.add('show');
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 4000);
}


// عرض النافذة المنبثقة بناءً على نوع الترقية (النقر أو العملات)
function showUpgradeModal(upgradeType) {
    if (uiElements.upgradeModal) {
        uiElements.upgradeModal.style.display = 'block';
        uiElements.upgradeModal.setAttribute('data-upgrade-type', upgradeType);

        let cost;
        if (upgradeType === 'boost') {
            cost = gameState.boostLevel * 4000 + 500;
            uiElements.upgradeText.innerText = `Are you sure you want to upgrade your click multiplier? It will cost ${cost} coins.`;
            uiElements.currentLevel.innerText = `Current Click Multiplier: ×${gameState.clickMultiplier}`;
        } else if (upgradeType === 'coin') {
            cost = gameState.coinBoostLevel * 4000 + 500;
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
        cost = gameState.boostLevel * 4000 + 500;
    } else if (upgradeType === 'coin') {
        cost = gameState.coinBoostLevel * 4000 + 500;
    }

    // التحقق إذا كان لدى المستخدم ما يكفي من العملات للترقية
    if (gameState.balance >= cost) {
        gameState.balance -= cost;  // خصم تكلفة الترقية

        // زيادة المستوى بعد الترقية
        if (upgradeType === 'boost') {
            gameState.boostLevel += 1;
            gameState.clickMultiplier += 1;
        } else if (upgradeType === 'coin') {
            gameState.coinBoostLevel += 1;
            gameState.maxEnergy += 5000;
        }

        // تحديث واجهة المستخدم والإشعارات بعد الترقية
        updateUI();
        showNotification(uiElements.purchaseNotification, `Successfully upgraded!`);
        updateUserData();
        saveGameState();
    } else {
        showNotification(uiElements.purchaseNotification, `Not enough coins!`);
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
function handleClick(event) {
    event.preventDefault(); // منع الأحداث المكررة
    const touchPoints = event.touches || [event];

    for (let i = 0; i < touchPoints.length; i++) {
        const touch = touchPoints[i];
        createDiamondCoinEffect(touch.pageX, touch.pageY);
    }

    if (gameState.energy >= gameState.clickMultiplier * touchPoints.length) {
        gameState.balance += gameState.clickMultiplier * touchPoints.length;
        gameState.energy -= gameState.clickMultiplier * touchPoints.length;
        updateUI();
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

// تحديث عرض المستويات
function updateLevelDisplay() {
    checkForLevelUp();
    if (uiElements.levelInfoDisplay) {
        uiElements.levelInfoDisplay.innerText = `You are currently on level ${gameState.currentLevel}`;
    }
    document.querySelectorAll('.level-item').forEach(item => {
        item.classList.remove('current-level');
    });
    const currentLevelElement = document.getElementById(`level${gameState.currentLevel}`);
    if (currentLevelElement) currentLevelElement.classList.add('current-level'); // إضافة حواف فضية للمستوى الحالي

    if (uiElements.levelOneProgress) uiElements.levelOneProgress.style.width = `${(gameState.balance / levelThresholds[0].threshold) * 100}%`;
    if (uiElements.levelTwoProgress) uiElements.levelTwoProgress.style.width = `${(gameState.balance / levelThresholds[1].threshold) * 100}%`;
    if (uiElements.levelThreeProgress) uiElements.levelThreeProgress.style.width = `${(gameState.balance / levelThresholds[2].threshold) * 100}%`;
    if (uiElements.levelFourProgress) uiElements.levelFourProgress.style.width = `${(gameState.balance / levelThresholds[3].threshold) * 100}%`;
    if (uiElements.levelFiveProgress) uiElements.levelFiveProgress.style.width = `${(gameState.balance / levelThresholds[4].threshold) * 100}%`;
    if (uiElements.levelSixProgress) uiElements.levelSixProgress.style.width = `${(gameState.balance / levelThresholds[5].threshold) * 100}%`;
    if (uiElements.levelSevenProgress) uiElements.levelSevenProgress.style.width = `${(gameState.balance / levelThresholds[6].threshold) * 100}%`;
    if (uiElements.levelEightProgress) uiElements.levelEightProgress.style.width = `${(gameState.balance / levelThresholds[7].threshold) * 100}%`;
}

// تحديث عرض التحسينات
function updateBoostsDisplay() {
    const boostUpgradeCost = gameState.boostLevel * 2000 + 500;
    const coinUpgradeCost = gameState.coinBoostLevel * 2000 + 500;

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
        } else {
            uiElements.friendsListDisplay.innerHTML = '<li>No friends invited yet.</li>';
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
    const inviteLink = `https://t.me/share/url?text=Join Jigsaw's Game and earn 50,000 coins!&url=https://t.me/SAWCOIN_BOT?start=${uiElements.userTelegramIdDisplay?.innerText || ''}`;
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
            morse_ciphers_progress: gameState.ciphersProgress
            
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


//

// أولاً: الحصول على جميع الأزرار داخل القائمة
const buttons = document.querySelectorAll('.menu button');

// ثانياً: إضافة مستمع للأحداث (Event Listener) لكل زر بحيث يستمع للنقرات
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // عند النقر على زر، يتم إزالة الصف "active" من جميع الأزرار
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // إضافة الصف "active" للزر الذي تم النقر عليه
        this.classList.add('active');
        
        // الحصول على اسم الصفحة أو القسم المستهدف من الزر الذي تم النقر عليه
        const targetPage = this.getAttribute('data-target');
        
        // هنا يمكنك وضع المنطق الذي يقوم بتغيير الصفحة بناءً على الزر (استبدل هذا المنطق إذا لزم الأمر)
        // مثال: الانتقال إلى صفحة معينة بناءً على اسم الـ "data-target"
        // window.location.href = targetPage + ".html";
        console.log("التنقل إلى الصفحة:", targetPage); // هذا فقط للعرض في الكونسول
    });
});

// ثالثاً: اختياري: تفعيل الزر النشط بناءً على الصفحة الحالية
const currentPage = window.location.pathname; // هذا يحصل على اسم الصفحة الحالية من الـ URL
buttons.forEach(button => {
    const target = button.getAttribute('data-target'); // الحصول على قيمة "data-target" من كل زر
    if (currentPage.includes(target)) {
        button.classList.add('active'); // إضافة الصف "active" للزر الذي يتطابق مع الصفحة الحالية
    }
});

//






document.addEventListener('DOMContentLoaded', () => {
    const taskContainer = document.getElementById('taskcontainer');
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    // Fetch tasks from JSON file
    fetch('tasks.json')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                // Create task element
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-item');

                // Add task image
                const img = document.createElement('img');
                img.src = task.image;
                img.alt = 'Task Image';
                img.classList.add('task-img');
                taskElement.appendChild(img);

                // Add task description
                const description = document.createElement('p');
                description.textContent = task.description;
                taskElement.appendChild(description);

                // Add task reward text
                const rewardText = document.createElement('p');
                rewardText.textContent = `Reward : ${task.reward} `;
                taskElement.appendChild(rewardText);

                // Create the button for the task
                const button = document.createElement('button');
                button.classList.add('task-button');
                button.setAttribute('data-task-id', task.id);
                button.setAttribute('data-url', task.url);
                button.setAttribute('data-reward', task.reward);
                taskElement.appendChild(button);

                taskContainer.appendChild(taskElement);

                // Handle task progress and button click
                const taskId = task.id;
                const taskurl = task.url;
                const taskReward = task.reward;

                const taskProgressData = gameState.tasksprogress.find(t => t.task_id === taskId);
                let taskProgress = taskProgressData ? taskProgressData.progress : 0;

                // Set button text based on task progress
                button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : 'Go';
                button.disabled = taskProgress >= 2;

                // Button click handling
                button.onclick = () => {
                    if (taskProgress === 0) {
                        // Open task link using Telegram's WebApp API
                        openTaskLink(taskurl);
                        taskProgress = 1;
                        updateTaskProgressInGameState(taskId, taskProgress);
                        button.textContent = 'Verify';
                        showNotification(uiElements.purchaseNotification, 'Task opened. Verify to claim your reward.');
                    } else if (taskProgress === 1) {
                        taskProgress = 2;
                        updateTaskProgressInGameState(taskId, taskProgress);
                        button.textContent = 'Claim';
                        showNotification(uiElements.purchaseNotification, 'Task verified. You can now claim the reward.');
                    } else if (taskProgress === 2) {
                        claimTaskReward(taskId, taskReward);
                        button.textContent = 'Completed';
                        button.disabled = true;
                        showNotification(uiElements.purchaseNotification, 'Reward successfully claimed!');
                    }
                };
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
});

// Open task link function
function openTaskLink(taskurl) {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.openLink(taskurl, { try_instant_view: true });
    } else {
        window.open(taskurl, '_blank');
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
    saveGameState(); // Save the updated game state
}

// Claim the task reward and update balance
function claimTaskReward(taskId, reward) {
    const task = gameState.tasksprogress.find(task => task.task_id === taskId);

    if (task && task.claimed) {
        showNotification(uiElements.purchaseNotification, 'You have already claimed this reward.');
        return;
    }

    // Update the user's balance in gameState
    gameState.balance += reward;
    if (task) {
        task.claimed = true;
    } else {
        gameState.tasksprogress.push({ task_id: taskId, progress: 2, claimed: true });
    }

    updateUI(); // Update the UI
    showNotification(uiElements.purchaseNotification, `Successfully claimed ${reward} coins!`);
    updateUserData(); // Sync user data with the server
    saveGameState(); // Ensure the game state is saved
}








//

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

//localStorage.removeItem('gameState'); // مسح حالة اللعبة
//loadGameState(); // إعادة تحميل حالة اللعبة
//


    
// DOM Elements
const puzzlecloseModal = document.getElementById('puzzlecloseModal');
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const remainingAttemptsDisplay = document.getElementById('attemptsDisplay');
const puzzleRewardDisplay = document.getElementById('puzzleRewardDisplay');

// Game state
let currentPuzzle;
let attempts = 0;
let puzzleSolved = false;
let countdownInterval;
const maxAttempts = 3;
const penaltyAmount = 500; // Penalty for wrong answer

// Load puzzles from JSON file
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json');
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles.slice(0, 3); // Select 3 daily puzzles
    } catch (error) {
        console.error(error);
        showNotification(puzzleNotification, 'Error loading puzzle. Please try again later.');
    }
}

// Get today's puzzle
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // Assuming the first puzzle is today's puzzle
}

// Display today's puzzle
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles();
    currentPuzzle = getTodaysPuzzle(puzzles);

    const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

    // Fetch user puzzle progress from database
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

    // Check if the user has solved or exhausted attempts for today's puzzle
    if (puzzleProgress?.attempts >= maxAttempts || puzzleProgress?.solved) {
        showNotification(puzzleNotification, 'You have already solved or failed today\'s puzzle. Please come back tomorrow.');
        return;
    }

    // Display question, hint, and reward
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint : ${currentPuzzle.hint}`;
    puzzleRewardDisplay.innerText = `Reward : ${currentPuzzle.reward} coins`;

    // Display options as buttons
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden');
    updateRemainingAttempts(puzzleProgress?.attempts || 0);
    startCountdown();
}

// Timer function
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

// Handle puzzle timeout
function handlePuzzleTimeout() {
    clearInterval(countdownInterval);
    showNotification(puzzleNotification, "Time's up! You failed to solve the puzzle.");
    updateBalance(-penaltyAmount); // Deduct coins
    updatePuzzleProgressInDatabase(currentPuzzle.id, false, maxAttempts); // Update puzzle progress
    closePuzzle();
}

// Check user's answer
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

// Handle correct answer
function handlePuzzleSuccess() {
    clearInterval(countdownInterval);

    const puzzleReward = currentPuzzle.reward;
    showNotification(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`);
    updateBalance(puzzleReward);

    updatePuzzleProgressInDatabase(currentPuzzle.id, true, attempts); // Update puzzle progress in database

    puzzleSolved = true;
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
}

// Handle wrong answer
function handlePuzzleWrongAnswer() {
    attempts++;
    updateRemainingAttempts(attempts);

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval);
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount);
        updatePuzzleProgressInDatabase(currentPuzzle.id, false, maxAttempts); // Record failed attempt
        closePuzzle();
    } else {
        showNotification(puzzleNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// Update puzzle progress in database
async function updatePuzzleProgressInDatabase(puzzleId, solved, attempts) {
    const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

    // Fetch user's current progress from database
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

    // Update or add current puzzle progress
    puzzlesProgress[puzzleId] = {
        solved: solved,
        attempts: attempts
    };

    // Update data in the database
    const { updateError } = await supabase
        .from('users')
        .update({ puzzles_progress: puzzlesProgress })
        .eq('telegram_id', userTelegramId);

    if (updateError) {
        console.error('Error updating puzzle progress:', updateError);
    }
}

// Update remaining attempts display
function updateRemainingAttempts(attempts = 0) {
    remainingAttemptsDisplay.innerText = `${maxAttempts - attempts}/${maxAttempts} `;
}

// Update balance in gameState
function updateBalance(amount) {
    gameState.balance += amount;
    updateUI(); // Update UI
    saveGameState(); // Save game state
}

// Close puzzle
function closePuzzle() {
    clearInterval(countdownInterval); // Stop timer on close
    puzzleContainer.classList.add('hidden');
    puzzleOptions.innerHTML = '';
    puzzleNotification.innerText = '';
    attempts = 0;
    puzzleSolved = false;
}

// Event listeners
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






// إظهار النافذة المنبثقة عند الضغط على زر البرومو كود
document.getElementById('promoCodeBtn').addEventListener('click', () => {
    document.getElementById('promoCodeModal').style.display = 'block';
});

// إغلاق النافذة عند الضغط على زر الإغلاق
document.getElementById('closepromoBtn').addEventListener('click', () => {
    document.getElementById('promoCodeModal').style.display = 'none';
});

// التحقق من البرومو كود عند الضغط على زر "Apply"
document.getElementById('applyPromoCode').addEventListener('click', async () => {
    const enteredCode = document.getElementById('promoCodeInput').value;

    // تحميل البرومو كود من ملف JSON
    const response = await fetch('promocodes.json');
    const promoData = await response.json();
    const promoCodes = promoData.promoCodes;

    // تحقق مما إذا كان المستخدم قد استخدم هذا البرومو كود من قبل
    if (gameState.usedPromoCodes && gameState.usedPromoCodes.includes(enteredCode)) {
        showNotification(uiElements.purchaseNotification, 'You have already used this promo code.');
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

        // إظهار إشعار بالنجاح
        showNotification(uiElements.purchaseNotification, `Successfully added ${reward} coins to your balance!`);

        // إخفاء النافذة بعد الاستخدام
        document.getElementById('promoCodeModal').style.display = 'none';

        // حفظ حالة اللعبة بعد إضافة المكافأة
        saveGameState();
    } else {
        showNotification(uiElements.purchaseNotification, 'Invalid promo code.');
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

    const countdownKey = 'morseCipherCountdownEndTime'; // Key for saving the countdown end time

    // Check if countdown is active and resume if necessary
    function checkCountdown() {
        const countdownEndTime = localStorage.getItem(countdownKey);
        if (countdownEndTime) {
            const remainingTime = new Date(countdownEndTime) - new Date();
            if (remainingTime > 0) {
                startCountdownOnButton(Math.floor(remainingTime / 1000));
                return true; // Countdown is still active
            } else {
                localStorage.removeItem(countdownKey); // Clear expired countdown
            }
        }
        return false; // No active countdown
    }

    // Save countdown end time to local storage
    function start24HourCountdown() {
        const countdownEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
        localStorage.setItem(countdownKey, countdownEndTime);
        startCountdownOnButton(24 * 60 * 60); // Start 24-hour countdown
    }

    // Start countdown on the button
    function startCountdownOnButton(seconds) {
        openMorseCipherBtn.disabled = true;
        openMorseCipherBtn.innerText = `Next cipher in: ${formatTime(seconds)}`;

        function updateButtonCountdown() {
            if (seconds > 0) {
                seconds--;
                openMorseCipherBtn.innerText = `Next cipher in: ${formatTime(seconds)}`;
                countdownTimeout = setTimeout(updateButtonCountdown, 1000);
            } else {
                openMorseCipherBtn.disabled = false;
                openMorseCipherBtn.innerText = 'Open Morse Cipher';
                localStorage.removeItem(countdownKey); // Clear countdown when finished
            }
        }

        updateButtonCountdown();
    }

    // Format time for display (HH:MM:SS)
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Load Morse ciphers from JSON file
    async function loadMorseCiphers() {
        try {
            const response = await fetch('Caesar.json');
            if (!response.ok) throw new Error('Failed to load ciphers');
            const data = await response.json();
            return data.morse_ciphers;
        } catch (error) {
            console.error(error);
            showNotification(morseCipherNotification, 'Error loading cipher. Please try again later.');
        }
    }

    // Get today's Morse cipher based on user's progress
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
            const lastCipherId = ciphersProgress.last_cipher_id || null;
            const attemptsToday = ciphersProgress.attempts_today || 0;
            const solvedToday = ciphersProgress.solved_today || false;
            const lastSolvedTime = ciphersProgress.last_solved_time || null;

            // Check for 24-hour cooldown
            if (lastSolvedTime && new Date() - new Date(lastSolvedTime) < 24 * 60 * 60 * 1000) {
                showNotification(morseCipherNotification, 'Please wait until tomorrow for a new cipher.');
                return null;
            }

            if (solvedToday || attemptsToday >= morseMaxAttempts) {
                showNotification(morseCipherNotification, 'You have used all attempts today or already solved the cipher.');
                return null;
            }

            let nextCipher;
            if (lastCipherId === null) {
                nextCipher = ciphers[0]; // Start with the first cipher
            } else {
                const currentCipherIndex = ciphers.findIndex(c => c.id === lastCipherId);
                nextCipher = ciphers[(currentCipherIndex + 1) % ciphers.length];
            }

            return {
                cipher: nextCipher,
                attempts: attemptsToday,
                solved: solvedToday,
            };
        } catch (err) {
            console.error('Error in getTodaysMorseCipher:', err);
            showNotification(morseCipherNotification, 'Unexpected error. Please try again later.');
            return null;
        }
    }

    // Display today's Morse cipher
    async function displayTodaysMorseCipher() {
        if (checkCountdown()) return; // If countdown is active, don't show the cipher

        const cipherData = await getTodaysMorseCipher();
        if (!cipherData) return;

        currentMorseCipher = cipherData.cipher;
        morseAttempts = cipherData.attempts;
        morseSolved = cipherData.solved;

        morseCodeDisplay.innerText = currentMorseCipher.morse_code;
        morseCipherRewardDisplay.innerText = `Reward: ${currentMorseCipher.reward} coins`;
        showNotification(morseCipherNotification, `Hint: ${currentMorseCipher.hint}`);

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
                showNotification(morseCipherNotification, "Incorrect answer. Try again.");
                await updateMorseCipherProgress(currentMorseCipher.id, false, morseAttempts);
            }
        }
    }

    // Handle successful cipher solution
    async function handleSuccess() {
        showNotification(morseCipherNotification, `Correct! You've earned ${currentMorseCipher.reward} coins.`);
        updateBalance(currentMorseCipher.reward);
        morseSolved = true;
        await updateMorseCipherProgress(currentMorseCipher.id, true, morseAttempts);
        closeMorseCipher();
        start24HourCountdown(); // Start the countdown
    }

    // Update remaining attempts display
    function updateMorseRemainingAttempts(attempts) {
        morseAttemptsDisplay.innerText = morseMaxAttempts - attempts;
    }

    // Handle Morse cipher timeout or failed attempt
    function handleMorseCipherTimeout() {
        showNotification(morseCipherNotification, "You've failed to solve the Morse cipher.");
        updateBalance(-morsePenaltyAmount);
        updateMorseCipherProgress(currentMorseCipher.id, false, morseMaxAttempts);
        closeMorseCipher();
        start24HourCountdown(); // Start the countdown after failure
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















// DOM Elements for Caesar Cipher
const caesarStartButton = document.getElementById('CaesarBtn');
const caesarContainer = document.getElementById('CaesarContainer');
const caesarQuestionDisplay = document.getElementById('CaesarQuestion');
const caesarCipherDisplay = document.getElementById('CaesarCipherDisplay');
const caesarShiftDisplay = document.getElementById('CaesarShiftDisplay');
const caesarSolutionInput = document.getElementById('CaesarSolutionInput');
const caesarSubmitButton = document.getElementById('CaesarSubmitBtn');
const caesarRewardDisplay = document.getElementById('CaesarRewardDisplay');
const caesarNotification = document.getElementById('purchaseNotification');
const caesarAttemptsDisplay = document.getElementById('CaesarAttemptsDisplay');
const caesarCountdownDisplay = document.getElementById('CaesarCountdownDisplay');

// Game state for Caesar Cipher
let activeCaesarCipher;
let caesarSolved = false;
let caesarAttempts = 3; // ثلاث محاولات للمستخدم
let countdownInterval;
const COUNTDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 ساعة

// Load Caesar Cipher puzzles from JSON file
async function loadCaesarPuzzles() {
    try {
        const response = await fetch('Caesar.json');
        if (!response.ok) throw new Error('Failed to load Caesar Cipher puzzles');
        const data = await response.json();
        return data; // Return all Caesar puzzles
    } catch (error) {
        showNotification(caesarNotification, 'Error loading Caesar puzzles. Please try again later.');
        console.error(error);
    }
}

// Get a specific Caesar Cipher puzzle by its ID
function getCaesarPuzzleById(puzzles, id) {
    return puzzles.find(puzzle => puzzle.CaesarPuzzleID === id);
}

// Display the Caesar Cipher puzzle
async function displayCaesarPuzzle() {
    const puzzles = await loadCaesarPuzzles();
    const lastFailureTime = await getLastFailureTimeFromDB();

    if (lastFailureTime) {
        const now = new Date();
        const timeElapsed = now - new Date(lastFailureTime);
        if (timeElapsed < COUNTDOWN_DURATION) {
            startCaesarCountdown(COUNTDOWN_DURATION - timeElapsed);
            return;
        }
    }

    activeCaesarCipher = getNextPuzzle(puzzles); // عرض اللغز التالي

    if (!activeCaesarCipher) {
        showNotification(caesarNotification, 'No available puzzles. Please try again later.');
        return;
    }

    // Display the puzzle cipher, shift, description, and reward
    caesarQuestionDisplay.innerText = activeCaesarCipher.description;
    caesarCipherDisplay.innerText = `Cipher: ${activeCaesarCipher.ciphers}`;
    caesarShiftDisplay.innerText = `Shift: ${activeCaesarCipher.shift}`;
    caesarRewardDisplay.innerText = `Reward: ${activeCaesarCipher.reward} coins`;

    caesarContainer.classList.remove('hidden');
    caesarAttemptsDisplay.innerText = `Attempts left: ${caesarAttempts}`;
    caesarCountdownDisplay.classList.add('hidden');
    caesarStartButton.disabled = true; // قفل زر الشيفرة أثناء اللعب
}

// Check the user's solution for the Caesar Cipher puzzle
function checkCaesarSolution() {
    const userSolution = caesarSolutionInput.value.trim();

    if (caesarSolved) {
        showNotification(caesarNotification, 'You have already solved this puzzle.');
        return;
    }

    if (userSolution === activeCaesarCipher.solution) {
        handleCaesarCorrectAnswer();
    } else {
        handleCaesarIncorrectAnswer();
    }
}

// Handle the correct solution for the Caesar Cipher puzzle
function handleCaesarCorrectAnswer() {
    caesarSolved = true;
    showNotification(caesarNotification, `Correct! You've earned ${activeCaesarCipher.reward} coins.`);
    updateCaesarPuzzleProgressInDB(activeCaesarCipher.CaesarPuzzleID, true);
    loadNextCaesarPuzzle(); // عرض اللغز التالي بعد الفوز
}

// Handle incorrect answer and track attempts
function handleCaesarIncorrectAnswer() {
    caesarAttempts--;
    caesarAttemptsDisplay.innerText = `Attempts left: ${caesarAttempts}`;

    if (caesarAttempts === 0) {
        showNotification(caesarNotification, 'You have used all attempts. Please try again tomorrow.');
        lockCaesarPuzzle(); // قفل اللغز بعد فشل المحاولات الثلاث
    } else {
        showNotification(caesarNotification, 'Incorrect answer. Try again.');
    }
}

// Lock Caesar Cipher puzzle and start countdown
function lockCaesarPuzzle() {
    caesarSolved = true;
    caesarContainer.classList.add('hidden');
    updateLastFailureTimeInDB(); // تسجيل وقت الفشل في قاعدة البيانات
    startCaesarCountdown(COUNTDOWN_DURATION);
}

// Start countdown for the next Caesar Cipher puzzle
function startCaesarCountdown(timeLeft) {
    caesarCountdownDisplay.classList.remove('hidden');

    countdownInterval = setInterval(() => {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        caesarCountdownDisplay.innerText = `Next puzzle available in: ${hours}h ${minutes}m ${seconds}s`;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showNotification(caesarNotification, 'A new Caesar Cipher puzzle is now available.');
            caesarStartButton.disabled = false; // إعادة تفعيل الزر بعد انتهاء العد التنازلي
        }

        timeLeft -= 1000;
    }, 1000);
}

// Get the next unsolved/unattempted puzzle
function getNextPuzzle(puzzles) {
    const solvedPuzzles = getUserSolvedPuzzlesFromDB(); // Get the list of solved/attempted puzzles

    const unsolvedPuzzle = puzzles.find(puzzle => !solvedPuzzles.includes(puzzle.CaesarPuzzleID));
    return unsolvedPuzzle || null;
}

// Update user progress in the database for Caesar Cipher puzzle
async function updateCaesarPuzzleProgressInDB(puzzleId, solved) {
    const userTelegramId = document.getElementById('userTelegramId').innerText;

    const { data, error } = await supabase
        .from('users')
        .select('caesar_puzzle_progress') // Assuming this field exists
        .eq('telegram_id', userTelegramId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching Caesar puzzle progress:', error);
        return;
    }

    let caesarProgress = data?.caesar_puzzle_progress || {};

    // Update the progress for the current Caesar puzzle
    caesarProgress[puzzleId] = { solved: solved };

    const { updateError } = await supabase
        .from('users')
        .update({ caesar_puzzle_progress: caesarProgress })
        .eq('telegram_id', userTelegramId);

    if (updateError) {
        console.error('Error updating Caesar puzzle progress:', updateError);
    }
}

// Get the list of solved or attempted puzzles from the database
async function getUserSolvedPuzzlesFromDB() {
    const userTelegramId = document.getElementById('userTelegramId').innerText;

    const { data, error } = await supabase
        .from('users')
        .select('caesar_puzzle_progress') // Assuming this field exists
        .eq('telegram_id', userTelegramId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching Caesar puzzle progress:', error);
        return [];
    }

    return data?.caesar_puzzle_progress ? Object.keys(data.caesar_puzzle_progress) : [];
}

// Save the time of the last failure in the database
async function updateLastFailureTimeInDB() {
    const userTelegramId = document.getElementById('userTelegramId').innerText;

    const { error } = await supabase
        .from('users')
        .update({
            caesar_puzzle: { last_failure_time: new Date().toISOString() } // Update last failure time
        })
        .eq('telegram_id', userTelegramId);

    if (error) {
        console.error('Error updating last failure time in the database:', error);
    }
}

// Get the last failure time from the database
async function getLastFailureTimeFromDB() {
    const userTelegramId = document.getElementById('userTelegramId').innerText;

    const { data, error } = await supabase
        .from('users')
        .select('caesar_puzzle')
        .eq('telegram_id', userTelegramId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching last failure time:', error);
        return null;
    }

    return data?.caesar_puzzle?.last_failure_time || null;
}

// Show notification to the user
function showNotification(element, message) {
    element.innerText = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 4000);
}

// Event listeners
caesarStartButton.addEventListener('click', displayCaesarPuzzle);
caesarSubmitButton.addEventListener('click', checkCaesarSolution);

});
















//////////////////////////////////////////////////
// تفعيل التطبيق
initializeApp();



