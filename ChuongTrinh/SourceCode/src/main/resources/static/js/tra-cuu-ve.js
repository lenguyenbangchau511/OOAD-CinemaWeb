import { chipTrangThai, dinhDangNgay, goiApi, hienThongBao, NHAN, TRANG, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
let danhSachHienTai = [];

async function taiDanhSachBanDau() {
    try {
        const res = await goiApi('/api/ve', { chuyenKhiChuaDangNhap: false });
        if (Array.isArray(res)) {
            danhSachHienTai = res;
            veBang(danhSachHienTai);
            return;
        }
    } catch {
        // Nếu backend chưa mở GET /api/ve, thử lấy danh sách vé từ lịch sử đơn hàng
        try {
            const lichSu = await goiApi('/api/dat-ve/lich-su', { chuyenKhiChuaDangNhap: false });
            if (Array.isArray(lichSu)) {
                danhSachHienTai = lichSu.flatMap(don => (don.danhSachVe || []).map(v => ({
                    ...v,
                    maDonHang: don.maDonHang,
                    tenKhachHang: don.tenKhachHang || v.tenKhachHang || 'Khách hàng',
                    tenPhim: don.tenPhim || v.tenPhim,
                    ngayChieu: don.ngayChieu || v.ngayChieu,
                    gioChieu: don.gioChieu || v.gioChieu,
                    tenPhong: don.tenPhong || v.tenPhong
                })));
            }
        } catch { /* bỏ qua nếu chưa đăng nhập */ }
    }
    veBang(danhSachHienTai);
}

function veBang(ds) {
    if (!ds || !ds.length) {
        $('ds-ve').innerHTML = `<tr><td colspan="7">Nhập <strong>Mã vé</strong> hoặc <strong>Mã QR</strong> ở ô tìm kiếm phía trên để tra cứu trực tiếp từ CSDL.</td></tr>`;
        return;
    }

    $('ds-ve').innerHTML = ds.map(v => {
        const maVe = encodeURIComponent(v.maVe || '');
        const linkChiTiet = v.maDonHang
            ? `${TRANG.chiTietVe}?maDonHang=${encodeURIComponent(v.maDonHang)}&maVe=${maVe}`
            : `${TRANG.chiTietVe}?maVe=${maVe}`;
        const choPhepDoiHuy = v.trangThai === 'CHUA_SU_DUNG';

        return `<tr>
            <td><strong>${thoat(v.maVe)}</strong><br><small class="muted">${thoat(v.maQR || '')}</small></td>
            <td>${thoat(v.tenKhachHang || 'Khách vãng lai')}</td>
            <td><strong>${thoat(v.tenPhim || '—')}</strong></td>
            <td>${thoat(v.gioChieu || '')} ${dinhDangNgay(v.ngayChieu)}</td>
            <td>${thoat(v.tenPhong || '—')} · <strong>${thoat(v.tenGhe || '—')}</strong></td>
            <td>${chipTrangThai(v.trangThai, NHAN.trangThaiVe)}</td>
            <td>
                <div class="mc-row-actions">
                    <a href="${linkChiTiet}">Chi tiết</a>
                    ${choPhepDoiHuy
                        ? `<a href="doi-ve.html?maVe=${maVe}">Đổi vé</a>
                           <a href="huy-ve.html?maVe=${maVe}">Hủy vé</a>`
                        : `<span class="muted">Không thể đổi/hủy</span>`}
                </div>
            </td>
        </tr>`;
    }).join('');
}

$('form-loc').addEventListener('submit', async (e) => {
    e.preventDefault();
    hienThongBao($('thong-bao'), '');
    const tuKhoa = $('tu-khoa').value.trim();
    const ngay = $('ngay-chieu').value;
    const trangThai = $('trang-thai').value;

    // Gọi trực tiếp API thật của VeController khi nhập mã vé / mã QR
    if (tuKhoa) {
        try {
            const ve = await goiApi(`/api/ve/soat-ve/${encodeURIComponent(tuKhoa)}`, { chuyenKhiChuaDangNhap: false });
            if (ve && ve.maVe) {
                sessionStorage.setItem('cinema.veDangXuLy', JSON.stringify(ve));
                const ketQua = [ve].filter(v => (!ngay || v.ngayChieu === ngay) && (!trangThai || v.trangThai === trangThai));
                veBang(ketQua);
                hienThongBao($('thong-bao'), `Đã tìm thấy vé ${ve.maVe} từ CSDL.`, 'thanh-cong');
                return;
            }
        } catch {
            // Nếu không khớp chính xác mã vé, tiếp tục lọc trên danh sách hiện có
        }
    }

    const kw = tuKhoa.toLowerCase();
    const ketQuaLoc = danhSachHienTai.filter(v => {
        const khopTuKhoa = !kw || [v.maVe, v.maQR, v.tenKhachHang, v.tenPhim, v.tenGhe]
            .some(truong => String(truong || '').toLowerCase().includes(kw));
        const khopNgay = !ngay || v.ngayChieu === ngay;
        const khopTT = !trangThai || v.trangThai === trangThai;
        return khopTuKhoa && khopNgay && khopTT;
    });

    veBang(ketQuaLoc);
    if (!ketQuaLoc.length && tuKhoa) {
        hienThongBao($('thong-bao'), `Không tìm thấy vé nào khớp với "${tuKhoa}".`, 'loi');
    }
});

$('nut-xoa-loc').addEventListener('click', () => {
    $('tu-khoa').value = '';
    $('ngay-chieu').value = '';
    $('trang-thai').value = '';
    hienThongBao($('thong-bao'), '');
    veBang(danhSachHienTai);
});

taiDanhSachBanDau();