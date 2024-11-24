// منع القائمة السياقية
        document.addEventListener("contextmenu", function(event) {
            event.preventDefault();
        });

        // منع الضغط المطوّل على العناصر
        document.querySelectorAll("img, p").forEach(element => {
            element.addEventListener("mousedown", e => e.preventDefault());
            element.addEventListener("touchstart", e => e.preventDefault());
        });



document.addEventListener('DOMContentLoaded', function() {
    // إظهار المستويات العشر الأولى افتراضيًا عند تحميل الصفحة
    showLevels(1, 10);

    // الحصول على الأزرار من DOM
    const buttons = document.querySelectorAll('#navigationButtons button');

    // إضافة مستمع حدث لكل زر مع نطاق محدد
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // إزالة الخلفية النشطة من جميع الأزرار
            buttons.forEach(btn => btn.classList.remove('active'));
            // إضافة الخلفية النشطة للزر الحالي
            button.classList.add('active');
            
            let levelStart, levelEnd;

            // تحديد نطاق المستويات بناءً على ترتيب الزر
            switch (index) {
                case 0: // Beginner's
                    levelStart = 1;
                    levelEnd = 10;
                    break;
                case 1: // Novice
                    levelStart = 11;
                    levelEnd = 20;
                    break;
                case 2: // Intermediate
                    levelStart = 21;
                    levelEnd = 30;
                    break;
                case 3: // Advanced
                    levelStart = 31;
                    levelEnd = 40;
                    break;
                case 4: // Expert's
                    levelStart = 41;
                    levelEnd = 50;
                    break;
            }

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
