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

    tasks.forEach(async task => {
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

        const taskId = task.id;
        const userId = uiElements.userTelegramIdDisplay.innerText;

        // جلب تقدم المهمة من قاعدة البيانات
        const { data: userTaskData, error: taskError } = await supabase
            .from('users')
            .select('tasks_progress')
            .eq('telegram_id', userId)
            .single();

        if (taskError) {
            console.error('Error fetching task progress:', taskError);
            return;
        }

        const tasksProgress = userTaskData?.tasks_progress || [];
        const taskProgressData = tasksProgress.find(t => t.task_id === taskId);
        let taskProgress = taskProgressData ? taskProgressData.progress : 0;

        // إعداد النصوص حسب تقدم المهمة
        button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : 'Go to Task';
        button.disabled = taskProgress >= 2;

        // عند الضغط على الزر
        button.onclick = async () => {
            if (taskProgress === 0) {
                window.open(task.link, '_blank');
                taskProgress = 1;
                await updateTaskProgress(taskId, userId, taskProgress); // تحديث التقدم في قاعدة البيانات
                button.textContent = 'Verify';
            } else if (taskProgress === 1) {
                window.open(task.link, '_blank');
                taskProgress = 2;
                await updateTaskProgress(taskId, userId, taskProgress);
                button.textContent = 'Claim';
            } else if (taskProgress === 2) {
                await claimReward(taskId, task.reward); // المطالبة بالمكافأة
            }
        };

        taskItem.appendChild(button);
        taskContainer.appendChild(taskItem);
    });
})
.catch(error => console.error('Error loading tasks:', error));

// دالة لتحديث تقدم المهمة في قاعدة البيانات
async function updateTaskProgress(taskId, userId, progress) {
    const { data: user, error } = await supabase
        .from('users')
        .select('tasks_progress')
        .eq('telegram_id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user tasks:', error);
        return;
    }

    const tasksProgress = user.tasks_progress || [];

    // تحديث أو إضافة المهمة الحالية
    const taskIndex = tasksProgress.findIndex(task => task.task_id === taskId);
    if (taskIndex > -1) {
        tasksProgress[taskIndex].progress = progress;
    } else {
        tasksProgress.push({ task_id: taskId, progress: progress, claimed: false });
    }

    // تحديث البيانات في قاعدة البيانات
    const { error: updateError } = await supabase
        .from('users')
        .update({ tasks_progress: tasksProgress })
        .eq('telegram_id', userId);

    if (updateError) {
        console.error('Error updating task progress:', updateError);
    }
}

// دالة للمطالبة بالمكافأة وتحديث الرصيد
async function claimReward(taskId, reward) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    // جلب المهام المكتملة من قاعدة البيانات
    const { data: user, error } = await supabase
        .from('users')
        .select('tasks_progress')
        .eq('telegram_id', userId)
        .single();

    if (error) {
        console.error('Error fetching tasks progress:', error);
        return;
    }

    const tasksProgress = user.tasks_progress || [];

    // تحقق مما إذا تم المطالبة بالمكافأة
    const task = tasksProgress.find(task => task.task_id === taskId);
    if (task && task.claimed) {
        showNotification('You have already claimed this reward.');
        return;
    }

    // إضافة المكافأة إلى رصيد المستخدم
    await addCoinsToDatabase(reward);

    // تحديث حالة المطالبة بالمكافأة
    if (task) {
        task.claimed = true;
    } else {
        tasksProgress.push({ task_id: taskId, progress: 2, claimed: true });
    }

    // تحديث المهام في قاعدة البيانات
    const { error: updateError } = await supabase
        .from('users')
        .update({ tasks_progress: tasksProgress })
        .eq('telegram_id', userId);

    if (updateError) {
        console.error('Error updating claimed rewards:', updateError);
    } else {
        showNotification('Reward claimed!');
    }
}

updateUserData();
saveGameState();

// دالة لإضافة الرصيد
async function addCoinsToDatabase(amount) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({ balance: supabase.rpc('increment_balance', { amount }) })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating balance:', error);
    }
}

updateUserData();
saveGameState();
