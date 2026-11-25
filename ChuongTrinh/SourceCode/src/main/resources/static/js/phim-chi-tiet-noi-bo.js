import { goiApi, hienThongBao } from './datve-common.js';

const $ = id => document.getElementById(id);
const tenTrangThai = {
    DANG_CHIEU: 'Đang chiếu',
    SAP_CHIEU: 'Sắp chiếu',
    NGUNG_CHIEU: 'Ngừng chiếu'
};

async function taiChiTietPhim() {
    const maPhim = new URLSearchParams(location.search).get('maPhim');
    if (!maPhim) {
        hienThongBao($('thong-bao'), 'Thiếu mã phim trên đường dẫn (ví dụ: ?maPhim=P01).', 'loi');
        return;
    }

    try {
        // Gọi API danh sách quản lý phim và tìm đúng phim theo maPhim (đảm bảo chạy được ngay với controller hiện tại)
        const ds = await goiApi('/api/quan-ly/phim?tuKhoa=' + encodeURIComponent(maPhim));
        const phim = Array.isArray(ds)
            ? ds.find(p => String(p.maPhim).toLowerCase() === maPhim.toLowerCase())
            : ds;

        if (!phim) {
            hienThongBao($('thong-bao'), `Không tìm thấy thông tin phim mã "${maPhim}".`, 'loi');
            return;
        }

        $('tieu-de').textContent = `Chi tiết phim: ${phim.tenPhim}`;
        $('ten-phim').textContent = phim.tenPhim || '—';
        $('ma-phim').textContent = `Mã: ${phim.maPhim}`;
        $('do-tuoi').textContent = phim.gioiHanDoTuoi || 'P';
        $('trang-thai').textContent = tenTrangThai[phim.trangThai] || phim.trangThai || '—';

        $('dao-dien').textContent = phim.daoDien || '—';
        $('dien-vien').textContent = phim.dienVien || '—';
        $('the-loai').textContent = phim.theLoai || '—';
        $('thoi-luong').textContent = phim.thoiLuong ? `${phim.thoiLuong} phút` : '—';
        $('ngon-ngu').textContent = phim.ngonNgu || 'Phụ đề tiếng Việt';
        $('ngay-khoi-chieu').textContent = phim.ngayKhoiChieu || '—';
        $('mo-ta').textContent = phim.moTa || 'Chưa có mô tả cho phim này.';

        const posterEl = $('poster');
        if (phim.poster) {
            posterEl.src = phim.poster.startsWith('http') || phim.poster.startsWith('images/')
                ? phim.poster
                : `images/${encodeURIComponent(phim.poster)}`;
        } else {
            posterEl.alt = 'Chưa có poster';
        }

        const nutSua = $('nut-sua');
        nutSua.href = `phim-form.html?maPhim=${encodeURIComponent(phim.maPhim)}`;
        nutSua.hidden = false;

        $('khung-chi-tiet').hidden = false;
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message || 'Không tải được dữ liệu phim.', 'loi');
    }
}

taiChiTietPhim();