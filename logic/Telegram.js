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


