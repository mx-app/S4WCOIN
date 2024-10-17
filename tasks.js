// Loading tasks from JSON file
fetch('tasks.json')
    .then(response => response.json())
    .then(tasks => {
        const taskContainer = document.getElementById('taskcontainer');
        if (!taskContainer) {
            console.error('Task container element not found.');
            return;
        }

        taskContainer.innerHTML = ''; // Clean the content before adding tasks

        tasks.forEach(async task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            // Add the image
            const img = document.createElement('img');
            img.src = task.image;
            img.alt = task.task;
            img.className = 'task-image';
            taskItem.appendChild(img);

            // Add the task text
            const taskText = document.createElement('p');
            taskText.textContent = `${task.task} - Reward: ${task.reward || 5000} coins`;
            taskItem.appendChild(taskText);

            // Add the button
            const button = document.createElement('button');
            button.className = 'task-button';

            const taskId = task.id;
            const userId = uiElements.userTelegramIdDisplay.innerText; // Get Telegram ID

            // Fetch task progress from the database
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

            // Set button text based on task progress
            button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : 'Go to Task';
            button.disabled = taskProgress >= 2;

            // Button click handling
            button.onclick = async () => {
                if (taskProgress === 0) {
                    window.open(task.link, '_blank');
                    taskProgress = 1;
                    await updateTaskProgress(taskId, userId, taskProgress); // Update progress in the database
                    button.textContent = 'Verify';
                } else if (taskProgress === 1) {
                    window.open(task.link, '_blank');
                    taskProgress = 2;
                    await updateTaskProgress(taskId, userId, taskProgress);
                    button.textContent = 'Claim';
                } else if (taskProgress === 2) {
                    await claimReward(taskId, task.reward); // Claim reward
                }
            };

            taskItem.appendChild(button);
            taskContainer.appendChild(taskItem);
        });
    })
    .catch(error => console.error('Error loading tasks:', error));

// Function to update task progress in the database
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

    const taskIndex = tasksProgress.findIndex(task => task.task_id === taskId);
    if (taskIndex > -1) {
        tasksProgress[taskIndex].progress = progress;
    } else {
        tasksProgress.push({ task_id: taskId, progress: progress, claimed: false });
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ tasks_progress: tasksProgress })
        .eq('telegram_id', userId);

    if (updateError) {
        console.error('Error updating task progress:', updateError);
    }
}

// Function to claim a reward and update the balance
async function claimReward(taskId, reward) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

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
    const task = tasksProgress.find(task => task.task_id === taskId);

    if (task && task.claimed) {
        showNotification('You have already claimed this reward.');
        return;
    }

    await addBalanceToDatabase(reward);

    if (task) {
        task.claimed = true;
    } else {
        tasksProgress.push({ task_id: taskId, progress: 2, claimed: true });
    }

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

// Function to add balance
async function addBalanceToDatabase(amount) {
    const userId = uiElements.userTelegramIdDisplay.innerText;

    const { error } = await supabase
        .from('users')
        .update({ balance: supabase.rpc('increment_balance', { amount }) })
        .eq('telegram_id', userId);

    if (error) {
        console.error('Error updating balance:', error);
    }
}
