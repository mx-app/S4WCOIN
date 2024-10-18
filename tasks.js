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

            // Fetch task progress from the gameState
            const taskProgressData = gameState.tasksProgress.find(t => t.task_id === taskId);
            let taskProgress = taskProgressData ? taskProgressData.progress : 0;

            // Set button text based on task progress
            button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : 'Go to Task';
            button.disabled = taskProgress >= 2;

            // Button click handling
            button.onclick = async () => {
                if (taskProgress === 0) {
                    window.open(task.link, '_blank');
                    taskProgress = 1;
                    updateTaskProgressInGameState(taskId, taskProgress); // Update progress in the gameState
                    button.textContent = 'Verify';
                    showNotification(uiElements.purchaseNotification, 'Task opened, verify to claim your reward.');
                } else if (taskProgress === 1) {
                    window.open(task.link, '_blank');
                    taskProgress = 2;
                    updateTaskProgressInGameState(taskId, taskProgress);
                    button.textContent = 'Claim';
                    showNotification(uiElements.purchaseNotification, 'Task verified, claim your reward.');
                } else if (taskProgress === 2) {
                    claimTaskReward(taskId, task.reward); // Claim reward
                    button.textContent = 'Completed';
                    button.disabled = true;
                    showNotification(uiElements.purchaseNotification, 'Reward claimed successfully!');
                }
            };

            taskItem.appendChild(button);
            taskContainer.appendChild(taskItem);
        });
    })
    .catch(error => console.error('Error loading tasks:', error));

// Function to update task progress in the gameState
function updateTaskProgressInGameState(taskId, progress) {
    const taskIndex = gameState.tasksProgress.findIndex(task => task.task_id === taskId);
    if (taskIndex > -1) {
        gameState.tasksProgress[taskIndex].progress = progress;
    } else {
        gameState.tasksProgress.push({ task_id: taskId, progress: progress, claimed: false });
    }
    saveGameState(); // Save the updated game state
}

// Function to claim a reward and update the balance
function claimTaskReward(taskId, reward) {
    const task = gameState.tasksProgress.find(task => task.task_id === taskId);

    if (task && task.claimed) {
        showNotification(uiElements.purchaseNotification, 'You have already claimed this reward.');
        return;
    }

    // Update the user's balance in gameState
    gameState.balance += reward;
    if (task) {
        task.claimed = true;
    } else {
        gameState.tasksProgress.push({ task_id: taskId, progress: 2, claimed: true });
    }

    updateUI(); // Update UI to reflect new balance
    updateUserData(); // Sync user data with the server
    saveGameState(); // Ensure the game state is saved
    showNotification(uiElements.purchaseNotification, `Successfully claimed ${formatNumber(reward)} reward!`);
}
