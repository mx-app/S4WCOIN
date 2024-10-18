// تٌحًمًيَلَ آلَمًهّآمً مًنِ مًلَفُ JSON
fetch('tasks.json')
    .then(response => response.json())
    .then(tasks => {
        const taskContainer = document.getElementById('taskcontainer');
        if (!taskContainer) {
            console.error('Task container element not found.');
            return;
        }

        taskContainer.innerHTML = ''; // تٌنِظُيَفُ آلَمًحًتٌوٌﮯ قُبًلَ إضآفُةّ آلَمًهّآمً آلَجّدٍيَدٍةّ

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            // إضآفُةّ آلَصّوٌرةّ
            const img = document.createElement('img');
            img.src = task.image;
            img.alt = task.task;
            img.className = 'task-image';
            taskItem.appendChild(img);

            // إضآفُةّ آلَنِصّ آلَخِآصّ بًآلَمًهّمًةّ
            const taskText = document.createElement('p');
            taskText.textContent = `${task.task} - مًکْآفُأةّ: ${task.reward || 5000} عٌمًلَةّ`;
            taskItem.appendChild(taskText);

            // إضآفُةّ آلَزٍر
            const button = document.createElement('button');
            button.className = 'task-button';

            const taskId = task.id;
            const taskProgressData = gameState.tasksprogress.find(t => t.task_id === taskId);
            let taskProgress = taskProgressData ? taskProgressData.progress : 0;

            // تٌحًدٍيَدٍ نِصّ آلَزٍر بًنِآءً عٌلَﮯ تٌقُدٍمً آلَمًهّمًةّ
            button.textContent = taskProgress >= 2 ? 'مًکْتٌمًلَةّ' : taskProgress === 1 ? 'تٌحًقُقُ' : 'آذِهّبً لَلَمًهّمًةّ';
            button.disabled = taskProgress >= 2;

            // آلَتٌعٌآمًلَ مًعٌ آلَنِقُر عٌلَﮯ آلَزٍر
            button.onclick = () => {
                if (taskProgress === 0) {
                    window.open(task.link, '_blank');
                    taskProgress = 1;
                    updateTaskProgressInGameState(taskId, taskProgress);
                    button.textContent = 'تٌحًقُقُ';
                    showNotification(uiElements.purchaseNotification, 'تٌمً فُتٌحً آلَمًهّمًةّ، تٌحًقُقُ لَلَمًطِآلَبًةّ بًآلَمًکْآفُأةّ.');
                } else if (taskProgress === 1) {
                    taskProgress = 2;
                    updateTaskProgressInGameState(taskId, taskProgress);
                    button.textContent = 'آطِلَبً آلَمًکْآفُأةّ';
                    showNotification(uiElements.purchaseNotification, 'تٌمً آلَتٌحًقُقُ مًنِ آلَمًهّمًةّ، يَمًکْنِکْ آلَآنِ آلَمًطِآلَبًةّ بًآلَمًکْآفُأةّ.');
                } else if (taskProgress === 2) {
                    claimTaskReward(taskId, task.reward);
                    button.textContent = 'مًکْتٌمًلَةّ';
                    button.disabled = true;
                    showNotification(uiElements.purchaseNotification, 'تٌمً آلَمًطِآلَبًةّ بًآلَمًکْآفُأةّ بًنِجّآحً!');
                }
            };

            taskItem.appendChild(button);
            taskContainer.appendChild(taskItem);
        });
    })
    .catch(error => console.error('Error loading tasks:', error));

// تٌحًدٍيَثً تٌقُدٍمً آلَمًهّمًةّ فُيَ gameState
function updateTaskProgressInGameState(taskId, progress) {
    const taskIndex = gameState.tasksprogress.findIndex(task => task.task_id === taskId);
    if (taskIndex > -1) {
        gameState.tasksprogress[taskIndex].progress = progress;
    } else {
        gameState.tasksprogress.push({ task_id: taskId, progress: progress, claimed: false });
    }
    saveGameState(); // حًفُظُ حًآلَةّ آلَلَعٌبًةّ آلَمًحًدٍثًةّ
}

// آلَمًطِآلَبًةّ بًمًکْآفُأةّ آلَمًهّمًةّ وٌتٌحًدٍيَثً آلَرصّيَدٍ
function claimTaskReward(taskId, reward) {
    const task = gameState.tasksprogress.find(task => task.task_id === taskId);

    if (task && task.claimed) {
        showNotification(uiElements.purchaseNotification, 'لَقُدٍ قُمًتٌ بًآلَمًطِآلَبًةّ بًهّذِهّ آلَمًکْآفُأةّ بًآلَفُعٌلَ.');
        return;
    }

    // تٌحًدٍيَثً رصّيَدٍ آلَمًسِتٌخِدٍمً فُيَ gameState
    gameState.balance += reward;
    if (task) {
        task.claimed = true;
    } else {
        gameState.tasksprogress.push({ task_id: taskId, progress: 2, claimed: true });
    }

    updateUI(); // تٌحًدٍيَثً وٌآجّهّةّ آلَمًسِتٌخِدٍمً
    updateUserData(); // مًزٍآمًنِةّ بًيَآنِآتٌ آلَمًسِتٌخِدٍمً مًعٌ آلَسِيَرفُر
    saveGameState(); // حًفُظُ حًآلَةّ آلَلَعٌبًةّ
    showNotification(uiElements.purchaseNotification, `تٌمًتٌ آلَمًطِآلَبًةّ بًنِجّآحً بًمًکْآفُأةّ ${formatNumber(reward)} عٌمًلَةّ!`);
}
