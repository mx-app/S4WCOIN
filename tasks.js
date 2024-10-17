// تحميل المهام المتغيرة من ملف JSON
fetch('tasks.json')
.then(response => response.json())
.then(dynamicTasks => {
    const taskContainer = document.getElementById('taskcontainer');
    if (!dynamicTaskContainer) {
        console.error('Dynamic task container element not found.');
        return;
    }

    dynamicTaskContainer.innerHTML = ''; // تنظيف المحتوى قبل إضافة المهام

    dynamicTasks.forEach(async dynamicTask => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        // إضافة الصورة
        const img = document.createElement('img');
        img.src = dynamicTask.image;
        img.alt = dynamicTask.task;
        img.className = 'dynamic-task-image';
        taskItem.appendChild(img);

        // إضافة النص
        const taskText = document.createElement('p');
        taskText.textContent = `${dynamicTask.task} - Reward: ${dynamicTask.reward || 5000} coins`;
        taskItem.appendChild(taskText);

        // إضافة الزر
        const button = document.createElement('button');
        button.className = 'dynamic-task-button';

        const dynamicTaskId = dynamicTask.id;
        const dynamicUserId = uiElements.userTelegramIdDisplay.innerText; // الحصول على Telegram ID

        // جلب تقدم المهمة من قاعدة البيانات
        const { data: userDynamicTaskData, error: taskError } = await supabase
            .from('users')
            .select('dynamic_tasks_progress') // تعديل حقل المهام المتغيرة
            .eq('telegram_id', dynamicUserId)
            .single();

        if (taskError) {
            console.error('Error fetching dynamic task progress:', taskError);
            return;
        }

        const dynamicTasksProgress = userDynamicTaskData?.dynamic_tasks_progress || [];
        const dynamicTaskProgressData = dynamicTasksProgress.find(t => t.task_id === dynamicTaskId);
        let dynamicTaskProgress = dynamicTaskProgressData ? dynamicTaskProgressData.progress : 0;

        // إعداد النصوص حسب تقدم المهمة
        button.textContent = dynamicTaskProgress >= 2 ? 'Completed' : dynamicTaskProgress === 1 ? 'Verify' : 'Go to Task';
        button.disabled = dynamicTaskProgress >= 2;

        // عند الضغط على الزر
        button.onclick = async () => {
            if (dynamicTaskProgress === 0) {
                window.open(dynamicTask.link, '_blank');
                dynamicTaskProgress = 1;
                await updateDynamicTaskProgress(dynamicTaskId, dynamicUserId, dynamicTaskProgress); // تحديث التقدم في قاعدة البيانات
                button.textContent = 'Verify';
            } else if (dynamicTaskProgress === 1) {
                window.open(dynamicTask.link, '_blank');
                dynamicTaskProgress = 2;
                await updateDynamicTaskProgress(dynamicTaskId, dynamicUserId, dynamicTaskProgress);
                button.textContent = 'Claim';
            } else if (dynamicTaskProgress === 2) {
                await claimDynamicReward(dynamicTaskId, dynamicTask.reward); // المطالبة بالمكافأة
            }
        };

        taskItem.appendChild(button);
        dynamicTaskContainer.appendChild(taskItem);
    });
})
.catch(error => console.error('Error loading dynamic tasks:', error));

// دالة لتحديث تقدم المهام المتغيرة في قاعدة البيانات
async function updateDynamicTaskProgress(dynamicTaskId, dynamicUserId, progress) {
    const { data: user, error } = await supabase
        .from('users')
        .select('dynamic_tasks_progress') // تعديل الحقل ليكون خاص بالمهام المتغيرة
        .eq('telegram_id', dynamicUserId)
        .single();
    
    if (error) {
        console.error('Error fetching user dynamic tasks:', error);
        return;
    }

    const dynamicTasksProgress = user.dynamic_tasks_progress || [];

    // تحديث أو إضافة المهمة المتغيرة الحالية
    const taskIndex = dynamicTasksProgress.findIndex(task => task.task_id === dynamicTaskId);
    if (taskIndex > -1) {
        dynamicTasksProgress[taskIndex].progress = progress;
    } else {
        dynamicTasksProgress.push({ task_id: dynamicTaskId, progress: progress, claimed: false });
    }

    // تحديث البيانات في قاعدة البيانات
    const { error: updateError } = await supabase
        .from('users')
        .update({ dynamic_tasks_progress: dynamicTasksProgress }) // تعديل الحقل ليكون خاص بالمهام المتغيرة
        .eq('telegram_id', dynamicUserId);

    if (updateError) {
        console.error('Error updating dynamic task progress:', updateError);
    }
}

// دالة للمطالبة بالمكافأة وتحديث الرصيد للمهام المتغيرة
async function claimDynamicReward(dynamicTaskId, reward) {
    const dynamicUserId = uiElements.userTelegramIdDisplay.innerText;

    // جلب المهام المتغيرة المكتملة من قاعدة البيانات
    const { data: user, error } = await supabase
        .from('users')
        .select('dynamic_tasks_progress') // تعديل الحقل ليكون خاص بالمهام المتغيرة
        .eq('telegram_id', dynamicUserId)
        .single();

    if (error) {
        console.error('Error fetching dynamic tasks progress:', error);
        return;
    }

    const dynamicTasksProgress = user.dynamic_tasks_progress || [];

    // تحقق مما إذا تم المطالبة بالمكافأة
    const dynamicTask = dynamicTasksProgress.find(task => task.task_id === dynamicTaskId);
    if (dynamicTask && dynamicTask.claimed) {
        showNotification('You have already claimed this reward.');
        return;
    }

    // إضافة المكافأة إلى رصيد المستخدم
    await addDynamicBalanceToDatabase(reward);

    // تحديث حالة المطالبة بالمكافأة
    if (dynamicTask) {
        dynamicTask.claimed = true;
    } else {
        dynamicTasksProgress.push({ task_id: dynamicTaskId, progress: 2, claimed: true });
    }

    // تحديث المهام المتغيرة في قاعدة البيانات
    const { error: updateError } = await supabase
        .from('users')
        .update({ dynamic_tasks_progress: dynamicTasksProgress }) // تعديل الحقل ليكون خاص بالمهام المتغيرة
        .eq('telegram_id', dynamicUserId);

    if (updateError) {
        console.error('Error updating claimed dynamic rewards:', updateError);
    } else {
        showNotification('Dynamic reward claimed!');
    }
}

// دالة لإضافة الرصيد للمهام المتغيرة
async function addDynamicBalanceToDatabase(amount) {
    const dynamicUserId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({ balance: supabase.rpc('increment_balance', { amount }) }) // تأكد أن الـ RPC متاحة
        .eq('telegram_id', dynamicUserId);

    if (error) {
        console.error('Error updating balance for dynamic tasks:', error);
    }
}

updateUserData();
saveGameState();
