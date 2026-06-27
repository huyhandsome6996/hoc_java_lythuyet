// ===== STATE =====
const learnedSet = new Set();
let logicA = true, logicB = true;
let forState = { i: 0, running: false, output: '' };

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Initialize all interactive elements
    initArray1D();
    initMatrix();
    initSwitchFlow();
    updateIfElse();
    updateStars();
    runCalc();
    updateLogicDisplay();

    // Intersection observer for progress
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (id.startsWith('q')) {
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    const navLink = document.querySelector(`.nav-item[href="#${id}"]`);
                    if (navLink) navLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.question-card').forEach(card => observer.observe(card));
});

// ===== PROGRESS =====
function updateProgress() {
    const total = 17;
    const learned = learnedSet.size;
    const pct = (learned / total) * 100;
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = `${learned}/${total}`;

    // Save to localStorage
    localStorage.setItem('javaLearned', JSON.stringify([...learnedSet]));
}

function toggleMark(q) {
    const btn = document.querySelectorAll('.question-card')[q - 1]?.querySelector('.mark-btn');
    const card = document.getElementById('q' + q);
    const navItem = document.querySelector(`.nav-item[data-q="${q}"]`);

    if (learnedSet.has(q)) {
        learnedSet.delete(q);
        btn?.classList.remove('marked');
        btn && (btn.textContent = '☑ Đánh dấu đã học');
        card?.classList.remove('learned');
        navItem?.classList.remove('learned');
    } else {
        learnedSet.add(q);
        btn?.classList.add('marked');
        btn && (btn.textContent = '✅ Đã học');
        card?.classList.add('learned');
        navItem?.classList.add('learned');
    }
    updateProgress();
}

// Load saved progress
(function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem('javaLearned') || '[]');
        saved.forEach(q => {
            learnedSet.add(q);
            const btn = document.querySelectorAll('.question-card')[q - 1]?.querySelector('.mark-btn');
            const card = document.getElementById('q' + q);
            const navItem = document.querySelector(`.nav-item[data-q="${q}"]`);
            btn?.classList.add('marked');
            btn && (btn.textContent = '✅ Đã học');
            card?.classList.add('learned');
            navItem?.classList.add('learned');
        });
        setTimeout(updateProgress, 100);
    } catch (e) {}
})();

// ===== Q1: STRUCTURE BUILDER =====
const structInfo = {
    package: {
        title: '📦 Khai báo gói (package)',
        desc: 'Xác định không gian tên chứa class. Ví dụ: <code>package com.example;</code>. Không bắt buộc nhưng nên có để tổ chức code. Nếu có, phải là dòng đầu tiên trong file.',
        code: 'package com.myapp;'
    },
    class: {
        title: '🏗️ Khai báo class',
        desc: 'Mọi chương trình Java đều phải nằm trong một class. Tên class phải trùng với tên file .java. Phạm vi truy cập thường là <code>public</code>. Một file chỉ có tối đa 1 public class.',
        code: 'public class MyClass { ... }'
    },
    main: {
        title: '🚀 Phương thức main()',
        desc: 'Điểm bắt đầu thực thi chương trình. Cú pháp cố định: <code>public static void main(String[] args)</code>. JVM tìm và gọi phương thức này khi chạy. <strong>public</strong> = JVM có thể gọi từ ngoài; <strong>static</strong> = không cần tạo object; <strong>void</strong> = không trả về.',
        code: 'public static void main(String[] args) { ... }'
    },
    statement: {
        title: '📝 Câu lệnh (statements)',
        desc: 'Các lệnh thực thi đặt bên trong phương thức. Mỗi câu lệnh kết thúc bằng dấu chấm phẩy <code>;</code>. Ví dụ: gán biến, gọi hàm, in kết quả...',
        code: 'int x = 10;\nSystem.out.println(x);'
    },
    comment: {
        title: '💬 Chú thích (comments)',
        desc: 'Không ảnh hưởng đến việc thực thi. Ba loại: <code>//</code> một dòng, <code>/* */</code> nhiều dòng, <code>/** */</code> Javadoc. Giúp code dễ đọc và bảo trì.',
        code: '// Ghi chú một dòng\n/* Khối chú thích */'
    }
};

function showStructInfo(part) {
    const info = structInfo[part];
    const box = document.getElementById('structInfoBox');
    box.innerHTML = `<h5>${info.title}</h5><p>${info.desc}</p><pre class="theory-code">${info.code}</pre>`;

    document.querySelectorAll('.struct-block').forEach(b => b.classList.remove('active'));
    document.querySelector(`.struct-block[data-part="${part}"]`)?.classList.add('active');
}

// ===== Q2: COMMENT ANALYZER =====
function analyzeComment() {
    const input = document.getElementById('commentInput').value.trim();
    const result = document.getElementById('commentResult');

    if (!input) {
        result.innerHTML = '<span style="color:var(--text-muted)">Vui lòng nhập chú thích</span>';
        return;
    }

    let type, color, explanation;
    if (input.startsWith('//')) {
        type = 'Chú thích một dòng';
        color = 'var(--accent)';
        explanation = 'Mọi nội dung sau // trên cùng dòng bị bỏ qua. Dùng cho ghi chú ngắn gọn.';
    } else if (input.startsWith('/**')) {
        type = 'Chú thích Javadoc';
        color = 'var(--success)';
        explanation = 'Dùng để tạo tài liệu API tự động bằng công cụ javadoc. Có thể chứa các tag như @param, @return.';
    } else if (input.startsWith('/*')) {
        type = 'Chú thích nhiều dòng';
        color = 'var(--warning)';
        explanation = 'Bỏ qua mọi nội dung giữa /* và */. Dùng để giải thích logic phức tạp hoặc tạm vô hiệu hóa code.';
    } else {
        type = 'Không phải chú thích';
        color = 'var(--danger)';
        explanation = 'Đây là code thực thi, không phải chú thích. Java sẽ cố gắng biên dịch và chạy dòng này.';
    }

    result.innerHTML = `<div style="color:${color};font-weight:700;margin-bottom:8px">${type}</div><div style="color:var(--text-muted)">${explanation}</div>`;
}

// ===== Q3: TYPE VISUALIZER =====
const typeData = {
    byte: { name: 'byte', size: '1 byte', range: '-128 đến 127', default: '0', group: 'Số nguyên', example: "byte b = 100;" },
    short: { name: 'short', size: '2 byte', range: '-32,768 đến 32,767', default: '0', group: 'Số nguyên', example: "short s = 30000;" },
    int: { name: 'int', size: '4 byte', range: '-2,147,483,648 đến 2,147,483,647', default: '0', group: 'Số nguyên', example: "int i = 2000000;" },
    long: { name: 'long', size: '8 byte', range: '-9,223,372,036,854,775,808 đến 9,223,372,036,854,775,807', default: '0', group: 'Số nguyên', example: "long l = 9000000000L; // cần hậu tố L" },
    float: { name: 'float', size: '4 byte', range: '~3.4E38 (7 chữ số có nghĩa)', default: '0.0f', group: 'Số thực', example: "float f = 3.14f; // cần hậu tố f" },
    double: { name: 'double', size: '8 byte', range: '~1.8E308 (15 chữ số có nghĩa)', default: '0.0', group: 'Số thực', example: "double d = 3.141592653589;" },
    char: { name: 'char', size: '2 byte', range: '0 đến 65535 (Unicode)', default: "'\\u0000'", group: 'Ký tự', example: "char c = 'A';" },
    boolean: { name: 'boolean', size: '1 bit', range: 'true hoặc false', default: 'false', group: 'Logic', example: "boolean flag = true;" }
};

function showTypeInfo(type) {
    const info = typeData[type];
    const box = document.getElementById('typeInfoBox');
    box.innerHTML = `
        <h5 style="color:var(--accent)">${info.name} — Nhóm: ${info.group}</h5>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
            <div><strong>Kích thước:</strong> ${info.size}</div>
            <div><strong>Phạm vi:</strong> ${info.range}</div>
            <div><strong>Giá trị mặc định:</strong> <code>${info.default}</code></div>
            <div><strong>Ví dụ:</strong> <code>${info.example}</code></div>
        </div>`;

    document.querySelectorAll('.type-bar').forEach(b => b.classList.remove('active'));
    document.querySelector(`.type-bar[data-type="${type}"]`)?.classList.add('active');
}

// ===== Q4: SCOPE SIMULATOR =====
function highlightScope(type) {
    const info = document.getElementById('scopeInfo');
    if (type === 'static') {
        info.innerHTML = '<strong style="color:var(--accent)">Biến static (demLan)</strong>: Khai báo với từ khoá <code>static</code> ngoài phương thức. Dùng chung cho toàn bộ class. Tồn tại suốt vòng đời chương trình. Có giá trị mặc định = 0.';
    } else {
        info.innerHTML = '<strong style="color:var(--warning)">Biến cục bộ (tuoi)</strong>: Khai báo bên trong phương thức main(). Chỉ tồn tại trong phạm vi phương thức đó. Không có giá trị mặc định — phải khởi tạo trước khi dùng.';
    }
}

function runScopeSim() {
    const output = document.getElementById('scopeOutput');
    output.innerHTML = '';
    const steps = [
        'static int demLan = 0;  // Biến static khởi tạo = 0',
        '→ vào main()',
        'int tuoi = 20;  // Biến cục bộ, chỉ tồn tại trong main()',
        'double diemTB = 8.5;  // Biến cục bộ',
        'demLan++;  // demLan = 1 (thay đổi biến static)',
        'In: "Tuoi: 20, Diem: 8.5"',
        'In: "Dem lan: 1"',
        '→ thoát main() — biến tuoi, diemTB bị hủy',
        '→ biến demLan vẫn tồn tại (static)'
    ];
    steps.forEach((step, i) => {
        setTimeout(() => {
            output.innerHTML += step + '\n';
        }, i * 400);
    });
}

// ===== Q5: CALCULATOR =====
function runCalc() {
    const a = parseInt(document.getElementById('calcA').value) || 0;
    const b = parseInt(document.getElementById('calcB').value) || 1;

    document.getElementById('calcAdd').textContent = a + b;
    document.getElementById('calcSub').textContent = a - b;
    document.getElementById('calcMul').textContent = a * b;
    document.getElementById('calcDiv').textContent = b !== 0 ? Math.floor(a / b) : 'NaN';
    document.getElementById('calcMod').textContent = b !== 0 ? a % b : 'NaN';

    // Modulo visualization
    if (b > 0 && a >= 0) {
        const blocks = document.getElementById('moduloBlocks');
        const explain = document.getElementById('moduloExplain');
        blocks.innerHTML = '';

        const fullGroups = Math.floor(a / b);
        const remainder = a % b;

        for (let g = 0; g < fullGroups; g++) {
            for (let j = 0; j < b; j++) {
                const div = document.createElement('div');
                div.className = 'mod-block group-b';
                div.textContent = '1';
                blocks.appendChild(div);
            }
        }
        for (let r = 0; r < remainder; r++) {
            const div = document.createElement('div');
            div.className = 'mod-block remainder';
            div.textContent = '1';
            blocks.appendChild(div);
        }

        explain.textContent = `${a} = ${fullGroups} × ${b} + ${remainder} → ${a} % ${b} = ${remainder}`;
    }
}

// ===== Q6: LOGIC GATES =====
function toggleLogic(which) {
    if (which === 'A') {
        logicA = !logicA;
    } else {
        logicB = !logicB;
    }
    updateLogicDisplay();
}

function updateLogicDisplay() {
    const btnA = document.getElementById('logicA');
    const btnB = document.getElementById('logicB');

    btnA.textContent = logicA;
    btnA.className = 'toggle-btn ' + (logicA ? 'true-val' : 'false-val');

    btnB.textContent = logicB;
    btnB.className = 'toggle-btn ' + (logicB ? 'true-val' : 'false-val');

    const andResult = logicA && logicB;
    const orResult = logicA || logicB;
    const notResult = !logicA;

    const andEl = document.getElementById('andResult');
    andEl.textContent = andResult;
    andEl.className = 'gate-result ' + (andResult ? 'true-val' : 'false-val');

    const orEl = document.getElementById('orResult');
    orEl.textContent = orResult;
    orEl.className = 'gate-result ' + (orResult ? 'true-val' : 'false-val');

    const notEl = document.getElementById('notResult');
    notEl.textContent = notResult;
    notEl.className = 'gate-result ' + (notResult ? 'true-val' : 'false-val');
}

// ===== Q7: IF-ELSE SIMULATOR =====
function updateIfElse() {
    const diem = parseFloat(document.getElementById('diemSlider').value);
    document.getElementById('diemVal').textContent = diem.toFixed(1);

    const conditions = [
        { id: 'cond1', threshold: 9.0, label: 'Xuất sắc' },
        { id: 'cond2', threshold: 8.0, label: 'Giỏi' },
        { id: 'cond3', threshold: 6.5, label: 'Khá' },
        { id: 'cond4', threshold: 5.0, label: 'Trung bình' },
    ];

    let matched = false;
    let resultLabel = 'Yếu';

    conditions.forEach((cond, i) => {
        const node = document.getElementById(cond.id);
        const resultEl = document.getElementById(cond.id + 'Result');
        const branch = node.querySelector('.flow-branch');

        if (matched) {
            node.className = 'flow-node condition dim';
            resultEl.textContent = '⏭️';
            branch.classList.remove('active-branch');
        } else if (diem >= cond.threshold) {
            node.className = 'flow-node condition active-branch';
            resultEl.textContent = '✅';
            branch.classList.add('active-branch');
            matched = true;
            resultLabel = cond.label;
        } else {
            node.className = 'flow-node condition';
            resultEl.textContent = '❌';
            branch.classList.remove('active-branch');
        }
    });

    const elseNode = document.getElementById('cond5');
    if (matched) {
        elseNode.className = 'flow-node else-node dim';
    } else {
        elseNode.className = 'flow-node else-node active-branch';
        elseNode.querySelector('.flow-branch').classList.add('active-branch');
        resultLabel = 'Yếu';
    }

    if (matched) {
        elseNode.querySelector('.flow-branch').classList.remove('active-branch');
    }

    document.getElementById('ifelseOutput').innerHTML = `Kết quả: <strong>${resultLabel}</strong> (diemTB = ${diem.toFixed(1)})`;
}

// ===== Q8: SWITCH SIMULATOR =====
function initSwitchFlow() {
    updateSwitch();
}

function updateSwitch() {
    const val = parseInt(document.getElementById('switchVal').value);
    const hasBreak = document.getElementById('hasBreak').checked;
    const flow = document.getElementById('switchFlow');
    const output = document.getElementById('switchOutput');

    const cases = [
        { val: 2, label: 'Thứ Hai' },
        { val: 3, label: 'Thứ Ba' },
        { val: 4, label: 'Thứ Tư' },
        { val: 5, label: 'Thứ Năm' },
        { val: 6, label: 'Thứ Sáu' },
        { val: 7, label: 'Thứ Bảy' },
        { val: 8, label: 'Chủ Nhật' },
    ];

    flow.innerHTML = '';
    let outputText = '';
    let matched = false;
    let stopped = false;

    cases.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'switch-case';

        if (stopped) {
            // After break, skip
        } else if (c.val === val) {
            div.classList.add('matched');
            matched = true;
            outputText += `case ${c.val}: "${c.label}"`;
            if (hasBreak) {
                div.classList.add('executed');
                stopped = true;
                outputText += ' → break!';
            } else {
                div.classList.add('executed');
            }
        } else if (matched && !stopped) {
            div.classList.add('fallthrough');
            outputText += ` → fall-through case ${c.val}: "${c.label}"`;
            if (hasBreak) {
                stopped = true;
                outputText += ' → break!';
            }
        }

        div.textContent = `case ${c.val}: ${c.label}`;
        flow.appendChild(div);
    });

    // Default case
    const defaultDiv = document.createElement('div');
    defaultDiv.className = 'switch-case';
    defaultDiv.textContent = 'default: Không hợp lệ';

    if (!matched && !stopped) {
        defaultDiv.classList.add('matched', 'executed');
        defaultDiv.classList.add('default-case');
        outputText = `default: "Không hợp lệ" (không có case khớp)`;
    } else if (matched && !stopped) {
        defaultDiv.classList.add('fallthrough');
        outputText += ' → default';
    }

    flow.appendChild(defaultDiv);

    output.innerHTML = `<strong>Giá trị:</strong> thu = ${val}<br><strong>Kết quả:</strong> ${outputText}${!hasBreak && matched ? '<br><span style="color:var(--warning)">⚠️ Fall-through! Không có break nên chạy tiếp các case sau.</span>' : ''}`;
}

// ===== Q9: FOR LOOP SIMULATOR =====
function forStep() {
    if (!forState.running) {
        forState = { i: 1, running: true, output: '' };
    }

    if (forState.i <= 10) {
        const result = `5 x ${forState.i} = ${5 * forState.i}`;
        forState.output += result + '\n';
        document.getElementById('forOutput').textContent = forState.output;
        document.getElementById('forI').textContent = forState.i;
        document.getElementById('forCheck').textContent = 'true';
        document.getElementById('forStep').textContent = `Thực thi i=${forState.i}`;
        forState.i++;
    } else {
        document.getElementById('forCheck').textContent = 'false → THOÁT';
        document.getElementById('forStep').textContent = 'Vòng lặp kết thúc';
        forState.running = false;
        document.getElementById('forOutput').textContent += '\n// Vòng lặp kết thúc!';
    }
}

function forReset() {
    forState = { i: 0, running: false, output: '' };
    document.getElementById('forI').textContent = '-';
    document.getElementById('forCheck').textContent = '-';
    document.getElementById('forStep').textContent = 'Chưa bắt đầu';
    document.getElementById('forOutput').textContent = '';
}

// ===== Q10: WHILE VS DO-WHILE =====
function runWhileSim(type) {
    if (type === 'while') {
        const n = parseInt(document.getElementById('whileN').value);
        const limit = parseInt(document.getElementById('whileLimit').value);
        const flow = document.getElementById('whileFlow');
        const output = document.getElementById('whileOutput');
        flow.innerHTML = '';
        output.textContent = '';

        let current = n;
        let steps = 0;
        let result = [];

        // Check condition first
        flow.innerHTML += `<div class="flow-step check">Kiểm tra: ${current} <= ${limit} → ${current <= limit}</div>`;

        while (current <= limit && steps < 20) {
            flow.innerHTML += `<div class="flow-step exec">Thực thi: n = ${current}</div>`;
            result.push(current);
            current += 2;
            steps++;
            flow.innerHTML += `<div class="flow-step check">Kiểm tra: ${current} <= ${limit} → ${current <= limit}</div>`;
        }

        if (result.length === 0) {
            flow.innerHTML += `<div class="flow-step skip">❌ Khối lệnh KHÔNG được thực thi (điều kiện sai từ đầu)</div>`;
        }

        output.textContent = 'Kết quả: ' + (result.length > 0 ? result.join(', ') : '(không có kết quả)');
    } else {
        const n = parseInt(document.getElementById('doWhileN').value);
        const limit = parseInt(document.getElementById('doWhileLimit').value);
        const flow = document.getElementById('dowhileFlow');
        const output = document.getElementById('dowhileOutput');
        flow.innerHTML = '';
        output.textContent = '';

        let current = n;
        let steps = 0;
        let result = [];

        // Do: execute first
        flow.innerHTML += `<div class="flow-step exec">Thực thi trước: n = ${current} ✅ (ít nhất 1 lần!)</div>`;
        result.push(current);
        current -= 1;
        steps++;

        // Then check
        flow.innerHTML += `<div class="flow-step check">Kiểm tra: ${current} >= 1 → ${current >= 1}</div>`;

        while (current >= 1 && steps < 20) {
            flow.innerHTML += `<div class="flow-step exec">Thực thi: n = ${current}</div>`;
            result.push(current);
            current -= 1;
            steps++;
            flow.innerHTML += `<div class="flow-step check">Kiểm tra: ${current} >= 1 → ${current >= 1}</div>`;
        }

        output.textContent = 'Kết quả: ' + result.join(', ');
    }
}

// ===== Q11: BREAK/CONTINUE =====
function runBCSim(type) {
    const track = document.getElementById('bcTrack');
    const explain = document.getElementById('bcExplain');
    track.innerHTML = '';

    // Create items 1-10
    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'bc-item not-visited';
        div.textContent = i;
        div.id = 'bc-' + i;
        track.appendChild(div);
    }

    explain.innerHTML = '';

    if (type === 'break') {
        // Find first prime > 10 (simplified: stop at 11)
        explain.innerHTML = '<strong>break</strong>: Kết thúc vòng lặp ngay lập tức khi tìm thấy số nguyên tố đầu tiên > 10';
        const primes = [11, 13, 17, 19];
        let found = false;

        let i = 11;
        let step = 0;
        const interval = setInterval(() => {
            if (step > 0) {
                // Remove current from previous
                const prev = document.getElementById('bc-' + (i - 1));
                if (prev) prev.classList.remove('current');
            }

            const isPrime = primes.includes(i);
            const el = document.getElementById('bc-' + (i % 10 || 10));

            if (i <= 10) {
                // skip
            }

            if (isPrime && !found) {
                found = true;
                if (el) {
                    el.classList.remove('not-visited');
                    el.classList.add('visited', 'current');
                }
                explain.innerHTML += `<br>✅ Tìm thấy ${i} là số nguyên tố → <strong>break!</strong> Vòng lặp kết thúc.`;
                clearInterval(interval);
            } else if (!found) {
                if (el) {
                    el.classList.remove('not-visited');
                    el.classList.add('visited');
                }
            }

            i++;
            step++;
            if (i > 20 || step > 10) clearInterval(interval);
        }, 500);

    } else {
        // continue: print odd numbers, skip even
        explain.innerHTML = '<strong>continue</strong>: Bỏ qua số chẵn, chỉ in số lẻ';
        let i = 1;
        const interval = setInterval(() => {
            if (i > 10) { clearInterval(interval); return; }

            const el = document.getElementById('bc-' + i);
            el.classList.remove('not-visited');

            if (i % 2 === 0) {
                el.classList.add('skipped');
                explain.innerHTML += `<br>⏭️ i=${i} là chẵn → <strong>continue</strong> (bỏ qua)`;
            } else {
                el.classList.add('visited');
                explain.innerHTML += `<br>✅ i=${i} là lẻ → in ra`;
            }

            i++;
        }, 400);
    }
}

// ===== Q12: STAR PATTERN =====
function updateStars() {
    const n = parseInt(document.getElementById('starN').value);
    document.getElementById('starNVal').textContent = n;
}

function showStarsNow() {
    const n = parseInt(document.getElementById('starN').value);
    const output = document.getElementById('starOutput');
    let result = '';
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= i; j++) {
            result += '★ ';
        }
        result += '\n';
    }
    output.textContent = result;
    document.getElementById('starStepInfo').textContent = `for (i=1; i<=${n}; i++) → for (j=1; j<=i; j++) → in "*"`;
}

function animateStars() {
    const n = parseInt(document.getElementById('starN').value);
    const output = document.getElementById('starOutput');
    const info = document.getElementById('starStepInfo');
    output.textContent = '';

    let i = 1;
    const interval = setInterval(() => {
        if (i > n) {
            clearInterval(interval);
            info.textContent = 'Hoàn thành!';
            return;
        }

        let line = '';
        for (let j = 1; j <= i; j++) {
            line += '★ ';
        }
        output.textContent += line + '\n';
        info.textContent = `Vòng ngoài i=${i}, vòng trong j=1→${i}: in ${i} ngôi sao`;
        i++;
    }, 600);
}

// ===== Q13: ARRAY 1D =====
function initArray1D() {
    const arr = [7, 8, 9, 6, 10];
    const visual = document.getElementById('array1DVisual');
    visual.innerHTML = '';

    arr.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = 'array-cell';
        cell.innerHTML = `<span class="cell-index">[${i}]</span><span class="cell-value">${val}</span>`;
        cell.onclick = () => {
            document.querySelectorAll('.array-cell').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            document.getElementById('array1DInfo').textContent = `diem[${i}] = ${val} | arr.length = ${arr.length} | Index hợp lệ: 0 đến ${arr.length - 1}`;
        };
        visual.appendChild(cell);
    });
}

function traverseArray1D() {
    const arr = [7, 8, 9, 6, 10];
    const output = document.getElementById('array1DOutput');
    output.innerHTML = '';
    let tong = 0, max = arr[0];

    let i = 0;
    const interval = setInterval(() => {
        if (i >= arr.length) {
            const tb = (tong / arr.length).toFixed(2);
            output.innerHTML += `\nTong: ${tong}\nMax: ${max}\nTrung binh: ${tb}`;
            clearInterval(interval);
            return;
        }

        // Highlight current cell
        document.querySelectorAll('.array-cell').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.array-cell')[i]?.classList.add('active');

        tong += arr[i];
        if (arr[i] > max) max = arr[i];
        output.innerHTML += `diem[${i}] = ${arr[i]} → tong = ${tong}, max = ${max}\n`;
        i++;
    }, 600);
}

// ===== Q15: MATRIX =====
function initMatrix() {
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const grid = document.getElementById('matrixGrid');
    grid.style.gridTemplateColumns = `repeat(${matrix[0].length}, 56px)`;
    grid.innerHTML = '';

    matrix.forEach((row, i) => {
        row.forEach((val, j) => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = val;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.onclick = () => {
                document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('active'));
                cell.classList.add('active');
                document.getElementById('matrixInfo').textContent = `matrix[${i}][${j}] = ${val} | Số hàng: ${matrix.length} | Số cột hàng ${i}: ${matrix[i].length}`;
            };
            grid.appendChild(cell);
        });
    });
}

function traverseMatrix() {
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const output = document.getElementById('matrixOutput');
    output.innerHTML = '';
    let tong = 0;

    let i = 0, j = 0;
    const interval = setInterval(() => {
        if (i >= matrix.length) {
            output.innerHTML += `\nTong tat ca phan tu: ${tong}`;
            clearInterval(interval);
            return;
        }

        // Highlight current cell
        document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('active'));
        const cellIndex = i * matrix[0].length + j;
        document.querySelectorAll('.matrix-cell')[cellIndex]?.classList.add('active');

        tong += matrix[i][j];
        output.innerHTML += `matrix[${i}][${j}] = ${matrix[i][j]} | tong = ${tong}\n`;

        j++;
        if (j >= matrix[i].length) {
            j = 0;
            i++;
        }
    }, 400);
}

// ===== Q16: FUNCTION SIMULATOR =====
function runFuncSim() {
    const dai = parseFloat(document.getElementById('funcDai').value) || 5;
    const rong = parseFloat(document.getElementById('funcRong').value) || 3;
    const stack = document.getElementById('callStack');
    stack.innerHTML = '';

    // Step 1: main called
    setTimeout(() => {
        stack.innerHTML += `<div class="stack-frame active-frame">
            <div class="frame-name">main()</div>
            <div>Gọi: dienTich(${dai}, ${rong})</div>
        </div>`;
    }, 200);

    // Step 2: dienTich called
    setTimeout(() => {
        stack.innerHTML += `<div class="stack-frame active-frame">
            <div class="frame-name">dienTich(double dai, double rong)</div>
            <div class="frame-var">dai = ${dai}</div>
            <div class="frame-var">rong = ${rong}</div>
            <div>Tính: ${dai} × ${rong} = ${dai * rong}</div>
        </div>`;
    }, 800);

    // Step 3: return
    setTimeout(() => {
        stack.innerHTML += `<div class="stack-frame">
            <div class="frame-return">return ${dai * rong}; → thoát dienTich()</div>
        </div>`;
    }, 1500);

    // Step 4: back to main
    setTimeout(() => {
        stack.innerHTML += `<div class="stack-frame active-frame">
            <div class="frame-name">main()</div>
            <div class="frame-var">s = dienTich(${dai}, ${rong}) = ${dai * rong}</div>
            <div>In: "Dien tich: ${dai * rong}"</div>
        </div>`;
    }, 2200);

    // Step 5: call inThongBao
    setTimeout(() => {
        stack.innerHTML += `<div class="stack-frame active-frame">
            <div class="frame-name">inThongBao(String noi_dung)</div>
            <div class="frame-var">noi_dung = "Chuong trinh ket thuc."</div>
            <div>In: "[THONG BAO] Chuong trinh ket thuc."</div>
            <div class="frame-return">return; (void)</div>
        </div>`;
    }, 3000);
}

// ===== Q17: PASS BY VALUE vs REF =====
function runPassByValue() {
    const mem = document.getElementById('passByValueMem');
    mem.innerHTML = '';

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block main-mem">
            <div class="mem-label">main()</div>
            <div class="mem-value">a = 5</div>
        </div>`;
    }, 200);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-arrow">→ gọi tangLenMot(a) → truyền bản sao giá trị 5</div>`;
    }, 700);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block func-mem">
            <div class="mem-label">tangLenMot(int x)</div>
            <div class="mem-value">x = 5 (bản sao)</div>
        </div>`;
    }, 1200);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block func-mem changed">
            <div class="mem-label">tangLenMot: x = x + 1</div>
            <div class="mem-value">x = 6 (chỉ thay đổi bản sao!)</div>
        </div>`;
    }, 1700);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block main-mem unchanged">
            <div class="mem-label">main() — sau khi hàm kết thúc</div>
            <div class="mem-value">a = 5 ❌ KHÔNG thay đổi!</div>
        </div>`;
    }, 2200);

    setTimeout(() => {
        mem.innerHTML += `<div style="margin-top:8px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px;color:var(--danger);font-size:0.85rem">
            ⚠️ Pass by value: hàm chỉ nhận bản sao. Thay đổi bản sao KHÔNG ảnh hưởng biến gốc.
        </div>`;
    }, 2700);
}

function runPassByRef() {
    const mem = document.getElementById('passByRefMem');
    mem.innerHTML = '';

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block main-mem">
            <div class="mem-label">main()</div>
            <div class="mem-value">nums → [10, 20, 30]</div>
        </div>`;
    }, 200);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-arrow">→ gọi nhanDoi(nums) → truyền bản sao địa chỉ (cùng trỏ vào mảng)</div>`;
    }, 700);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block func-mem">
            <div class="mem-label">nhanDoi(int[] arr)</div>
            <div class="mem-value">arr → cùng mảng [10, 20, 30]</div>
        </div>`;
    }, 1200);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block func-mem changed">
            <div class="mem-label">nhanDoi: arr[0] = arr[0] * 2</div>
            <div class="mem-value">arr → [20, 20, 30] ✅ Thay đổi nội dung mảng!</div>
        </div>`;
    }, 1700);

    setTimeout(() => {
        mem.innerHTML += `<div class="mem-block main-mem changed">
            <div class="mem-label">main() — sau khi hàm kết thúc</div>
            <div class="mem-value">nums → [20, 20, 30] ✅ Đã thay đổi!</div>
        </div>`;
    }, 2200);

    setTimeout(() => {
        mem.innerHTML += `<div style="margin-top:8px;padding:8px;background:rgba(34,197,94,0.1);border-radius:6px;color:var(--success);font-size:0.85rem">
            ✅ Mảng/đối tượng: truyền bản sao địa chỉ → cùng trỏ vào vùng nhớ → nội dung CÓ THỂ bị thay đổi.
        </div>`;
    }, 2700);
}
