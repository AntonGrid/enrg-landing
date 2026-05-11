// Анимированные метрики
function updateMetrics() {
    document.getElementById('activeNodes').textContent = Math.floor(1200 + Math.random() * 100);
    document.getElementById('powerGen').innerHTML = (80 + Math.random() * 10).toFixed(1) + '<span class="unit">MW</span>';
    document.getElementById('apyVal').textContent = (10 + Math.random() * 5).toFixed(1) + '%';
}
setInterval(updateMetrics, 3000);

// Симуляция графика
const canvas = document.getElementById('energyChart');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
            const x = (i / 19) * canvas.width;
            const y = canvas.height / 2 + Math.sin(i * 0.5 + Date.now() * 0.001) * 50;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        requestAnimationFrame(drawChart);
    }
    drawChart();
}
