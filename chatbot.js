/* ============================================================
 * Java Tutor AI Chatbot
 * - Đọc toàn bộ nội dung 17 câu lý thuyết Java từ DOM
 * - Gọi Gemini API để trả lời câu hỏi dựa trên context đó
 * - Có fallback qua CORS proxy nếu direct call bị chặn
 * ============================================================ */

// API key & model lấy từ config.js (tách riêng để dễ quản lý)
// GEMINI_API_KEY và GEMINI_MODEL được define trong config.js

// Build direct endpoint URL
function buildEndpoint(useProxy) {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    if (!useProxy) return directUrl;
    // Dùng allorigins.win proxy
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
}

// Context lý thuyết Java - được build từ DOM khi trang load
let JAVA_THEORY_CONTEXT = '';

// Lịch sử chat (chỉ giữ 6 turn gần nhất để tránh token quá dài)
let chatHistory = [];

/* ---------- 1. ĐỌC NỘI DUNG TỪ DOM ---------- */
function extractTheoryFromDOM() {
    const parts = [];
    const partHeaders = document.querySelectorAll('.part-header h2');

    document.querySelectorAll('.question-card').forEach((card, idx) => {
        const num = idx + 1;
        const titleEl = card.querySelector('.question-header h3');
        const title = titleEl ? titleEl.textContent.trim() : '';

        // Lấy text lý thuyết
        const theoryEl = card.querySelector('.theory-section');
        let theoryText = '';
        if (theoryEl) {
            theoryText = theoryEl.innerText
                .replace(/\n\s*\n/g, '\n')
                .trim();
        }

        // Lấy text ví dụ (code)
        const exampleEl = card.querySelector('.example-section');
        let exampleText = '';
        if (exampleEl) {
            exampleText = exampleEl.innerText
                .replace(/\n\s*\n/g, '\n')
                .trim();
        }

        parts.push(`=== CÂU ${num}: ${title} ===\n[Lý thuyết]\n${theoryText}\n\n[Ví dụ minh họa]\n${exampleText}`);
    });

    return parts.join('\n\n');
}

/* ---------- 2. SYSTEM PROMPT ---------- */
function buildSystemPrompt() {
    return `Bạn là "Java Tutor AI", một gia sư Java thân thiện chuyên hỗ trợ sinh viên ôn thi.

Nhiệm vụ của bạn:
- Trả lời câu hỏi của sinh viên DỰA TRÊN LÝ THUYẾT đã cho dưới đây (17 câu, bám sát giáo trình).
- Nếu câu hỏi ngoài phạm vi lý thuyết, hãy trả lời ngắn gọn và gợi ý quay về chủ đề trong giáo trình.
- Luôn dùng tiếng Việt, giọng điệu gần gũi, dễ hiểu.
- Khi giải thích có dùng code Java, hãy bọc trong \`\`\`java ... \`\`\` hoặc \`code inline\`.
- Có thể dùng **in đậm**, danh sách bullet, và emoji phù hợp để dễ đọc.
- Trả lời súc tích, tập trung vào điểm chính. Không lan man.
- Nếu người hỏi nhờ "ví dụ thêm", hãy cho 1 ví dụ nhỏ gọn kèm giải thích.
- Nếu hỏi "khi nào dùng X vs Y", hãy so sánh trực tiếp bằng bảng hoặc bullet.

=== NỘI DUNG LÝ THUYẾT JAVA (17 CÂU) ===

${JAVA_THEORY_CONTEXT}

=== KẾT THÚC LÝ THUYẾT ===

Giờ hãy trả lời câu hỏi của sinh viên:`;
}

/* ---------- 3. GỌI GEMINI API (CÓ FALLBACK PROXY) ---------- */
async function callGeminiAPI(userMessage) {
    const systemPrompt = buildSystemPrompt();

    // Build contents
    const contents = [];

    // Lịch sử chat (6 turn gần nhất)
    chatHistory.slice(-6).forEach(turn => {
        contents.push({ role: 'user', parts: [{ text: turn.user }] });
        contents.push({ role: 'model', parts: [{ text: turn.bot }] });
    });

    // Câu hỏi hiện tại (kèm system prompt)
    contents.push({
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n' + userMessage }]
    });

    const body = {
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
    };

    // Thử lần lượt: direct → proxy
    const attempts = [
        { useProxy: false, label: 'Direct' },
        { useProxy: true, label: 'Proxy allorigins' }
    ];

    let lastErr = null;
    for (const att of attempts) {
        try {
            const url = buildEndpoint(att.useProxy);
            console.log(`[Chatbot] Đang gọi Gemini (${att.label})...`);

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const errText = await resp.text();
                console.warn(`[Chatbot] ${att.label} HTTP ${resp.status}:`, errText.substring(0, 200));
                lastErr = new Error(`HTTP ${resp.status}`);
                continue;
            }

            const data = await resp.json();

            if (!data.candidates || data.candidates.length === 0) {
                lastErr = new Error('API không trả về kết quả');
                continue;
            }

            const candidate = data.candidates[0];
            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Câu trả lời bị chặn bởi safety filter. Hãy hỏi cách khác.');
            }

            console.log(`[Chatbot] Thành công qua ${att.label}`);
            return candidate.content.parts[0].text;
        } catch (err) {
            console.warn(`[Chatbot] ${att.label} thất bại:`, err.message);
            lastErr = err;
        }
    }

    // Nếu cả 2 cách đều fail
    throw new Error(
        `Không gọi được Gemini API. Có thể do:\n` +
        `• Vị trí của bạn không được Gemini hỗ trợ (cần VPN Mỹ/Châu Âu)\n` +
        `• API key hết hạn hoặc sai\n` +
        `• Lỗi mạng tạm thời\n\n` +
        `Lỗi chi tiết: ${lastErr ? lastErr.message : 'không xác định'}`
    );
}

/* ---------- 4. UI HELPERS ---------- */
function addMessage(role, text, isError = false) {
    const messages = document.getElementById('chatbot-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role === 'bot' ? 'bot-msg' : 'user-msg'}${isError ? ' error-msg' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'bot' ? '🤖' : '👤';

    const content = document.createElement('div');
    content.className = 'msg-content';
    if (role === 'bot') {
        content.innerHTML = renderMarkdown(text);
    } else {
        content.textContent = text;
    }

    msg.appendChild(avatar);
    msg.appendChild(content);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function renderMarkdown(text) {
    // Escape HTML trước
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Code block ```lang\n...\n```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Headings ### / ##
    html = html.replace(/^### (.+)$/gm, '<strong style="color:var(--accent)">$1</strong>');
    html = html.replace(/^## (.+)$/gm, '<strong style="color:var(--primary)">$1</strong>');

    // Bullet lists
    const lines = html.split('\n');
    let inList = false;
    let result = [];
    lines.forEach(line => {
        if (/^\s*[-*] /.test(line)) {
            if (!inList) { result.push('<ul>'); inList = true; }
            result.push('<li>' + line.replace(/^\s*[-*] /, '') + '</li>');
        } else if (/^\s*\d+\. /.test(line)) {
            if (!inList) { result.push('<ol>'); inList = true; }
            result.push('<li>' + line.replace(/^\s*\d+\. /, '') + '</li>');
        } else {
            if (inList) { result.push('</ul>'); inList = false; }
            result.push(line);
        }
    });
    if (inList) result.push('</ul>');
    html = result.join('\n');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p style="margin:6px 0">');
    html = html.replace(/\n/g, '<br>');

    return html;
}

function showTyping() {
    const messages = document.getElementById('chatbot-messages');
    const t = document.createElement('div');
    t.className = 'typing-indicator';
    t.id = 'typing-indicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
}

/* ---------- 5. SEND MESSAGE ---------- */
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if (!text) return;

    // Ẩn suggestion chips sau khi hỏi câu đầu
    const suggestions = document.getElementById('chat-suggestions');
    if (suggestions) suggestions.style.display = 'none';

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';

    // Disable input khi đang xử lý
    const sendBtn = document.getElementById('chatbot-send');
    sendBtn.disabled = true;
    document.getElementById('chatbot-status').textContent = '● Đang suy nghĩ...';

    showTyping();

    try {
        const reply = await callGeminiAPI(text);

        // Lưu vào history
        chatHistory.push({ user: text, bot: reply });
        if (chatHistory.length > 20) chatHistory.shift();

        hideTyping();
        addMessage('bot', reply);
    } catch (err) {
        hideTyping();
        addMessage('bot', `⚠️ Lỗi: ${err.message}\n\nVui lòng thử lại hoặc hỏi câu khác.`, true);
    } finally {
        sendBtn.disabled = false;
        document.getElementById('chatbot-status').textContent = '● Trực tuyến';
        input.focus();
    }
}

function askSuggestion(question) {
    document.getElementById('chatbot-input').value = question;
    sendMessage();
}

/* ---------- 6. TOGGLE CHATBOT WINDOW ---------- */
function setupChatbotUI() {
    const toggle = document.getElementById('chatbot-toggle');
    const window_ = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const badge = document.getElementById('chatbot-badge');

    toggle.addEventListener('click', () => {
        window_.classList.toggle('open');
        if (window_.classList.contains('open')) {
            badge.style.display = 'none';
            setTimeout(() => input.focus(), 300);
        }
    });

    closeBtn.addEventListener('click', () => {
        window_.classList.remove('open');
    });

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
}

/* ---------- 7. KHỞI TẠO ---------- */
document.addEventListener('DOMContentLoaded', () => {
    // Đọc toàn bộ lý thuyết Java từ DOM
    JAVA_THEORY_CONTEXT = extractTheoryFromDOM();
    console.log(`[Chatbot] Đã nạp ${JAVA_THEORY_CONTEXT.length} ký tự lý thuyết Java`);

    // Setup UI
    setupChatbotUI();
});
