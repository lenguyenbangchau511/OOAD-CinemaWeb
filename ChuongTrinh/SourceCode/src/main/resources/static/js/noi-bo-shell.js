import { account, bindLogout, brand, current, esc, icon, labels } from './cinema-ui.js';

export const menuItems = {
    home: ['Trang chủ', 'home', 'noi-bo.html'],
    accounts: ['Tài khoản và quyền', 'shield', 'tai-khoan.html'],
    employees: ['Nhân viên', 'users', 'nhan-vien.html'],
    customers: ['Khách hàng', 'users', 'khach-hang.html'],
    phim: ['Phim', 'film', 'quan-ly-phim.html'],
    phong: ['Phòng chiếu', 'screen', 'phong-chieu.html'],
    lich: ['Lịch suất chiếu', 'calendar', 'suat-chieu.html'],
    gia: ['Giá vé', 'tag', 'gia-ve.html'],
    food: ['Đồ ăn và thức uống', 'cup', 'quan-ly-san-pham.html'],
    stock: ['Kho hàng', 'box', 'ton-kho.html'],
    promo: ['Khuyến mãi', 'gift', 'khuyen-mai.html'],
    report: ['Báo cáo', 'chart', 'bao-cao.html'],
    ban: ['Bán vé tại quầy', 'ticket', 'ban-ve-tai-quay.html'],
    scan: ['Soát vé', 'scan', 'soat-ve.html'],
    history: ['Tra cứu vé', 'search', 'tra-cuu-ve.html']
};

export const nav = {
    ADMIN: ['home', 'accounts', 'employees', 'customers'],
    QUAN_LY: ['home', 'phim', 'phong', 'lich', 'gia', 'customers', 'food', 'stock', 'promo', 'report', 'history'],
    NHAN_VIEN: ['home', 'ban', 'scan', 'history', 'customers']
};

// Nhân viên chỉ có quyền xem phim; menu phòng suất và đồ ăn quản lý giữ nguyên.
export const ready = new Set([
    'home', 'accounts', 'employees', 'customers',
    'phong', 'lich', 'history', 'phim', 'food',
    'gia', 'promo', 'report', 'stock', 'scan', 'ban'
]);

export function menuHref(k, vaiTro) {
    if (vaiTro === 'NHAN_VIEN' && k === 'phim') return 'phim-noi-bo.html';
    return ready.has(k) && !(vaiTro === 'NHAN_VIEN' && ['lich', 'food'].includes(k))
        ? menuItems[k][2]
        : 'noi-bo.html?module=' + encodeURIComponent(k);
}

export function renderSidebar(vaiTro, selected) {
    const menu = nav[vaiTro] || [];
    return `<small>KHÔNG GIAN NỘI BỘ</small><nav aria-label="Menu nội bộ">${menu.map((k) =>
        `<a ${selected === k ? 'aria-current="page"' : ''} href="${menuHref(k, vaiTro)}">${icon(menuItems[k][1])}${menuItems[k][0]}</a>`
    ).join('')}</nav><div class="access"><strong>${icon('shield')} Quyền truy cập</strong><p class="muted">Chỉ hiển thị chức năng được cấp theo vai trò của bạn.</p></div>`;
}

function renderGuestHeader(vaiTro) {
    return `<div class="nb-header-inner">${brand(true)}<div class="account"><span class="avatar">${icon('user')}</span><span class="account-info"><strong>Khu nội bộ</strong><small>${esc(labels[vaiTro] || vaiTro)}</small></span><a class="btn" href="login.html?quayLai=${encodeURIComponent(location.pathname + location.search)}">Đăng nhập</a></div></div>`;
}

function renderCustomerHeader(me) {
    return `<div class="nb-header-inner">${brand(false)}<div class="account"><span class="avatar">${icon('user')}</span><span class="account-info"><strong><a href="tai-khoan-ca-nhan.html">${esc(me.hoTen || me.tenDangNhap)}</a></strong><small>${esc(labels[me.vaiTro] || me.vaiTro)}</small></span><a class="btn" href="./">Trang chủ</a><a class="btn" href="lich-su-ve.html">Vé của tôi</a><button class="btn" id="logout">${icon('logout')} Đăng xuất</button></div></div>`;
}

async function initShell() {
    const screen = document.body.dataset.nbScreen;
    if (!screen) return;

    const header = document.getElementById('nb-header');
    const sidebar = document.getElementById('nb-sidebar');
    const footer = document.getElementById('nb-footer');
    const layout = document.querySelector('.nb-layout');
    const fallbackRole = screen === 'employees' ? 'ADMIN' : ['scan', 'ban'].includes(screen) ? 'NHAN_VIEN' : 'QUAN_LY';

    if (header) header.innerHTML = renderGuestHeader(fallbackRole);
    if (sidebar) sidebar.innerHTML = renderSidebar(fallbackRole, screen);
    if (footer) footer.innerHTML = '<div class="nb-wrap">© 2026 MegaCine</div>';

    try {
        const me = await current();
        if (me.vaiTro === 'KHACH_HANG') {
            if (header) header.innerHTML = renderCustomerHeader(me);
            if (sidebar) sidebar.hidden = true;
            if (layout) layout.classList.add('nb-no-sidebar');
            bindLogout();
            return;
        }
        if (!nav[me.vaiTro]) return;
        if (header) header.innerHTML = `<div class="nb-header-inner">${brand(true)}${account(me)}</div>`;
        if (sidebar) sidebar.innerHTML = renderSidebar(me.vaiTro, screen);
        bindLogout();
    } catch {
        // Giữ khung điều hướng mặc định để xem giao diện tĩnh hoặc để script từng trang xử lý lỗi phiên.
    }
}

initShell();
