/* Giao diện 12 - Lịch sử mua vé (UC5.9). Chạy thật với /api/lich-su-ve. Khách chỉ thấy đơn của mình; nhân viên / quản lý tra cứu thêm theo SĐT. */
import {
    capNhatThanhTren, chipTrangThai, dinhDangGio, dinhDangNgay, dinhDangNgayGio, dinhDangTien, goiApi, hienThongBao,
    NHAN, TRANG, thoat
} from './datve-common.js';

const $ = (id) => document.getElementById(id);
let laNhanVien = false;

khoiTao();

async function khoiTao() {
    const toi = await capNhatThanhTren();
    laNhanVien = toi && (toi.vaiTro === 'NHAN_VIEN' || toi.vaiTro === 'QUAN_LY');
    if (laNhanVien) {
        $('nhan-tu-khoa').textContent = 'Mã đơn, mã vé hoặc số điện thoại khách';
        $('tu-khoa').placeholder = 'Ví dụ DH01, V01, 0901234567';
        $('ghi-chu').textContent = 'Tra cứu giao dịch của khách hàng theo mã đơn, mã vé hoặc số điện thoại.';
    }
    $('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); tim(); });
    $('xoa-loc').addEventListener('click', () => { $('bo-loc').reset(); tim(); });
    tim();
}

async function tim() {
    const tuNgay = $('tu-ngay').value, denNgay = $('den-ngay').value;
    if (tuNgay && denNgay && tuNgay > denNgay) {             // kiểm tra phía giao diện, server cũng kiểm tra
        hienThongBao($('thong-bao'), 'Thời điểm bắt đầu không được sau thời điểm kết thúc', 'loi');
        return;
    }
    hienThongBao($('thong-bao'), '');
    const q = new URLSearchParams();
    [['tuKhoa', $('tu-khoa').value.trim()], ['tuNgay', tuNgay], ['denNgay', denNgay],
        ['trangThaiDon', $('tt-don').value], ['trangThaiVe', $('tt-ve').value]]
        .forEach(([k, v]) => { if (v) q.set(k, v); });
    try {
        const ds = await goiApi('/api/lich-su-ve?' + q);
        ve(ds, q.size > 0);
    } catch (loi) {
        $('ket-qua').innerHTML = '';
        $('so-ket-qua').textContent = '';
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
    }
}

function ve(ds, coLoc) {
    $('so-ket-qua').textContent = ds.length ? `${ds.length} giao dịch` : '';
    if (ds.length === 0) {
        $('ket-qua').innerHTML = `<div class="trong"><h2>${coLoc ? 'Không tìm thấy vé phù hợp' : 'Chưa có giao dịch mua vé'}</h2>
            <p class="muted">${coLoc ? 'Thử đổi hoặc xóa bộ lọc.' : 'Các giao dịch của bạn sẽ hiện ở đây.'}</p></div>`;
        return;
    }
    $('ket-qua').innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Phim / suất chiếu</th><th>Ghế</th>
            <th class="so">Tổng tiền</th><th>Đơn</th><th>Vé</th><th></th></tr></thead>
        <tbody>${ds.map((d) => `<tr>
            <td><strong>${thoat(d.maDonHang)}</strong><br><span class="muted">${NHAN.kenhBan[d.kenhBan] || ''}</span></td>
            <td>${dinhDangNgayGio(d.ngayDat)}</td>
            <td>${d.tenPhim ? `${thoat(d.tenPhim)}<br><span class="muted">${dinhDangGio(d.gioBatDau)} · ${dinhDangNgay(d.ngayChieu)} · ${thoat(d.tenPhong)}</span>`
                : '<span class="muted">Chưa có vé</span>'}</td>
            <td>${d.dsGhe.length ? thoat(d.dsGhe.join(', ')) : '—'}</td>
            <td class="so">${dinhDangTien(d.tongTien)}</td>
            <td>${chipTrangThai(d.trangThaiDon, NHAN.trangThaiDon)}</td>
            <td>${chipVe(d.soVeTheoTrangThai)}</td>
            <td><a class="button secondary nho" href="${TRANG.chiTietVe}?maDonHang=${encodeURIComponent(d.maDonHang)}">Chi tiết</a></td>
        </tr>`).join('')}</tbody></table></div>`;
}

/** Số vé theo từng trạng thái trong đơn; trạng thái đang được lọc thì đậm lên để kết quả lọc dễ hiểu. */
function chipVe(soVe) {
    const loc = $('tt-ve').value;
    const ds = Object.entries(soVe || {});
    if (!ds.length) return '—';
    return ds.map(([tt, n]) => `<div style="${tt === loc ? 'font-weight:700' : ''}">${n} × ${chipTrangThai(tt, NHAN.trangThaiVe)}</div>`).join('');
}
