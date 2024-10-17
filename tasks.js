// تحميل المهام من ملف JSON
fetch('tasks.json')
.then(response => response.json())
.then(tasks => {
    const taskContainer = document.getElementById('taskcontainer');
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    taskContainer.innerHTML = ''; // تنظيف المحتوى قبل إضافة المهام

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        // إضافة الصورة
        const img = document.createElement('img');
        img.src = task.image;
        img.alt = task.task;
        img.className = 'task-image';
        taskItem.appendChild(img);

        // إضافة النص
        const taskText = document.createElement('p');
        taskText.textContent = `${task.task} - Reward: ${task.reward || 5000} coins`;
        taskItem.appendChild(taskText);

        // إضافة الزر
        const button = document.createElement('button');
        button.className = 'task-button';
        
        // احصل على تقدم المهمة من localStorage
        const taskId = task.link; // استخدام الرابط كمعرف فريد
        let taskProgress = parseInt(localStorage.getItem(taskId) || '0');

        // إعداد النصوص حسب تقدم المهمة
        button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : 'Go to Task';
        button.disabled = taskProgress >= 2;

        // عند الضغط على الزر
        button.onclick = () => {
            if (taskProgress === 0) {
                window.open(task.link, '_blank'); // فتح الرابط عند أول نقر
                taskProgress++;
                localStorage.setItem(taskId, taskProgress); // حفظ التقدم
                button.textContent = 'Verify'; // تحويل النص إلى تحقق
            } else if (taskProgress === 1) {
                window.open(task.link, '_blank'); // فتح الرابط عند النقر الثاني
                taskProgress++;
                localStorage.setItem(taskId, taskProgress); // حفظ التقدم
                button.textContent = 'Claim'; // تحويل النص إلى Claim
            } else if (taskProgress === 2) {
                addCoins(task.reward); // إضافة المكافأة إلى الرصيد
                showNotification('Task completed and reward added!'); // إظهار إشعار
                button.textContent = 'Completed'; // تغيير النص إلى "Completed"
                button.disabled = true; // تعطيل الزر بعد إتمام المهمة
            }
        };

        taskItem.appendChild(button);
        taskContainer.appendChild(taskItem);
    });
})
.catch(error => console.error('Error loading tasks:', error));

// دالة لإضافة المكافأة إلى رصيد المستخدم (باستخدام نفس الطريقة من الملف الرئيسي)
function addBalance(amount) {
    let currentBalance = gameState.balance || 0; // جلب الرصيد الحالي من حالة اللعبة
    gameState.balance = currentBalance + amount; // تحديث الرصيد في حالة اللعبة
    
    // احفظ حالة اللعبة
    saveGameState(); // احفظ حالة اللعبة بعد تحديث الرصيد

    // إذا كان هناك تكامل مع قاعدة بيانات، قم بتحديث الرصيد في قاعدة البيانات
    updateUserData(); // تأكد من وجود هذه الدالة في ملفك الرئيسي
}

// دالة لإظهار الإشعارات (نفس الطريقة من الملف الرئيسي)
function showNotification(message) {
    const notificationElement = document.getElementById('purchaseNotification'); // احصل على عنصر الإشعار
    if (notificationElement) {
        notificationElement.innerText = message;
        notificationElement.classList.add('show');
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 4000);
    }
}

// دالة لحفظ حالة اللعبة
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState)); // حفظ حالة اللعبة في localStorage

    updateUI();
    updateUserData();
    saveGameState(); 
}
