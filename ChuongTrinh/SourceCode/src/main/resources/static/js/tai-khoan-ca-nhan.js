
import {
    $, icon, esc, brand, footer, account,
    bindLogout, notice, current, goLogin, api
} from './cinema-ui.js';

footer();

async function init() {
    const me = await current();
    const key = 'cinema.profile.' + me.maTaiKhoan;

    const initial = {
        hoTen: me.hoTen || '',
        soDienThoai: me.soDienThoai || '',
        moTa: ''
    };

    let saved = initial;

    try {
        saved = {
            ...initial,
            ...JSON.parse(sessionStorage.getItem(key))
        };
    } catch {}

    const customer = me.vaiTro === 'KHACH_HANG';

    $('#header').innerHTML = brand(!customer) + account(me);

    $('#profile-banner').innerHTML = `
        <div class="wrap">
            <div class="profile-identity">
                <span class="avatar">${icon('user')}</span>

                <div>
                    <h1 id="profile-name">${esc(saved.hoTen)}</h1>
                    <p id="profile-bio" class="muted"></p>
                </div>
            </div>

            <nav class="profile-tabs" aria-label="Tài khoản cá nhân">
                <a href="tai-khoan-ca-nhan.html" aria-current="page">
                    Tài khoản
                </a>

                ${customer
                    ? '<a href="lich-su-ve.html">Vé đã mua</a>'
                    : ''}
            </nav>
        </div>
    `;

    $('#profile-banner').hidden = false;

    $('#main').innerHTML = `
        ${customer ? `
            <section class="card membership">
                <h2>Thông tin thành viên</h2>

                <div class="profile-grid">
                    <div>
                        <small>Hạng thành viên</small>
                        <h3>—</h3>
                    </div>

                    <div>
                        <small>Điểm tích lũy</small>
                        <h3 class="profile-points">
                            ${esc(me.diemTichLuy ?? '—')} điểm
                        </h3>
                    </div>
                </div>
            </section>
        ` : ''}

        <section class="card">
            <h2>Thông tin cá nhân</h2>

            <div id="notice" class="notice"
                 role="status" aria-live="polite" hidden>
            </div>

            <form id="profile-form" novalidate>
                <div class="profile-grid" style="margin-top:24px">

                    <div class="field">
                        <label for="username">Tên tài khoản</label>
                        <input id="username"
                               value="${esc(me.tenDangNhap)}"
                               readonly>
                    </div>

                    <div class="field">
                        <label for="email">Email</label>
                        <input id="email"
                               value="${esc(me.email)}"
                               readonly>
                    </div>

                    <div class="field">
                        <label for="hoTen">Họ và tên *</label>
                        <input id="hoTen"
                               name="hoTen"
                               autocomplete="name"
                               required>

                        <small id="name-error"
                               class="profile-error"
                               aria-live="polite">
                        </small>
                    </div>

                    <div class="field">
                        <label for="soDienThoai">Số điện thoại</label>
                        <input id="soDienThoai"
                               name="soDienThoai"
                               type="tel"
                               autocomplete="tel"
                               inputmode="numeric">

                        <small>Không bắt buộc</small>

                        <small id="phone-error"
                               class="profile-error"
                               aria-live="polite">
                        </small>
                    </div>

                    <div class="field profile-wide">
                        <div class="label-row">
                            <label for="moTa">Mô tả cá nhân</label>
                            <small id="bio-count">0/101</small>
                        </div>

                        <textarea id="moTa"
                                  name="moTa"
                                  rows="2"
                                  placeholder="Viết đôi điều về bản thân...">
                        </textarea>

                        <small id="bio-error"
                               class="profile-error"
                               aria-live="polite">
                        </small>
                    </div>
                </div>

                <p class="muted">
                    Lưu mô phỏng trong phiên trình duyệt,
                    không cập nhật CSDL.
                    Đăng xuất sẽ xóa thay đổi.
                </p>

                <div class="profile-actions">
                    <button class="btn"
                            id="cancel-profile"
                            type="button">
                        Hủy thay đổi
                    </button>

                    <button class="btn primary"
                            id="save-profile"
                            type="submit">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </section>
    `;

    // Đọc và chuẩn hóa dữ liệu người dùng nhập.
    const read = () => ({
        hoTen: $('#hoTen').value.trim(),
        soDienThoai: $('#soDienThoai').value.trim(),
        moTa: $('#moTa').value.trim()
    });

    let busy = false;

    // Kiểm tra tính hợp lệ của dữ liệu.
    function validate() {
        const d = read();
        const n = Array.from($('#moTa').value).length;

        const errors = [
            !d.hoTen || Array.from(d.hoTen).length > 100
                ? 'Họ tên bắt buộc và tối đa 100 ký tự.'
                : '',

            d.soDienThoai && !/^0[0-9]{9}$/.test(d.soDienThoai)
                ? 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.'
                : '',

            n > 101
                ? 'Mô tả không được vượt quá 101 ký tự.'
                : ''
        ];

        ['name-error', 'phone-error', 'bio-error']
            .forEach((id, i) => {
                $('#' + id).textContent = errors[i];
            });

        ['hoTen', 'soDienThoai', 'moTa']
            .forEach((id, i) => {
                $('#' + id).setAttribute(
                    'aria-invalid',
                    String(Boolean(errors[i]))
                );
            });

        $('#bio-count').textContent = n + '/101';

        const changed = Object.keys(d)
            .some(k => d[k] !== saved[k]);

        $('#save-profile').disabled =
            busy || !changed || errors.some(Boolean);

        $('#cancel-profile').disabled =
            busy || !changed;

        return !errors.some(Boolean) && changed;
    }

    // Điền lại thông tin đã lưu vào biểu mẫu.
    const fill = () => {
        for (const k of ['hoTen', 'soDienThoai', 'moTa']) {
            $('#' + k).value = saved[k];
        }

        validate();
    };

    // Cập nhật họ tên và mô tả cạnh avatar.
    const banner = () => {
        $('#profile-name').textContent = saved.hoTen;
        $('#profile-bio').textContent = saved.moTa;
        $('#profile-bio').hidden = !saved.moTa;
    };

    fill();
    banner();

    // Kiểm tra dữ liệu ngay khi người dùng nhập.
    $('#profile-form').oninput = () => {
        notice($('#notice'));
        validate();
    };

    // Hủy các thay đổi chưa lưu.
    $('#cancel-profile').onclick = () => {
        fill();
        notice($('#notice'));
    };

    // Xử lý lưu thông tin cá nhân.
    $('#profile-form').onsubmit = async e => {
        e.preventDefault();

        if (busy || !validate()) return;

        const d = read();

        busy = true;
        validate();

        for (const k of Object.keys(d)) {
            $('#' + k).disabled = true;
        }

        try {
            // Chỉ kiểm tra trùng nếu có nhập số điện thoại.
            if (d.soDienThoai) {
                await api(
                    '/api/auth/toi/kiem-tra-so-dien-thoai',
                    {
                        soDienThoai: d.soDienThoai
                    }
                );
            }

            // Lưu mô phỏng trong phiên trình duyệt.
            sessionStorage.setItem(key, JSON.stringify(d));

            saved = d;

            fill();
            banner();

            notice(
                $('#notice'),
                'Lưu thay đổi thành công (mô phỏng).',
                'success'
            );

        } catch (err) {
            notice($('#notice'), err.message);

            if (err.status === 401) {
                goLogin();
            }

        } finally {
            busy = false;

            for (const k of Object.keys(d)) {
                $('#' + k).disabled = false;
            }

            validate();
        }
    };

    $('#main').removeAttribute('aria-busy');

    bindLogout();
}

init().catch(e => {
    if (e.status === 401) {
        goLogin();
    } else {
        $('#main').textContent = e.message;
    }
});
