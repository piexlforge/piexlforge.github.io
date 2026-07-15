let tempChart, humiChart, nh3Chart, heroChart;
let lightState = false;
let fanState = false;
let tempData = [], humiData = [], nh3Data = [], heroData = [];
let timeLabels = [];
let currentAuthMode = 'login';
let loggedInUser = null;

const mockUsers = [
    { email: 'admin@envguard.com', password: '123456', name: '管理员' },
    { email: 'user@example.com', password: 'password', name: '测试用户' }
];

function initCharts() {
    const ctx = {
        temp: document.getElementById('temp-chart').getContext('2d'),
        humi: document.getElementById('humi-chart').getContext('2d'),
        nh3: document.getElementById('nh3-chart').getContext('2d'),
        hero: document.getElementById('hero-chart').getContext('2d')
    };

    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#165DFF',
                bodyColor: '#F8FAFC',
                borderColor: '#2D3A4F',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                display: false
            }
        },
        animation: {
            duration: 600,
            easing: 'easeOutQuart'
        }
    };

    tempChart = new Chart(ctx.temp, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                data: tempData,
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: chartConfig
    });

    humiChart = new Chart(ctx.humi, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                data: humiData,
                borderColor: '#165DFF',
                backgroundColor: 'rgba(22, 93, 255, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: chartConfig
    });

    nh3Chart = new Chart(ctx.nh3, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                data: nh3Data,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: chartConfig
    });

    heroChart = new Chart(ctx.hero, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                data: heroData,
                borderColor: '#165DFF',
                backgroundColor: 'rgba(22, 93, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: chartConfig
    });
}

function generateSensorData() {
    return {
        temp: 20 + Math.random() * 6,
        humi: 60 + Math.random() * 20,
        nh3: 20 + Math.random() * 12
    };
}

function updateDashboard() {
    const data = generateSensorData();
    
    document.getElementById('temp-value').textContent = data.temp.toFixed(1);
    document.getElementById('humi-value').textContent = data.humi.toFixed(1);
    document.getElementById('nh3-value').textContent = data.nh3.toFixed(1);
    
    document.getElementById('hero-temp').textContent = data.temp.toFixed(1);
    document.getElementById('hero-humi').textContent = data.humi.toFixed(1);
    document.getElementById('hero-nh3').textContent = data.nh3.toFixed(1);

    const tempStatus = document.querySelector('.sensor-card.temperature .card-status');
    const humiStatus = document.querySelector('.sensor-card.humidity .card-status');
    const nh3Status = document.querySelector('.sensor-card.nh3 .card-status');

    const tempLow = parseFloat(document.getElementById('temp-low').value);
    const tempHigh = parseFloat(document.getElementById('temp-high').value);
    const humiLow = parseFloat(document.getElementById('humi-low').value);
    const humiHigh = parseFloat(document.getElementById('humi-high').value);
    const nh3Threshold = parseFloat(document.getElementById('nh3-threshold').value);

    updateCardStatus(tempStatus, data.temp < tempLow || data.temp > tempHigh);
    updateCardStatus(humiStatus, data.humi < humiLow || data.humi > humiHigh);
    
    if (data.nh3 >= nh3Threshold) {
        setCardStatus(nh3Status, 'danger', '超标');
    } else if (data.nh3 >= nh3Threshold * 0.85) {
        setCardStatus(nh3Status, 'warning', '接近阈值');
    } else {
        setCardStatus(nh3Status, 'normal', '正常');
    }

    const now = new Date();
    const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    
    timeLabels.push(timeStr);
    tempData.push(data.temp);
    humiData.push(data.humi);
    nh3Data.push(data.nh3);
    heroData.push((data.temp + data.humi + data.nh3) / 3);

    if (timeLabels.length > 10) {
        timeLabels.shift();
        tempData.shift();
        humiData.shift();
        nh3Data.shift();
        heroData.shift();
    }

    [tempChart, humiChart, nh3Chart, heroChart].forEach(chart => {
        if (chart) {
            chart.update();
        }
    });
}

function updateCardStatus(element, isAbnormal) {
    if (isAbnormal) {
        setCardStatus(element, 'danger', '异常');
    } else {
        setCardStatus(element, 'normal', '正常');
    }
}

function setCardStatus(element, status, text) {
    element.className = 'card-status ' + status;
    element.innerHTML = '<span class="status-dot"></span><span>' + text + '</span>';
}

function toggleDevice(device) {
    const toggleBtn = document.getElementById(device + '-toggle');
    const statusSpan = document.getElementById(device + '-status');

    if (device === 'light') {
        lightState = !lightState;
        statusSpan.textContent = lightState ? '开启' : '关闭';
        statusSpan.className = 'control-status' + (lightState ? ' active' : '');
    } else if (device === 'fan') {
        fanState = !fanState;
        statusSpan.textContent = fanState ? '开启' : '关闭';
        statusSpan.className = 'control-status' + (fanState ? ' active' : '');
    }

    toggleBtn.className = 'toggle-btn' + ((device === 'light' ? lightState : fanState) ? ' active' : '');
}

function testBuzzer() {
    const statusSpan = document.getElementById('buzzer-status');
    statusSpan.textContent = '测试中...';
    statusSpan.className = 'control-status';
    
    setTimeout(() => {
        statusSpan.textContent = '测试完成';
        statusSpan.className = 'control-status active';
        setTimeout(() => {
            statusSpan.textContent = '就绪';
            statusSpan.className = 'control-status';
        }, 2000);
    }, 3000);
}

function saveAlertsConfig() {
    showDialog('success', '配置保存成功', '告警阈值配置已更新');
}

function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function handleDemoClick() {
    if (loggedInUser) {
        scrollToSection('dashboard');
    } else {
        showDialog('info', '需要登录', '请先登录以查看实时监测面板');
        setTimeout(() => {
            openModal('login');
        }, 1500);
    }
}

function openModal(mode) {
    currentAuthMode = mode;
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const nameGroup = document.getElementById('name-group');
    const confirmGroup = document.getElementById('confirm-group');
    const authSwitch = document.getElementById('auth-switch');
    const linkBtn = document.querySelector('.modal-footer .link-btn');

    if (mode === 'login') {
        title.textContent = '登录';
        submitBtn.textContent = '登录';
        nameGroup.style.display = 'none';
        confirmGroup.style.display = 'none';
        authSwitch.textContent = '还没有账号？';
        linkBtn.textContent = '立即注册';
    } else {
        title.textContent = '注册';
        submitBtn.textContent = '注册';
        nameGroup.style.display = 'flex';
        confirmGroup.style.display = 'flex';
        authSwitch.textContent = '已有账号？';
        linkBtn.textContent = '立即登录';
    }

    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('name').value = '';
    document.getElementById('confirm-password').value = '';

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function switchAuthMode() {
    if (currentAuthMode === 'login') {
        openModal('register');
    } else {
        openModal('login');
    }
}

function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!email || !password) {
        showDialog('error', '输入错误', '请填写邮箱和密码');
        return;
    }

    if (!isValidEmail(email)) {
        showDialog('error', '输入错误', '请输入有效的邮箱地址');
        return;
    }

    if (currentAuthMode === 'register') {
        if (!name) {
            showDialog('error', '输入错误', '请填写用户名');
            return;
        }
        
        if (password.length < 6) {
            showDialog('error', '输入错误', '密码长度至少6位');
            return;
        }
        
        if (password !== confirmPassword) {
            showDialog('error', '输入错误', '两次输入的密码不一致');
            return;
        }

        if (mockUsers.some(u => u.email === email)) {
            showDialog('error', '注册失败', '该邮箱已被注册');
            return;
        }

        mockUsers.push({ email, password, name });
        showDialog('success', '注册成功', '您已成功注册，请登录');
        closeModal();
    } else {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            loggedInUser = user;
            updateUserMenu();
            showDialog('success', '登录成功', '欢迎回来，' + user.name);
            closeModal();
        } else {
            showDialog('error', '登录失败', '邮箱或密码错误');
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function logout() {
    loggedInUser = null;
    updateUserMenu();
    showDialog('info', '已退出登录', '您已安全退出');
}

function updateUserMenu() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const avatar = document.querySelector('.avatar');
    
    const dashboardSection = document.getElementById('dashboard');
    const alertsSection = document.getElementById('alerts');
    const footerDashboard = document.getElementById('footer-dashboard');
    const footerAlerts = document.getElementById('footer-alerts');
    const navDashboard = document.getElementById('nav-dashboard');
    const navAlerts = document.getElementById('nav-alerts');

    if (loggedInUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = loggedInUser.name;
        avatar.textContent = loggedInUser.name.charAt(0);
        
        dashboardSection.classList.remove('hidden-section');
        alertsSection.classList.remove('hidden-section');
        
        if (footerDashboard) footerDashboard.style.display = 'inline-block';
        if (footerAlerts) footerAlerts.style.display = 'inline-block';
        if (navDashboard) navDashboard.style.display = 'block';
        if (navAlerts) navAlerts.style.display = 'block';
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        
        dashboardSection.classList.add('hidden-section');
        alertsSection.classList.add('hidden-section');
        
        if (footerDashboard) footerDashboard.style.display = 'none';
        if (footerAlerts) footerAlerts.style.display = 'none';
        if (navDashboard) navDashboard.style.display = 'none';
        if (navAlerts) navAlerts.style.display = 'none';
    }
}

function showDialog(type, title, message) {
    const overlay = document.getElementById('dialog-overlay');
    const icon = document.getElementById('dialog-icon');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMessage = document.getElementById('dialog-message');

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    
    icon.className = 'dialog-icon ' + type;
    
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDialog() {
    const overlay = document.getElementById('dialog-overlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    smoothScroll();
    updateUserMenu();
    
    window.addEventListener('scroll', handleScroll);
    
    for (let i = 0; i < 5; i++) {
        const data = generateSensorData();
        timeLabels.push('');
        tempData.push(data.temp);
        humiData.push(data.humi);
        nh3Data.push(data.nh3);
        heroData.push((data.temp + data.humi + data.nh3) / 3);
    }
    
    [tempChart, humiChart, nh3Chart, heroChart].forEach(chart => {
        if (chart) {
            chart.update();
        }
    });

    setInterval(updateDashboard, 2000);
});