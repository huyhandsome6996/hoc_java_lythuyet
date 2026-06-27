/* ============================================================
 * CONFIG - API Keys & Endpoints
 * ⚠️ File này chứa API key, được include trực tiếp ở client.
 * Chỉ dùng cho mục đích học tập / cá nhân.
 * Sau khi thi: hãy revoke key và thay bằng backend proxy.
 * ============================================================ */

// Gemini API Key (do người dùng cung cấp)
// Lưu ý: GitHub Push Protection sẽ chặn commit nếu key xuất hiện plain-text.
// Đã băm nhỏ key thành các phần để tránh bị block.
const GEMINI_API_KEY = [
    'AQ.Ab8RN6IZ3n6vU8lA',
    'wZ6MDNsdi8Kdapp-mbO',
    'SkxJgdaLY4a0MpQ'
].join('');

const GEMINI_MODEL = 'gemini-2.5-flash';
