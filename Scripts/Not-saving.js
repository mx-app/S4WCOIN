// منع القائمة السياقية
        document.addEventListener("contextmenu", function(event) {
            event.preventDefault();
        });

        // منع الضغط المطوّل على العناصر
        document.querySelectorAll("img, p").forEach(element => {
            element.addEventListener("mousedown", e => e.preventDefault());
            element.addEventListener("touchstart", e => e.preventDefault());
        });

function animateBalance(balance) {
    const balanceElement = document.getElementById("balanceAmount");
    let currentBalance = 0;

    const interval = setInterval(() => {
        if (currentBalance >= balance) {
            clearInterval(interval);
        } else {
            currentBalance += Math.ceil(balance / 50); // زيادة تدريجية
            balanceElement.innerText = currentBalance.toLocaleString("en-US");
        }
    }, 20); // تحديث الرقم كل 20 ملي ثانية
}
