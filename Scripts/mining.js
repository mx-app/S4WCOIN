   // دالة لفتح محتوى صفحة التعدين داخل الحاوية
    function openMiningPage() {
        // استخدام fetch لتحميل محتوى صفحة التعدين
        fetch('Data/mining.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load mining page');
                }
                return response.text();  // استخراج النص من الرد
            })
            .then(data => {
                // تحميل المحتوى داخل حاوية #mining-container
                document.getElementById('mining-container').innerHTML = data;
            })
            .catch(error => {
                console.error('Error loading mining page:', error);
            });
    }
