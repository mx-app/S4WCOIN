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

        button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Claim' : 'Go to Task';
        button.disabled = taskProgress >= 2;

        button.onclick = () => {
            taskProgress++;
            localStorage.setItem(taskId, taskProgress);

            if (taskProgress === 1) {
                window.open(task.link, '_blank'); // فتح الرابط عند أول نقر
                button.textContent = 'Claim';
            } else if (taskProgress === 2) {
                // إضافة المكافأة بعد النقر الثاني
                addCoins(task.reward); // إضافة المكافأة إلى الرصيد باستخدام نفس الطريقة لديك
                button.textContent = 'Completed';
                button.disabled = true; // تعطيل الزر بعد إتمام المهمة
            }
        };

        taskItem.appendChild(button);
        taskContainer.appendChild(taskItem);
    });
})
.catch(error => console.error('Error loading tasks:', error));

// دالة لإضافة المكافأة إلى رصيد المستخدم
function addCoins(amount) {
    // افترض أن لديك دالة موجودة لإدارة الرصيد مثل هذه
    let currentBalance = gameState.balance || 0; // استخدم الرصيد الحالي من حالة اللعبة
    gameState.balance = currentBalance + amount; // تحديث الرصيد في حالة اللعبة
    
    // احفظ حالة اللعبة أو قم بالتحديث المباشر لقاعدة البيانات
    saveGameState(); // احفظ حالة اللعبة بعد تحديث الرصيد

    // يمكن أن تقوم بتحديث العرض بشكل تلقائي إذا كان العرض يعتمد على حالة اللعبة
}

// دالة لحفظ حالة اللعبة في قاعدة البيانات أو localStorage
function saveGameState() {
    // حفظ حالة اللعبة بعد التحديث
    localStorage.setItem('gameState', JSON.stringify(gameState));

    // إذا كان هناك تكامل مع قاعدة بيانات، استخدمه هنا
     updateUserData(); // إذا كانت لديك دالة موجودة لتحديث البيانات في قاعدة البيانات
}
