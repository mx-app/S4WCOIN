function showLevels(group) {
    // إخفاء جميع المستويات
    const levels = document.querySelectorAll('.level-item');
    levels.forEach(level => level.style.display = 'none');

    // حساب النطاق للمستويات المطلوبة (10 مستويات لكل مجموعة)
    const startLevel = (group - 1) * 10 + 1;
    const endLevel = startLevel + 9;

    // إظهار المستويات المطلوبة فقط
    for (let i = startLevel; i <= endLevel; i++) {
        const levelItem = document.getElementById(`level${i}`);
        if (levelItem) {
            levelItem.style.display = 'block';
        }
    }
}

// إظهار المجموعة الأولى افتراضيًا عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => showLevels(1));
