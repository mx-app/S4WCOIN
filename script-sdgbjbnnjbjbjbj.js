import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './Scripts/config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تعريف عناصر DOM
const uiElements = {
    balanceDisplay: document.getElementById('balanceAmount'),
    accountBalanceDisplay: document.getElementById('AccountnavbarBalanceDisplay'),
    taskBalanceDisplay: document.getElementById('tasknavbarBalanceDisplay'),
    puzzleBalanceDisplay: document.getElementById('puzzlenavbarBalanceDisplay'),
    boostBalanceDisplay: document.getElementById('BoostnavbarBalanceDisplay'),
    lvlBalanceDisplay: document.getElementById('lvlnavbarBalanceDisplay'),
    miningBalanceDisplay: document.getElementById('miningnavbarBalanceDisplay'),
    walletBalanceDisplay: document.getElementById('navbarBalanceDisplay'),
    settingsBalanceDisplay: document.getElementById('settingsBalanceDisplay'),

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
    achievedLevels: [],
    friends: 0,
    fillEnergyCount: 0,
    lastFillTime: Date.now(),
    freeEnergyFillTime: null,
    invites: [],
    claimedRewards: { levels: [] }, 
    tasksprogress: [],
    completedTasks: [],
    puzzlesprogress:[], 
    caesarPuzzleProgress:[], 
    usedPromoCodes: [],
    ciphersProgress:[],
    lastLoginDate: null, // تاريخ آخر تسجيل دخول
    consecutiveDays: 0,  // عدد الأيام المتتالية التي تم المطالبة فيها بالمكافآت
    robotLevel: 1, // مستوى الروبوت
    robotActive: false, // حالة الروبوت
    robotClickValue: 0.5, 
};

//تحديث البيانت من الواجهه الي قاعده البيانات 
async function updateGameStateInDatabase(updatedData) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    try {
        const { data, error } = await supabase
            .from('users')
            .update(updatedData) // البيانات الجديدة
            .eq('telegram_id', userId); // شرط التحديث

        if (error) {
            console.error('Error updating game state in Supabase:', error);
            return false;
        }

        console.log('Game state updated successfully in Supabase:', data);
        return true;
    } catch (err) {
        console.error('Unexpected error while updating game state:', err);
        return false;
    }
}



//تحديث قاعده البيانات 
async function loadGameState() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    try {
        console.log('Loading game state from Supabase...');
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error loading game state from Supabase:', error.message);
            return;
        }

        if (data) {
            console.log('Loaded game state:', data); // عرض البيانات المحملة
            gameState = { ...gameState, ...data };
            updateUI();
        } else {
            console.warn('No game state found for this user.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}


// حفظ حالة اللعبة في LocalStorage وقاعدة البيانات
async function saveGameState() {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    // إنشاء بيانات محدثة للحفظ
    const updatedData = {
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
        claimed_rewards: gameState.claimedRewards,
        tasks_progress: gameState.tasksProgress,
        puzzles_progress: gameState.puzzlesProgress,
        used_promo_codes: gameState.usedPromoCodes,
        morse_ciphers_progress: gameState.ciphersProgress,
        last_login_date: gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toISOString() : null,
        consecutive_days: gameState.consecutiveDays,
        achieved_Levels: gameState.achievedLevels,
        caesar_puzzles_progress: gameState.caesarPuzzleProgress, 
        
        robot_level: gameState.robotLevel, // مستوى الروبوت
        robot_active: gameState.robotActive, // حالة الروبوت
        robot_click_value: gameState.robotClickValue, // قيمة النقر التلقائي
    };

    try {
        // حفظ البيانات في قاعدة البيانات
        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('telegram_id', userId);

        if (error) {
            throw new Error(`Error saving game state: ${error.message}`);
        }

        console.log('Game state updated successfully.');
    } catch (err) {
        console.error(err.message);
    }
}



//تحديث الطاقه 
async function restoreEnergy() {
    try {
        const currentTime = Date.now();
        const timeDiff = currentTime - gameState.lastFillTime;

        // حساب الطاقة المستعادة
        const recoveredEnergy = Math.floor(timeDiff / (4 * 60 * 1000)); // استعادة الطاقة كل 4 دقائق
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + recoveredEnergy);
        gameState.lastFillTime = currentTime; // تحديث وقت آخر استعادة

        // تحديث واجهة المستخدم
        updateUI();

        // حفظ حالة اللعبة
        await saveGameState();

        console.log('Energy restored successfully.');
    } catch (err) {
        console.error('Error restoring energy:', err.message);

        // إشعار بفشل الاستعادة
        showNotificationWithStatus(uiElements.purchaseNotification, `Failed to restore energy. Please reload.`, 'lose');
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

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await loadGameState();   
    await restoreEnergy();
    startEnergyRecovery();
    updateGameStateInDatabase(); 
    listenToRealtimeChanges();   
    await initializeApp();      
    updateInviteFriendsButton();
});


document.addEventListener("DOMContentLoaded", function() {
    updateUI(); // تأكد من تحديث الرصيد عند تحميل الصفحة
});



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



// تحديث واجهة المستخدم بناءً على حالة اللعبة
function updateUI() {
    // تنسيق الرصيد
    const formattedBalance = gameState.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // تحديث الرصيد العام
    if (uiElements.balanceDisplay) {
        uiElements.balanceDisplay.innerText = formattedBalance;
    }

    // تحديث الرصيد في عناصر مخصصة لكل صفحة
    if (uiElements.walletBalanceDisplay) {
        uiElements.walletBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.accountBalanceDisplay) {
        uiElements.accountBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.taskBalanceDisplay) {
        uiElements.taskBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.puzzleBalanceDisplay) {
        uiElements.puzzleBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.settingsBalanceDisplay) {
        uiElements.settingsBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.boostBalanceDisplay) {
        uiElements.boostBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.lvlBalanceDisplay) {
        uiElements.lvlBalanceDisplay.innerText = formattedBalance;
    }
    if (uiElements.miningBalanceDisplay) {
        uiElements.miningBalanceDisplay.innerText = formattedBalance;
    }

    // تحديث شريط الطاقة
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    if (uiElements.energyBar) {
        uiElements.energyBar.style.width = `${energyPercent}%`;
    }

    // تحديث معلومات الطاقة
    if (uiElements.energyInfo) {
        uiElements.energyInfo.innerText = `${formatNumber(gameState.energy)}/${formatNumber(gameState.maxEnergy)}⚡`;
    }

    // تحديث اسم المستوى الحالي
    if (uiElements.currentLevelName) {
        uiElements.currentLevelName.innerText = levelThresholds[gameState.currentLevel - 1].name;
    }

    // تحديث المستوى المعروض
    if (uiElements.displayedLevel) {
        uiElements.displayedLevel.innerText = ` ${gameState.currentLevel}`;
    }

    // حفظ حالة اللعبة
    saveGameState();

    // تحديث شاشات التحسينات والمستويات
    updateBoostsDisplay();
    updateLevelDisplay();

    // إرسال البيانات الجديدة إلى قاعدة البيانات
    updateGameStateInDatabase({
        balance: gameState.balance,
        energy: gameState.energy,
        currentLevel: gameState.currentLevel,
    });
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
                uiElements.levelInfoDisplay.innerText = `Lvl number : ${gameState.currentLevel}`;
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
            uiElements.multiplierDisplay.innerText = `Current Click Multiplier: ×${gameState.clickMultiplier}`;
        } else if (upgradeType === 'coin') {
            cost = gameState.coinBoostLevel * 500 + 500;
            uiElements.upgradeText.innerText = `Are you sure you want to upgrade your max coins? It will cost ${cost} coins.`;
            uiElements.maxEnergyDisplay.innerText = `Current Max Coins: ${formatNumber(gameState.maxEnergy)}`;
        }

        // تحديث العملات المتاحة وتكلفة الترقية
        uiElements.currentCoins.innerText = formatNumber(gameState.balance);
        uiElements.upgradeCost.innerText = cost;
    }
}

// ربط أزرار الترقية بالنافذة المنبثقة
document.getElementById('bost1').addEventListener('click', function() {
    showUpgradeModal('boost');
});

document.getElementById('bost2').addEventListener('click', function() {
    showUpgradeModal('coin');
});

// دالة تأكيد الترقية وتحديث حالة اللعبة بعد الترقية
function confirmUpgradeAction() {
    let cost;
    const upgradeType = uiElements.upgradeModal.getAttribute('data-upgrade-type');

    if (upgradeType === 'boost') {
        cost = gameState.boostLevel * 500 + 500;
    } else if (upgradeType === 'coin') {
        cost = gameState.coinBoostLevel * 500 + 500;
    }

    if (gameState.balance >= cost) {
        gameState.balance -= cost;

        if (upgradeType === 'boost') {
            gameState.boostLevel += 1;
            gameState.clickMultiplier += 0.5;
        } else if (upgradeType === 'coin') {
            gameState.coinBoostLevel += 1;
            gameState.maxEnergy += 500;
        }

        updateUI(); // تحديث واجهة المستخدم
        saveGameState(); // حفظ التحديثات
        updateGameStateInDatabase({
            balance: gameState.balance,
            boost_level: gameState.boostLevel,
            click_multiplier: gameState.clickMultiplier,
            coin_boost_level: gameState.coinBoostLevel,
            max_energy: gameState.maxEnergy,
        });

        showNotificationWithStatus(uiElements.purchaseNotification, 'Successfully upgraded!', 'win');
    } else {
        showNotificationWithStatus(uiElements.purchaseNotification, 'Not enough coins!', 'lose');
    }

    uiElements.upgradeModal.style.display = 'none';
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


//تعامل النقر 
function handleClick(event) {
    event.preventDefault(); // منع الأحداث المكررة
    const touchPoints = event.touches ? event.touches : [event]; // التعامل مع اللمس أو النقر الواحد

    for (let i = 0; i < touchPoints.length; i++) {
        const touch = touchPoints[i];
        createDiamondCoinEffect(touch.pageX, touch.pageY);
    }

    // التحقق من توافر الطاقة اللازمة لكل نقرة
    const requiredEnergy = gameState.clickMultiplier * touchPoints.length;
    if (gameState.energy >= requiredEnergy) {
        gameState.balance += gameState.clickMultiplier * touchPoints.length;
        gameState.energy -= requiredEnergy;
        saveGameState();
        updateUI();
        
        // إرسال التحديث إلى قاعدة البيانات
        updateGameStateInDatabase({
            balance: gameState.balance,
            energy: gameState.energy,
        });
    } else {
        showNotification(uiElements.purchaseNotification, 'Not enough energy!');
    }
}



const img = document.getElementById('clickableImg');

img.addEventListener('click', (event) => {
    // --- تأثير الإمالة ---
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.6) * -20;
    const rotateY = ((x / rect.width) - 0.6) * 20;

    img.style.transform = `translateY(-5px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // إعادة الوضع الطبيعي
    setTimeout(() => {
        img.style.transform = 'translateY(-5px)';
    }, 300);

    // --- تأثير الألماس ---
    const diamondX = event.pageX;
    const diamondY = event.pageY;

    createDiamondCoinEffect(diamondX, diamondY);
});

// وظيفة إنشاء تأثير الألماس
function createDiamondCoinEffect(x, y) {
    const diamond = document.createElement('div');
    diamond.classList.add('diamond-coin');
    const multiplierText = document.createElement('span');
    multiplierText.textContent = `+${gameState.clickMultiplier}`;
    diamond.appendChild(multiplierText);
    document.body.appendChild(diamond);

    // تحديد موقع الألماس بشكل دقيق
    diamond.style.left = `${x}px`;
    diamond.style.top = `${y}px`;

    const balanceRect = uiElements.balanceDisplay.getBoundingClientRect();

    // تحريك الألماس نحو الرصيد
    setTimeout(() => {
        diamond.style.transform = `translate(${balanceRect.left - x}px, ${balanceRect.top - y}px) scale(0.5)`;
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

function startEnergyRecovery() {
    setInterval(() => {
        // التأكد من وجود طاقة أقل من الحد الأقصى
        if (gameState.energy < gameState.maxEnergy) {
            // إذا كانت الطاقة صفر أو أقل من الحد الأقصى، يتم زيادتها بمقدار 10
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 10);

            // تحديث الوقت الأخير لملء الطاقة
            gameState.lastFillTime = Date.now();

            // تحديث واجهة المستخدم وحفظ البيانات
            updateUI();
            saveGameState();
            updateGameStateInDatabase({
                energy: gameState.energy,
                lastFillTime: gameState.lastFillTime,
            });
        }
    }, 5000); // تنفيذ الدالة كل 5 ثوانٍ
}

// التحقق من ملء الطاقة
function checkEnergyFill() {
    const currentTime = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;

    if (currentTime - gameState.lastFillTime >= twelveHours) {
        gameState.fillEnergyCount = 0;
        gameState.lastFillTime = currentTime;

        // تحديث البيانات
        updateUI();
        saveGameState();
        updateGameStateInDatabase({
            fillEnergyCount: gameState.fillEnergyCount,
            lastFillTime: gameState.lastFillTime,
        });
    }
}

//////////////////////////////////


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


//////////////////////




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

    saveGameState(); // حفظ البيانات في localStorage
    updateGameStateInDatabase({
        boostLevel: gameState.boostLevel,
        coinBoostLevel: gameState.coinBoostLevel,
        clickMultiplier: gameState.clickMultiplier,
    }); // تحديث البيانات في قاعدة البيانات
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
        // جلب قائمة الأصدقاء من قاعدة البيانات
        const { data, error } = await supabase
            .from('users')
            .select('invites') // عمود الدعوات الذي يحتوي على قائمة المعرفات
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error fetching friends list:', error.message);
            uiElements.friendsListDisplay.innerHTML = `<li>Error: Unable to fetch friends at the moment.</li>`;
            return;
        }

        // التأكد من أن الدعوات تحتوي على معرّفات الأصدقاء
        if (data && data.invites && Array.isArray(data.invites) && data.invites.length > 0) {
            uiElements.friendsListDisplay.innerHTML = ''; // مسح القائمة القديمة

            // جلب بيانات الأصدقاء بما في ذلك الرصيد لكل معرف
            const friendsPromises = data.invites.map(async (friendId) => {
                const { data: friendData, error: friendError } = await supabase
                    .from('users')
                    .select('telegram_id, balance')
                    .eq('telegram_id', friendId)
                    .single();

                if (friendError) {
                    console.error(`Error fetching data for friend ${friendId}:`, friendError.message);
                    return null;
                }

                return friendData; // إرجاع البيانات الخاصة بالصديق
            });

            // الانتظار حتى يتم جلب جميع بيانات الأصدقاء
            const friendsData = await Promise.all(friendsPromises);

            // عرض الأصدقاء مع رصيدهم
            friendsData.forEach((friend) => {
                if (friend) {
                    const li = document.createElement('li');
                    li.classList.add('friend-item'); // إضافة الـ CSS

                    // إنشاء عنصر الصورة الافتراضية
                    const img = document.createElement('img');
                    img.src = 'i/Uselist.jpg'; // رابط الصورة الافتراضية
                    img.alt = `${friend.telegram_id}'s Avatar`;
                    img.classList.add('friend-avatar');

                    // إضافة معرّف الصديق
                    const span = document.createElement('span');
                    span.classList.add('friend-name');
                    span.textContent = `ID: ${friend.telegram_id}`;

                    // إنشاء عنصر لعرض الرصيد
                    const balanceSpan = document.createElement('span');
                    balanceSpan.classList.add('friend-balance');
                    balanceSpan.textContent = `${formatNumber(friend.balance)} SP`; // عرض الرصيد

                    // إنشاء div يحتوي على الصورة واسم الصديق
                    const friendInfoDiv = document.createElement('div');
                    friendInfoDiv.classList.add('friend-info');
                    friendInfoDiv.appendChild(img);
                    friendInfoDiv.appendChild(span);

                    // إضافة الصورة واسم الصديق إلى الـ li
                    li.appendChild(friendInfoDiv);

                    // إضافة الرصيد على اليمين
                    li.appendChild(balanceSpan);

                    // إضافة الصديق إلى القائمة
                    uiElements.friendsListDisplay.appendChild(li);
                }
            });

            // تحديث العدد الإجمالي للأصدقاء
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
            completed_tasks: gameState.completedTasks, 
            puzzles_progress: gameState.puzzlesprogress, 
            used_Promo_Codes: gameState.usedPromoCodes, 
            morse_ciphers_progress: gameState.ciphersProgress, 
            achieved_Levels: gameState.achievedLevels, 
            last_login_date: gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toISOString() : null,
            consecutive_days: gameState.consecutiveDays, 
            caesar_puzzles_progress: gameState.caesarPuzzleProgress, 
     
            robot_level: gameState.robotLevel, // مستوى الروبوت
            robot_active: gameState.robotActive, // حالة الروبوت
            robot_click_value: gameState.robotClickValue
            
        })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating user data:', error);
    }
}


///////////////////////////////




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






document.addEventListener('DOMContentLoaded', async () => {
    const taskContainer = document.querySelector('#taskcontainer');
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    // جلب المهام المكتملة من قاعدة البيانات
    const userId = uiElements.userTelegramIdDisplay.innerText;
    let completedTasks = [];

    try {
        const { data, error } = await supabase
            .from('users')
            .select('completed_tasks')
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error fetching completed tasks:', error);
        } else {
            completedTasks = data?.completed_tasks || [];
        }
    } catch (err) {
        console.error('Unexpected error while fetching completed tasks:', err);
    }

    // جلب قائمة المهام من ملف JSON
    fetch('json/tasks.json')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-item');

                // صورة المهمة
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

                 // Task Reward without Coin Image
                const rewardContainer = document.createElement('div');
                rewardContainer.classList.add('task-reward-container');
            
            // حذف أو تعليق الجزء الخاص بإضافة صورة العملة
            // const rewardIcon = document.createElement('img');
            // rewardIcon.src = 'i/coii.png'; // مسار صورة العملة
            // rewardIcon.alt = 'Coinreward';
            // rewardIcon.classList.add('reward-coin-icon'); // معرف جديد للرمز
            // rewardContainer.appendChild(rewardIcon);
 
                const rewardText = document.createElement('span');
                rewardText.textContent = `+ ${task.reward} SP`;
                rewardText.classList.add('task-reward');
                rewardContainer.appendChild(rewardText);

                infoContainer.appendChild(rewardContainer); // Append reward below description

                taskElement.appendChild(infoContainer); // Append the info container to the task element

           
                // زر المهمة
                const button = document.createElement('button');
                button.classList.add('task-button');
                button.setAttribute('data-task-id', task.id);
                button.setAttribute('data-reward', task.reward);

                // تعيين نص الزر بناءً على حالة المهمة
                if (completedTasks.includes(task.id)) {
                    button.textContent = '✓';
                    button.disabled = true;
                } else {
                    button.textContent = '❯';
                }

                taskElement.appendChild(button);
                taskContainer.appendChild(taskElement);

                // التعامل مع النقر على الزر
                let taskProgress = 0;

                button.addEventListener('click', () => {
                    if (taskProgress === 0) {
                        showLoading(button);
                        openTaskLink(task.url, () => {
                            taskProgress = 1;
                            hideLoading(button, 'Verify');
                        });
                    } else if (taskProgress === 1) {
                        showLoading(button);
                        setTimeout(() => {
                            taskProgress = 2;
                            hideLoading(button, 'Claim');
                        }, 5000);
                    } else if (taskProgress === 2) {
                        claimTaskReward(task.id, task.reward, button);
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
});

// استلام المكافأة وتحديث قاعدة البيانات
async function claimTaskReward(taskId, reward, button) {
    try {
        // التحقق إذا كانت المهمة مكتملة مسبقًا
        const userId = uiElements.userTelegramIdDisplay.innerText;
        const { data, error } = await supabase
            .from('users')
            .select('completed_tasks')
            .eq('telegram_id', userId)
            .single();

        if (error) {
            console.error('Error fetching completed tasks:', error);
            return;
        }

        const completedTasks = data?.completed_tasks || [];
        if (completedTasks.includes(taskId)) {
            showNotification(uiElements.purchaseNotification, 'You have already claimed this reward.');
            return;
        }

        // إضافة المكافأة إلى الرصيد
        gameState.balance += reward;
        completedTasks.push(taskId);

        // تحديث واجهة المستخدم
        button.textContent = '✓';
        button.disabled = true;
        updateUI();
        showNotificationWithStatus(uiElements.purchaseNotification, `Successfully claimed ${reward} coins!`, 'win');

        // تحديث قاعدة البيانات
        const updatedData = {
            balance: gameState.balance,
            completed_tasks: completedTasks,
        };

        const { updateError } = await supabase
            .from('users')
            .update(updatedData)
            .eq('telegram_id', userId);

        if (updateError) {
            console.error('Error updating completed tasks:', updateError);
        }
    } catch (error) {
        console.error('Error claiming task reward:', error);
    }
}

// عرض التحميل
function showLoading(button) {
    button.innerHTML = `<span class="loading-spinner"></span>`;
    button.disabled = true;
}

function hideLoading(button, text) {
    button.disabled = false;
    button.innerHTML = text;
}

// فتح رابط المهمة
function openTaskLink(taskurl, callback) {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.openLink(taskurl, { try_instant_view: true });
        setTimeout(callback, 1000);
    } else {
        window.open(taskurl, '_blank');
        setTimeout(callback, 1000);
    }
}






/////////////////////////////////////




window.Telegram.WebApp.setHeaderColor('#000000');
window.Telegram.WebApp.setBackgroundColor('#000000');

// تهيئة تكامل تليجرام
function initializeTelegramIntegration() {
    const telegramApp = window.Telegram.WebApp;
    
    // التحقق من جاهزية التطبيق
    telegramApp.ready();
    
    // التحقق من الصفحة الحالية لإظهار أو إخفاء زر الرجوع
    function updateBackButton() {
        const currentPage = document.querySelector(".page.active"); // الصفحة النشطة
        if (currentPage && currentPage.id !== "home") {
            telegramApp.BackButton.show();
        } else {
            telegramApp.BackButton.hide();
        }
    }
    
    // تفعيل حدث زر الرجوع
    telegramApp.BackButton.onClick(() => {
        const currentPage = document.querySelector(".page.active"); // الصفحة النشطة
        if (currentPage && currentPage.id !== "mainPage") {
            // إخفاء الصفحة الحالية والعودة للصفحة الرئيسية
            currentPage.classList.remove("active");
            document.getElementById("home").classList.add("active");
            updateBackButton();
        } else {
            telegramApp.close(); // إغلاق WebApp إذا كنا في الصفحة الرئيسية
        }
    });

    // إعداد التنقل بين الصفحات
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const targetPageId = event.target.getAttribute("data-target"); // تحديد الصفحة المستهدفة
            document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
            document.getElementById(targetPageId).classList.add("active");
            updateBackButton();
        });
    });

    // تخصيص الألوان بناءً على الثيم
    if (telegramApp.colorScheme === 'dark') {
        document.documentElement.style.setProperty('--background-color-dark', '#000');
        document.documentElement.style.setProperty('--text-color-dark', '#FFF');
    }
    
    // إدارة حدث المشاركة
    telegramApp.onEvent('share', () => {
        gameState.balance += 50000;
        updateUI();
        showNotification(uiElements.purchaseNotification, 'You received 50,000 coins for inviting a friend!');
        updateUserData();
        saveGameState();
    });

    // تحديث حالة زر الرجوع عند تحميل الصفحة
    updateBackButton();
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeTelegramIntegration);


///////////////////////////////////////
     


// تعريف عناصر DOM
const puzzlecloseModal = document.getElementById('puzzlecloseModal');
const puzzleCountdown = document.getElementById('puzzleCountdown');
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('puzzle1');
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
const penaltyAmount = 100; // العقوبة عند الإجابة الخاطئة
const countdownDuration = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية

// تحميل الأحاجي من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('json/puzzles.json');
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
document.getElementById('puzzle1').addEventListener('click', function() {
    document.getElementById('puzzleContainer').classList.remove('hidden');
});






///////////////////////////////////////////////////





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
    const countdownDisplay = document.getElementById('MorseCiphersCountdown');

    let currentMorseCipher;
    let morseAttempts = 0;
    let morseSolved = false;
    const morseMaxAttempts = 3;
    const morsePenaltyAmount = 500; // Penalty for wrong answer
    const countdownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let countdownTimeout = null;

    // Format time for display (HH:MM:SS)
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Start countdown timer
    function startCountdownOnButton(seconds) {
        openMorseCipherBtn.disabled = true;
        countdownDisplay.innerText = `${formatTime(seconds)}`;
        
        function updateCountdown() {
            if (seconds > 0) {
                seconds--;
                countdownDisplay.innerText = `${formatTime(seconds)}`;
                setTimeout(updateCountdown, 1000);
            } else {
                countdownDisplay.innerText = 'Morse Cipher available now!';
                openMorseCipherBtn.disabled = false;
                openMorseCipherBtn.innerText = 'Open Cipher';
            }
        }
        updateCountdown();
    }

    // Load Morse ciphers from JSON file
    async function loadMorseCiphers() {
        try {
            const response = await fetch('json/MorseCiphers.json');
            if (!response.ok) throw new Error('Failed to load ciphers');
            const data = await response.json();
            return data.morse_ciphers;
        } catch (error) {
            console.error(error);
            showNotification(morseCipherNotification, 'Error loading cipher. Please try again later.');
        }
    }

    // Get today's Morse cipher
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
            const today = new Date().toISOString().split('T')[0];
            const lastSolvedTime = ciphersProgress.last_solved_time;

            if (lastSolvedTime && new Date() - new Date(lastSolvedTime) < countdownDuration) {
                const remainingSeconds = Math.floor((countdownDuration - (new Date() - new Date(lastSolvedTime))) / 1000);
                startCountdownOnButton(remainingSeconds);
                return null;
            }

            return ciphers.find(cipher => cipher.availableDate === today);
        } catch (error) {
            console.error(error);
        }
    }

    // Display Morse cipher
    async function displayMorseCipher() {
        currentMorseCipher = await getTodaysMorseCipher();

        if (!currentMorseCipher) return;

        morseCodeDisplay.innerText = `Cipher: ${currentMorseCipher.code}`;
        morseCipherRewardDisplay.innerText = `Reward: ${currentMorseCipher.reward} coins`;
        morseCipherContainer.classList.remove('hidden');
        morseAttempts = 0;
        morseSolved = false;
        updateMorseAttemptsDisplay();
    }

    // Update Morse attempts display
    function updateMorseAttemptsDisplay() {
        morseAttemptsDisplay.innerText = `${morseMaxAttempts - morseAttempts}/${morseMaxAttempts}`;
    }

    // Handle correct answer
    async function handleCorrectAnswer() {
        morseSolved = true;
        showNotification(morseCipherNotification, `Correct! You've earned ${currentMorseCipher.reward} coins.`, 'win');
        updateBalance(currentMorseCipher.reward);
        await updateMorseCipherProgress(true);
        startCountdownOnButton(24 * 60 * 60);
        closeMorseCipher();
    }

    // Handle wrong answer
    async function handleWrongAnswer() {
        morseAttempts++;
        updateMorseAttemptsDisplay();

        if (morseAttempts >= morseMaxAttempts) {
            showNotification(morseCipherNotification, 'You have used all attempts. 500 coins have been deducted.', 'lose');
            updateBalance(-morsePenaltyAmount);
            await updateMorseCipherProgress(false);
            startCountdownOnButton(24 * 60 * 60);
            closeMorseCipher();
        } else {
            showNotification(morseCipherNotification, `Wrong answer. You have ${morseMaxAttempts - morseAttempts} attempts remaining.`);
        }
    }

    // Update Morse cipher progress in database
    async function updateMorseCipherProgress(solved) {
        const userTelegramId = uiElements.userTelegramIdDisplay.innerText;

        const { data, error } = await supabase
            .from('users')
            .select('morse_ciphers_progress')
            .eq('telegram_id', userTelegramId)
            .maybeSingle();

        if (error) {
            console.error('Error updating Morse cipher progress:', error);
            return;
        }

        let ciphersProgress = data?.morse_ciphers_progress || {};
        ciphersProgress.last_solved_time = solved ? new Date().toISOString() : null;

        const { updateError } = await supabase
            .from('users')
            .update({ morse_ciphers_progress: ciphersProgress })
            .eq('telegram_id', userTelegramId);

        if (updateError) {
            console.error('Error updating Morse cipher progress:', updateError);
        }
    }

    // Update balance
    function updateBalance(amount) {
        gameState.balance += amount;
        updateUI();
    }

    // Show notification
    function showNotification(element, message, status = '') {
        element.innerText = message;
        element.className = status;
        setTimeout(() => element.innerText = '', 3000);
    }

    // Close Morse cipher
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





/////////////////////////////////////////////////





const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://app-sawcoin.vercel.app/json/tonconnect-manifest.json',
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
                coinCounter += 0.1;
                counterDisplay.innerText = coinCounter.toFixed(1); // عرض الرقم بفاصلة عشرية واحدة
                gameState.balance += 0.1;
                updateUI();
                saveGameState();
            }, 4000); // كل ثانية يتم زيادة 0.2 عملة
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
  const currentLevelNameElement = document.getElementById('currentLevelName');

  // تحديث النسخ داخل لوحة الإعدادات
  const settingsInvitedCount = document.getElementById('settingsInvitedCount');
  const settingsCurrentLevelName = document.getElementById('settingsCurrentLevelName');

  const currentLevelIndex = gameState.currentLevel - 1;
  const currentLevelName = levelThresholds[currentLevelIndex]?.name || 'Unknown';

  if (invitedCountElement) invitedCountElement.innerText = gameState.invites.length;
  if (currentLevelNameElement) currentLevelNameElement.innerText = currentLevelName;

  // تحديث النسخ في لوحة الإعدادات
  if (settingsInvitedCount) settingsInvitedCount.innerText = gameState.invites.length;
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
        const response = await fetch('json/promocodes.json');
        const promoData = await response.json();
        const promoCodes = promoData.promoCodes;

        // تحقق مما إذا كان المستخدم قد استخدم هذا البرومو كود من قاعدة البيانات
        const alreadyUsed = await checkIfPromoCodeUsed(enteredCode);

        if (alreadyUsed) {
            applyButton.innerHTML = '⛔';
            showNotificationWithStatus(uiElements.purchaseNotification, 'You have already used this promo code.', 'win');
            setTimeout(() => {
                applyButton.innerHTML = 'Apply';
                applyButton.classList.remove('loading');
                spinner.remove();
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

            // حفظ البرومو كود المستخدم في قاعدة البيانات
            const updated = await addPromoCodeToUsed(enteredCode);
            if (!updated) {
                showNotification(uiElements.purchaseNotification, 'Failed to save promo code in database.', true);
                return;
            }

            // عرض علامة صح (✔️) عند النجاح
            applyButton.innerHTML = '✔️';

            // إظهار إشعار بالمكافأة
            showNotificationWithStatus(uiElements.purchaseNotification, `Successfully added ${reward} coins to your balance!`, 'win');

            // حفظ الحالة الحالية للعبة وتحديثها في قاعدة البيانات
            updateUI(); 
            saveGameState();  // حفظ الحالة الحالية
            await updateGameStateInDatabase({
                used_Promo_Codes: gameState.usedPromoCodes,
                balance: gameState.balance,
            });

            
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
            spinner.remove();
        }, 3000);
    }
});

// دالة للتحقق من البرومو كود المستخدم من قاعدة البيانات
async function checkIfPromoCodeUsed(enteredCode) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { data, error } = await supabase
        .from('users')
        .select('used_Promo_Codes')
        .eq('telegram_id', userId)
        .single(); // احصل على سجل المستخدم

    if (error) {
        console.error('Error fetching used promo codes:', error);
        return false;
    }

    const usedPromoCodes = data.used_Promo_Codes || [];
    return usedPromoCodes.includes(enteredCode);
}

// دالة لإضافة البرومو كود إلى الأكواد المستخدمة
async function addPromoCodeToUsed(enteredCode) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { data, error } = await supabase
        .from('users')
        .select('used_Promo_Codes')
        .eq('telegram_id', userId)
        .single();

    if (error) {
        console.error('Error fetching used promo codes:', error);
        return false;
    }

    const usedPromoCodes = data.used_Promo_Codes || [];
    usedPromoCodes.push(enteredCode);

    const { error: updateError } = await supabase
        .from('users')
        .update({ used_Promo_Codes: usedPromoCodes })
        .eq('telegram_id', userId);

    if (updateError) {
        console.error('Error updating used promo codes:', updateError);
        return false;
    }

    console.log('Promo code added to used list successfully.');
    return true;
}





/////////////////////////////////////////

/////////////////////////////////////////

document.getElementById('buyRobotBtn').addEventListener('click', () => {
    const cost = 50000; // تكلفة شراء الروبوت

    if (gameState.balance >= cost) {
        gameState.balance -= cost;
        gameState.robotLevel = 1;
        gameState.robotClickValue = 0.5;
        updateUI();
        document.getElementById('buyRobotBtn').disabled = true; // إخفاء زر الشراء
        document.getElementById('activateRobotBtn').disabled = false; // تمكين الروبوت
        showNotification(uiElements.purchaseNotification, 'Robot purchased successfully!');
    } else {
        showNotification(uiElements.purchaseNotification, 'Not enough coins to buy the robot!');
    }
});


document.getElementById('upgradeRobotBtn').addEventListener('click', () => {
    const upgradeCost = gameState.robotLevel * 500;

    if (gameState.balance >= upgradeCost) {
        gameState.balance -= upgradeCost;
        gameState.robotLevel += 1;
        gameState.robotClickValue += 0.5; // زيادة قيمة النقرة
        updateUI();
        showNotification(uiElements.purchaseNotification, 'Robot upgraded successfully!');
    } else {
        showNotification(uiElements.purchaseNotification, 'Not enough coins to upgrade the robot!');
    }
});



let robotInterval;

document.getElementById('activateRobotBtn').addEventListener('click', () => {
    if (gameState.robotActive) {
        clearInterval(robotInterval);
        gameState.robotActive = false;
        document.getElementById('robotStatus').innerText = 'Robot is inactive.';
        return;
    }

    gameState.robotActive = true;
    document.getElementById('robotStatus').innerText = 'Robot is active.';

    robotInterval = setInterval(() => {
        gameState.balance += gameState.robotClickValue;
        updateUI();

        // إيقاف الروبوت بعد دقيقة
        setTimeout(() => {
            clearInterval(robotInterval);
            gameState.robotActive = false;
            document.getElementById('robotStatus').innerText = 'Robot is inactive.';
        }, 60 * 1000);
    }, 200); // يقوم بالنقر كل ثانية
});



//////////////////////////////////////




// استلام رابط الدعوة عند الانضمام
function handleInvite() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('start');  // استلام معرف الداعي من الرابط
    const currentUserId = window.Telegram.WebApp.user.id; // استلام معرف المستخدم الحالي

    if (referrerId && referrerId !== currentUserId) {
        // منح مكافأة للداعي والمدعو
        rewardReferral(referrerId, currentUserId);
    }
}

// منح المكافأة
function rewardReferral(referrerId, invitedId) {
    // أضف 5000 عملة لكلا الطرفين في قاعدة البيانات أو حسب الحالة
    // هذا مثال على العملية في واجهة المستخدم
    gameState.balance += 5000;  // مكافأة للمدعو
    updateUI();
    showNotification(uiElements.purchaseNotification, 'You received 5,000 coins from your friend!');
    
    // مكافأة للداعي
    // يمكن إرسال مكافأة للداعي أيضًا هنا
    gameState.balance += 5000;  // مكافأة للداعي
    updateUserData();
    saveGameState();
    
    // إرسال إشعار للطرفين
    showNotification(uiElements.purchaseNotification, `You received 5,000 coins for inviting a friend!`);
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', handleInvite);

//////////////////////////////////////////////////////////







// تفعيل التطبيق
initializeApp();



//localStorage.removeItem('gameState'); // مسح حالة اللعبة
//loadGameState(); // إعادة تحميل حالة اللعبة

