// تحديث واجهة المستخدم بناءً على حالة اللعبة
export function updateUI() {
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

// تعريف حالة اللعبة
export let gameState = {
    balance: 0,
    energy: 500,
    maxEnergy: 500,
    clickMultiplier: 1,
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
    puzzlesprogress: [], 
    caesarPuzzleProgress: [], 
    usedPromoCodes: [],
    ciphersProgress: [],
    lastLoginDate: null, // تاريخ آخر تسجيل دخول
    consecutiveDays: 0,  // عدد الأيام المتتالية التي تم المطالبة فيها بالمكافآت
    autClickCount: 0,    // عدد محاولات النقر التلقائي
    lastAutClickTime: Date.now(),  // آخر وقت تم فيه استخدام النقر التلقائي
};

// تحديث البيانات من الواجهة إلى قاعدة البيانات
export async function updateGameStateInDatabase(updatedData, supabase, uiElements) {
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

// استرجاع البيانات من قاعدة البيانات
export async function loadGameState(supabase, uiElements) {
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
            console.log('Loaded game state:', data);
            gameState = { ...gameState, ...data };
            updateUI();
        } else {
            console.warn('No game state found for this user.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// حفظ حالة اللعبة في قاعدة البيانات
export async function saveGameState(supabase, uiElements) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

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
        autClickCount: gameState.autClickCount,
        lastAutClickTime: gameState.lastAutClickTime,
    };

    try {
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

// الاستماع إلى التغييرات في قاعدة البيانات
export function listenToRealtimeChanges(supabase, uiElements) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    supabase
        .channel('public:users')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `telegram_id=eq.${userId}` }, payload => {
            console.log('Change received!', payload);
            gameState = { ...gameState, ...payload.new };
            updateUI();
            saveGameState(supabase, uiElements);
        })
        .subscribe();
}

// تحديث بيانات المستخدم في Supabase
export async function updateUserData(supabase, uiElements) {
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
            claimed_rewards: gameState.claimedRewards,
            tasks_progress: gameState.tasksprogress, 
            completed_tasks: gameState.completedTasks, 
            puzzles_progress: gameState.puzzlesprogress, 
            used_Promo_Codes: gameState.usedPromoCodes, 
            morse_ciphers_progress: gameState.ciphersProgress, 
            achieved_Levels: gameState.achievedLevels, 
            last_login_date: gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toISOString() : null,
            consecutive_days: gameState.consecutiveDays, 
            caesar_puzzles_progress: gameState.caesarPuzzleProgress, 
            autClickCount: gameState.autClickCount,
            lastAutClickTime: gameState.lastAutClickTime,
        })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating user data:', error);
    }
}
