import {
    chipTrangThai, dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao,
    homNay, layNguoiDungDatVe, NHAN, thamSo, thoat
} from './datve-common.js';

const $ = id => document.getElementById(id);
const mode = document.body.dataset.nghiepVu;
const form = $('form');
const showError = message => hienThongBao($('thong-bao'), message, 'loi');
const showResult = html => {
    $('ket-qua').innerHTML = html;
    $('ket-qua').hidden = false;
};
const labelSuat = s => `${s.tenPhim} · ${dinhDangGio(s.gioBatDau)} · ${s.tenPhong}`;
const option = (value, label) => `<option value="${thoat(value)}">${thoat(label)}</option>`;

function bindPreview(render) {
    form.addEventListener('submit', event => {
        event.preventDefault();
        hienThongBao($('thong-bao'), '');
        $('ket-qua').hidden = true;
        try {
            render();
        } catch (error) {
            showError(error.message);
        }
    });
    form.addEventListener('input', () => { $('ket-qua').hidden = true; });
}

async function openPicker({ multiple = false, update = () => {} } = {}) {
    const date = $('ngay');
    const select = $('suat-moi');
    const seats = $('ghe-moi');
    date.value = date.min = homNay();
    let list = [];
    let available = [];
    let request = 0;
    const selection = () => [...seats.querySelectorAll('input:checked')].map(input => available[Number(input.value)]);
    const loadSeats = async () => {
        const id = ++request;
        available = [];
        seats.replaceChildren();
        update(selection());
        if (!select.value) return;
        try {
            const data = await goiApi('/api/suat-chieu/' + encodeURIComponent(select.value) + '/so-do-ghe');
            if (id !== request) return;
            available = data.suat.conBanVe ? data.ghe.filter(g => g.trangThai === 'TRONG') : [];
            seats.innerHTML = '<legend>Ghế trống</legend>' +
                (available.length ? `<div class="chau-actions">${available.map((g, index) =>
                    `<label><input type="${multiple ? 'checkbox' : 'radio'}" name="ghe" value="${index}"> ${thoat(g.tenGhe)} · ${dinhDangTien(g.giaVe)}</label>`).join('')}</div>`
                    : '<p>Suất chiếu không còn ghế trống.</p>');
        } catch (error) {
            if (id === request) showError(error.message);
        }
    };
    const loadShows = async () => {
        const id = ++request;
        list = [];
        available = [];
        select.innerHTML = '<option value="">Đang tải suất…</option>';
        seats.innerHTML = '<legend>Ghế trống</legend><p>Chọn suất để xem ghế.</p>';
        update(selection());
        if (!date.value) return;
        try {
            const q = new URLSearchParams({ ngay: date.value });
            const shows = await goiApi('/api/suat-chieu/dang-ban?' + q);
            if (id !== request) return;
            list = shows;
            select.innerHTML = option('', list.length ? 'Chọn suất' : 'Không có suất đang bán') +
                list.map(s => option(s.maSuat, labelSuat(s))).join('');
        } catch (error) {
            if (id === request) {
                select.innerHTML = option('', 'Chưa tải được suất');
                showError(error.message);
            }
        }
    };
    date.addEventListener('change', loadShows);
    select.addEventListener('change', loadSeats);
    seats.addEventListener('change', () => update(selection()));
    await loadShows();
    return () => ({ suat: list.find(s => s.maSuat === select.value), ghe: selection() });
}

async function banVe() {
    let mon = [];
    const tomTatMon = () => [...$('mon').querySelectorAll('input')].map((input, index) => ({
        ...mon[index], soLuong: Number(input.value)
    })).filter(item => item.soLuong > 0);
    const total = ghe => ghe.reduce((sum, g) => sum + Number(g.giaVe), 0) +
        tomTatMon().reduce((sum, item) => sum + item.soLuong * Number(item.gia), 0);
    const picker = await openPicker({ multiple: true, update: ghe => { $('tong').textContent = dinhDangTien(total(ghe)); } });
    $('mon').addEventListener('input', () => { $('tong').textContent = dinhDangTien(total(picker().ghe)); });
    bindPreview(() => {
        const { suat, ghe } = picker();
        if (!suat || !ghe.length) throw new Error('Vui lòng chọn suất và ít nhất một ghế.');
        const data = new FormData(form);
        showResult(`<h2>Đơn tại quầy · xem trước</h2><p>${thoat(labelSuat(suat))}</p>
            <p>Khách: ${thoat(data.get('khach').trim() || 'Khách lẻ')}</p>
            <p>Ghế: ${thoat(ghe.map(g => g.tenGhe).join(', '))}</p>
            ${tomTatMon().map(item => `<p>${thoat(item.ten)} × ${item.soLuong}</p>`).join('')}
            <p><strong>${dinhDangTien(total(ghe))}</strong> · ${thoat(data.get('phuongThuc'))}</p>`);
    });
    try {
        mon = (await goiApi('/api/don-dat-ve/danh-muc')).filter(item => item.khaDung > 0);
        $('mon').innerHTML = mon.length ? mon.map(item =>
            `<label>${thoat(item.ten)} · ${dinhDangTien(item.gia)}
            <input type="number" min="0" max="${Number(item.khaDung)}" step="1" value="0"></label>`).join('')
            : '<p>Không có món đang bán.</p>';
    } catch {
        $('mon').textContent = 'Chưa tải được danh mục bắp nước.';
    }
}

async function getSuat() {
    const ma = thamSo('maSuat');
    if (!ma) throw new Error('Hãy chọn suất chiếu từ danh sách.');
    const qs = new URLSearchParams();
    if (thamSo('ngay')) qs.set('ngay', thamSo('ngay'));
    const ds = await goiApi('/api/suat-chieu?' + qs);
    const suat = ds.find(s => s.maSuat === ma);
    if (!suat) throw new Error('Không tìm thấy suất chiếu.');
    return suat;
}

async function suatForm() {
    const data = await goiApi('/api/suat-chieu/bo-loc');
    form.elements.maPhim.innerHTML = option('', 'Chọn phim') + data.phim.map(p => option(p.maPhim, p.tenPhim)).join('');
    form.elements.maPhong.innerHTML = option('', 'Chọn phòng') + data.phong.map(p => option(p.maPhong, p.tenPhong)).join('');
    form.elements.ngayChieu.value = homNay();
    if (thamSo('maSuat')) {
        const suat = await getSuat();
        for (const name of ['maPhim', 'maPhong', 'ngayChieu', 'gioBatDau', 'gioKetThuc']) {
            form.elements[name].value = name.startsWith('gio') ? suat[name].slice(0, 5) : suat[name];
        }
        document.querySelector('h1').textContent = 'Sửa suất chiếu ' + suat.maSuat;
    }
    bindPreview(() => {
        const data = Object.fromEntries(new FormData(form));
        if (data.gioKetThuc <= data.gioBatDau) throw new Error('Giờ kết thúc phải sau giờ bắt đầu.');
        const phim = form.elements.maPhim.selectedOptions[0].textContent;
        const phong = form.elements.maPhong.selectedOptions[0].textContent;
        showResult(`<h2>Suất chiếu · xem trước</h2><p>${thoat(phim)} · ${thoat(phong)}</p>
            <p>${thoat(dinhDangNgay(data.ngayChieu))} · ${thoat(data.gioBatDau)} – ${thoat(data.gioKetThuc)}</p>`);
    });
}

async function suatChiTiet() {
    const s = await getSuat();
    const query = new URLSearchParams({ maSuat: s.maSuat, ngay: s.ngayChieu });
    const coTheYeuCauHuy = ['SAP_CHIEU', 'DANG_CHIEU'].includes(s.trangThai);
    $('chi-tiet').innerHTML = `<h2>${thoat(s.tenPhim)} · ${thoat(s.maSuat)}</h2>
        <p>${thoat(s.tenPhong)} · ${dinhDangNgay(s.ngayChieu)} · ${dinhDangGio(s.gioBatDau)} – ${dinhDangGio(s.gioKetThuc)}</p>
        <p>${chipTrangThai(s.trangThai, NHAN.trangThaiSuat)}</p>
        <p>${s.soGheDaBan} ghế đã bán · ${s.soGheDangGiu} đang giữ · ${s.soGheTrong} trống</p>
        ${coTheYeuCauHuy ? `<a class="button secondary" href="suat-chieu-form.html?${query}">Sửa suất chiếu</a>` : ''}`;
    form.hidden = !coTheYeuCauHuy;
    bindPreview(() => {
        showResult(s.soGheDaBan > 0
            ? `<h2>Còn vé cần xử lý</h2><p>Suất có ${s.soGheDaBan} ghế đã bán. Cần xử lý các vé liên quan trước khi hủy.</p>`
            : `<h2>Xem trước yêu cầu hủy</h2><p>Lý do: ${thoat(form.elements.lyDo.value.trim())}</p><p>Suất chiếu chưa bị hủy.</p>`);
    });
}

async function xuLyVe() {
    const maDon = thamSo('maDonHang');
    if (!maDon) throw new Error('Chọn một đơn đã thanh toán từ trang Tra cứu vé.');
    const don = await goiApi('/api/dat-ve/ket-qua/' + encodeURIComponent(maDon));
    const ve = don.trangThaiDon === 'DA_THANH_TOAN'
        ? don.dsVe.filter(v => v.trangThai === 'CHUA_SU_DUNG') : [];
    if (!ve.length) throw new Error('Đơn không có vé ở trạng thái chưa sử dụng.');
    $('chi-tiet').innerHTML = `<h2>Đơn ${thoat(don.maDonHang)}</h2>
        <p>${thoat(don.tenPhim)} · ${dinhDangNgay(don.ngayChieu)} · ${dinhDangGio(don.gioBatDau)}</p>`;
    $('ve').innerHTML = option('', 'Chọn vé') +
        ve.map(v => option(v.maVe, `${v.maVe} · Ghế ${v.tenGhe} · ${dinhDangTien(v.donGia)}`)).join('');
    const picker = mode === 'doi' ? await openPicker() : null;
    form.hidden = false;
    bindPreview(() => {
        const chon = ve.find(v => v.maVe === $('ve').value);
        if (!chon) throw new Error('Vui lòng chọn vé.');
        if (mode === 'doi') {
            const { suat, ghe } = picker();
            if (!suat || !ghe.length) throw new Error('Vui lòng chọn suất và ghế mới.');
            const chenhLech = Number(ghe[0].giaVe) - Number(chon.donGia);
            showResult(`<h2>Xem trước đổi vé</h2><p>Vé ${thoat(chon.maVe)} → ${thoat(labelSuat(suat))} · Ghế ${thoat(ghe[0].tenGhe)}</p>
                <p>Chênh lệch giá vé: <strong>${dinhDangTien(chenhLech)}</strong></p>`);
        } else {
            const lyDo = form.elements.lyDo.value.trim();
            if (!lyDo) throw new Error('Vui lòng nhập lý do hủy.');
            showResult(`<h2>Xem trước yêu cầu hoàn tiền</h2><p>Vé ${thoat(chon.maVe)} · Ghế ${thoat(chon.tenGhe)}</p>
                <p>Lý do: ${thoat(lyDo)}</p><p>Giá gốc của vé: <strong>${dinhDangTien(chon.donGia)}</strong></p>
                <p>Số tiền hoàn cần được xác định theo chính sách của rạp.</p>`);
        }
    });
}

async function phimNoiBo() {
    const phim = await goiApi('/api/quan-ly/phim');
    $('phim').innerHTML = option('', 'Chọn phim') + phim.map(p => option(p.maPhim, p.tenPhim)).join('');
    let request = 0;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const id = ++request;
        $('ket-qua').hidden = true;
        hienThongBao($('thong-bao'), '');
        try {
            const p = await goiApi('/api/quan-ly/phim/' + encodeURIComponent($('phim').value));
            if (id !== request) return;
            const tinhTrang = { DANG_CHIEU: 'Đang chiếu', SAP_CHIEU: 'Sắp chiếu', NGUNG_CHIEU: 'Ngừng chiếu' };
            showResult(`<h2>${thoat(p.tenPhim)}</h2>
                ${p.poster ? `<img alt="Poster ${thoat(p.tenPhim)}" src="images/${encodeURIComponent(p.poster)}">` : ''}
                <p>${thoat(p.maPhim)} · ${thoat(tinhTrang[p.trangThai])} · ${thoat(p.gioiHanDoTuoi)}</p>
                <p>${thoat(p.theLoai)} · ${thoat(p.thoiLuong)} phút · Khởi chiếu ${dinhDangNgay(p.ngayKhoiChieu)}</p>
                <p>Đạo diễn: ${thoat(p.daoDien)} · Diễn viên: ${thoat(p.dienVien)}</p>
                <p>${thoat(p.noiDung)}</p>`);
        } catch (error) {
            if (id === request) showError(error.message);
        }
    });
}

try {
    const role = (await layNguoiDungDatVe())?.vaiTro;
    const allowed = ['huy', 'phim'].includes(mode) ? ['NHAN_VIEN', 'QUAN_LY']
        : ['ban', 'doi'].includes(mode) ? ['NHAN_VIEN'] : ['QUAN_LY'];
    if (!allowed.includes(role)) {
        form.hidden = true;
        if ($('chi-tiet')) $('chi-tiet').hidden = true;
        throw new Error('Vui lòng đăng nhập bằng tài khoản có quyền sử dụng màn này.');
    }
    await ({ ban: banVe, 'suat-form': suatForm, 'suat-chi-tiet': suatChiTiet, doi: xuLyVe, huy: xuLyVe, phim: phimNoiBo })[mode]();
} catch (error) {
    form.hidden = true;
    if ($('chi-tiet')?.textContent === 'Đang tải suất chiếu…') $('chi-tiet').hidden = true;
    showError(error.message);
}
