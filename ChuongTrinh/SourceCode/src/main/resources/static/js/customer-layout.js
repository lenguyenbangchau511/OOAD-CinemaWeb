import { current, esc, icon, logout } from './cinema-ui.js';

const brand = '<span class="mc-customer-mark" aria-hidden="true">▦</span><span>Mega<span class="mc-customer-accent">Cine</span></span>';
const links = [
    ['./', 'Trang chủ'],
    ['bap-nuoc.html', 'Bắp nước'],
    ['uu-dai.html', 'Khuyến mãi']
];

export function renderCustomerAccount(root, user) {
    const destination = location.pathname + location.search;
    if (!user) {
        root.innerHTML = location.pathname.endsWith('/login.html') ? ''
            : `<a class="mc-customer-action" href="login.html?quayLai=${encodeURIComponent(destination)}">Đăng nhập</a>`;
        return;
    }

    root.innerHTML = `<details class="cinema-account-menu">
        <summary class="mc-customer-action" aria-label="Menu tài khoản">${icon('user')} <span>${esc(user.hoTen || user.tenDangNhap)}</span></summary>
        <div class="cinema-account-panel">
            <strong>${esc(user.tenDangNhap)}</strong><small>${esc(user.email)}</small><hr>
            <a href="tai-khoan-ca-nhan.html">Quản lý tài khoản cá nhân</a>
            ${user.vaiTro === 'KHACH_HANG' ? '<a href="lich-su-ve.html">Lịch sử mua vé</a>' : '<a href="noi-bo.html">Không gian nội bộ</a>'}
            <hr><a href="doi-mat-khau.html">${icon('lock')} Đổi mật khẩu</a>
            <button type="button">${icon('logout')} Đăng xuất</button><p role="status" hidden></p>
        </div>
    </details>`;
    root.querySelector('button').onclick = async () => {
        try {
            await logout();
        } catch (err) {
            const message = root.querySelector('[role="status"]');
            message.textContent = err.message;
            message.hidden = false;
        }
    };
}

export function mountCustomerLayout(header, footer, user) {
    const page = location.pathname.split('/').pop();
    const active = !page || page === 'index.html' ? './' : page;
    header.className = 'mc-customer-header';
    header.innerHTML = `<div class="mc-customer-bar">
        <a class="mc-customer-brand" href="./">${brand}</a>
        <nav aria-label="Menu chính">${links.map(([href, label]) =>
            `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
        <div id="cinema-home-account"></div>
    </div>`;
    footer.className = 'mc-customer-footer';
    footer.innerHTML = `<div class="mc-customer-bar">
        <a class="mc-customer-brand" href="./">${brand}</a>
        <p>© MegaCine · Đồ án OOAD Nhóm 11</p>
    </div>`;

    const root = header.querySelector('#cinema-home-account');
    renderCustomerAccount(root, user);
    if (user === undefined) current().then(me => renderCustomerAccount(root, me), () => {});
    document.addEventListener('click', event => {
        if (!root.contains(event.target)) root.querySelector('details')?.removeAttribute('open');
    });
}

const header = document.querySelector('[data-customer-header]');
if (header) mountCustomerLayout(header, document.querySelector('[data-customer-footer]'));
