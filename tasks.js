document.addEventListener('DOMContentLoaded', () => {
    const taskContainer = document.getElementById('taskcontainer');
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    const buttons = taskContainer.querySelectorAll('.task-button');

    // Define task URLs by task ID
    const taskUrls = {
        5: "https://t.me/Jigsaw_News",
        6: "https://t.me/SAW_COIN",
        7: "https://t.me/SAWCOIN_BOT?start=6793556284"
    };

    buttons.forEach(button => {
        const taskId = parseInt(button.getAttribute('data-task-id'));
        const taskReward = parseInt(button.getAttribute('data-reward'));

        const taskProgressData = gameState.tasksprogress.find(t => t.task_id === taskId);
        let taskProgress = taskProgressData ? taskProgressData.progress : 0;

        // Set button text based on task progress
        button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Verify' : ' Go ';
        button.disabled = taskProgress >= 2;

        // Button click handling
        button.onclick = () => {
            const taskUrl = taskUrls[taskId];
            if (!taskUrl) {
                console.error(`Task URL for task ID ${taskId} not found.`);
                return;
            }

            if (taskProgress === 0) {
                // Fallback to window.open if not in Telegram WebApp
                window.open(taskUrl, '_blank');
                taskProgress = 1;
                updateTaskProgressInGameState(taskId, taskProgress);
                button.textContent = 'Verify';
                showNotification(uiElements.purchaseNotification, 'Task opened. Verify to claim your reward.');
            } else if (taskProgress === 1) {
                // Verify task and enable reward claiming
                taskProgress = 2;
                updateTaskProgressInGameState(taskId, taskProgress);
                button.textContent = 'Claim';
                showNotification(uiElements.purchaseNotification, 'Task verified. You can now claim the reward.');
            } else if (taskProgress === 2) {
                // Claim the reward
                claimTaskReward(taskId, taskReward);
                button.textContent = 'Completed';
                button.disabled = true;
                showNotification(uiElements.purchaseNotification, 'Reward successfully claimed!');
            }
        };
    });
});

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
