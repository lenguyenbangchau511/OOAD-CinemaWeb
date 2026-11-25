import { goiApi, hienThongBao, homNay, thamSo, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
const maSuat = thamSo('maSuat');
let dsPhim = [];
let lichTrongNgay = [];

(async function khoiTao() {
    $('ngay').value = homNay();
    if (maSuat) {
        $('tieu-de').textContent = `Cập nhật suất chiếu (${maSuat})`;
    }

    try {
        const [bl, phimFull] = await Promise.all([
            goiApi('/api/suat-chieu/bo-loc'),
            goiApi('/api/quan-ly/phim').catch(() => [])
        ]);

        // Ghép thời lượng phim từ API quản lý phim (mặc định 120 phút nếu chưa có)
        const mapThoiLuong = Object.fromEntries((phimFull || []).map(p => [p.maPhim, Number(p.thoiLuong) || 120]));
        dsPhim = (bl.phim || []).map(p => ({ ...p, thoiLuong: mapThoiLuong[p.maPhim] || 120 }));

        $('phim').insertAdjacentHTML('beforeend',
            dsPhim.map(p => `<option value="${thoat(p.maPhim)}">${thoat(p.tenPhim)} (${p.thoiLuong} phút)</option>`).join('')
        );
        $('phong').insertAdjacentHTML('beforeend',
            (bl.phong || []).map(p => `<option value="${thoat(p.maPhong)}">${thoat(p.tenPhong)}</option>`).join('')
        );

        if (maSuat) {
            const chiTiet = await goiApi(`/api/suat-chieu/${encodeURIComponent(maSuat)}/so-do-ghe`);
            const s = chiTiet.suatChieu || chiTiet;
            if (s.maPhim) $('phim').value = s.maPhim;
            if (s.maPhong) $('phong').value = s.maPhong;
            if (s.gioBatDau) {
                $('ngay').value = s.gioBatDau.slice(0, 10);
                $('gio-bat-dau').value = s.gioBatDau.slice(11, 16);
            }
            if (s.trangThai) $('trang-thai').value = s.trangThai;
        }
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.thongBao || 'Không tải được danh mục phim/phòng.', 'loi');
    }

    await taiLichKiemTraTrung();
    tinhGioKetThuc();
})();

async function taiLichKiemTraTrung() {
    const ngay = $('ngay').value;
    if (!ngay) return;
    try {
        lichTrongNgay = await goiApi('/api/suat-chieu?ngay=' + encodeURIComponent(ngay));
    } catch {
        lichTrongNgay = [];
    }
}

function tinhGioKetThuc() {
    const maPhim = $('phim').value;
    const gioBD = $('gio-bat-dau').value;
    if (!gioBD) return;

    const phim = dsPhim.find(p => p.maPhim === maPhim);
    const tongPhut = (phim ? phim.thoiLuong : 120) + 15; // +15 phút dọn vệ sinh rạp
    const [h, m] = gioBD.split(':').map(Number);
    const ketThucPhut = (h * 60 + m + tongPhut) % (24 * 60);
    const hh = String(Math.floor(ketThucPhut / 60)).padStart(2, '0');
    const mm = String(ketThucPhut % 60).padStart(2, '0');
    $('gio-ket-thuc').value = `${hh}:${mm}`;
}

function kiemTraXungDot() {
    const maPhong = $('phong').value;
    const bd = $('gio-bat-dau').value;
    const kt = $('gio-ket-thuc').value;
    return lichTrongNgay.find(s => {
        if (maSuat && s.maSuat === maSuat) return false;
        if (s.maPhong !== maPhong || s.trangThai === 'DA_HUY') return false;
        const sBD = (s.gioBatDau || '').slice(11, 16);
        const sKT = (s.gioKetThuc || '').slice(11, 16);
        return bd < sKT && kt > sBD;
    });
}

$('phim').addEventListener('change', tinhGioKetThuc);
$('gio-bat-dau').addEventListener('change', tinhGioKetThuc);
$('ngay').addEventListener('change', async () => { await taiLichKiemTraTrung(); });

$('form-suat').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('ngay').value < homNay()) {
        hienThongBao($('thong-bao'), 'Ngày chiếu không được nhỏ hơn ngày hiện tại.', 'loi');
        return;
    }
    const trung = kiemTraXungDot();
    if (trung) {
        hienThongBao($('thong-bao'),
            `Xung đột lịch chiếu! Phòng này đã có suất "${trung.tenPhim}" (${trung.gioBatDau.slice(11, 16)} – ${trung.gioKetThuc.slice(11, 16)}).`,
            'loi'
        );
        return;
    }
    hienThongBao($('thong-bao'),
        `Đã kiểm tra hợp lệ và ghi nhận thao tác mẫu ${maSuat ? 'cập nhật' : 'thêm mới'} suất chiếu (${$('gio-bat-dau').value} – ${$('gio-ket-thuc').value}).`,
        'thanh-cong'
    );
});