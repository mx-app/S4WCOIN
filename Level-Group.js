document.addEventListener('DOMContentLoaded', function() {
    // إظهار المجموعة الأولى افتراضيًا عند تحميل الصفحة
    showLevels(1);

    // الحصول على الأزرار من DOM
    const buttons = document.querySelectorAll('#navigationButtons button');

    // إضافة مستمع حدث لكل زر
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const levelRange = button.textContent.match(/\d+/g);
            const levelStart = parseInt(levelRange[0]);
            const levelEnd = parseInt(levelRange[1]);
            showLevels(levelStart, levelEnd);
        });
    });
});

function showLevels(start, end) {
    // إخفاء جميع المستويات
    const levels = document.querySelectorAll('.level-item');
    levels.forEach(level => level.style.display = 'none');

    // إظهار المستويات المطلوبة فقط
    for (let i = start; i <= end; i++) {
        const levelItem = document.getElementById(`level${i}`);
        if (levelItem) {
            levelItem.style.display = 'block';
        }
    }
}
