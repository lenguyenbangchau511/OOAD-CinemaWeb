import {anToan, thongBao} from './kho-common.js';
const $ = id => document.getElementById(id);
let veDangChon = null;

function nhan(trangThai) {
  return ({
    CHUA_SU_DUNG: 'Chưa sử dụng',
    DA_SU_DUNG: 'Đã sử dụng',
    DA_HUY: 'Đã hủy',
    HET_HAN: 'Hết hạn',
    DA_DOI: 'Đã đổi'
  })[trangThai] || trangThai || 'Không xác định';
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    throw new Error(body?.thongBao || body?.message || body?.error || `HTTP ${response.status}`);
  }
  return body;
}

function dinhDangNgay(value) {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(d);
}

function dinhDangThoiGian(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short', timeStyle: 'short'
  }).format(d);
}

function hienThiVe(ve) {
  veDangChon = ve;
  const duocSoat = Boolean(ve.coTheSoat);
  const chipClass = ve.trangThai === 'CHUA_SU_DUNG' ? 'tot'
    : ve.trangThai === 'DA_SU_DUNG' ? 'trung-tinh' : 'xau';
  $('ket-qua-ve').innerHTML = `
    <section class="ticket-panel">
      <div class="ticket-panel-head">
        <div><strong>Vé ${anToan(ve.maVe)}</strong><div class="muted">Mã QR: ${anToan(ve.maQR)}</div></div>
        <span class="chip ${chipClass}">${nhan(ve.trangThai)}</span>
      </div>
      <div class="ticket-panel-body">
        <h2 style="font-size:21px;margin-bottom:16px">${anToan(ve.tenPhim)}</h2>
        <div class="ticket-grid">
          <div class="ticket-data"><small>Khách hàng</small><strong>${anToan(ve.tenKhachHang || '—')}</strong></div>
          <div class="ticket-data"><small>Ngày chiếu</small><strong>${anToan(dinhDangNgay(ve.ngayChieu))}</strong></div>
          <div class="ticket-data"><small>Giờ chiếu</small><strong>${anToan(ve.gioChieu || '—')}</strong></div>
          <div class="ticket-data"><small>Phòng chiếu</small><strong>${anToan(ve.tenPhong || '—')}</strong></div>
          <div class="ticket-data"><small>Ghế</small><strong>${anToan(ve.tenGhe || '—')}</strong></div>
          <div class="ticket-data"><small>Thời điểm check-in</small><strong>${anToan(dinhDangThoiGian(ve.thoiDiemCheckIn))}</strong></div>
        </div>
        <div class="hanh-dong">
          <button class="button primary" id="xac-nhan" ${duocSoat ? '' : 'disabled'}>Xác nhận khách vào rạp</button>
          <button class="button secondary" id="lam-moi" type="button">Tra cứu mã khác</button>
        </div>
        ${!duocSoat ? `<p class="muted" style="margin-top:10px">${anToan(ve.lyDo || 'Vé không đủ điều kiện sử dụng.')}</p>` : ''}
      </div>
    </section>`;

  $('xac-nhan')?.addEventListener('click', async () => {
    if (!veDangChon?.maVe) return;
    const btn = $('xac-nhan');
    btn.disabled = true;
    btn.textContent = 'Đang xác nhận...';
    try {
      const daSoat = await api(`/api/ve/${encodeURIComponent(veDangChon.maVe)}/check-in`, {method: 'POST'});
      hienThiVe(daSoat);
      thongBao($('thong-bao'), 'Check-in thành công. Trạng thái vé đã được cập nhật trong CSDL.', 'thanh-cong');
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Xác nhận khách vào rạp';
      thongBao($('thong-bao'), e.message, 'loi');
    }
  });

  $('lam-moi')?.addEventListener('click', () => {
    veDangChon = null;
    $('ma-ve').value = '';
    $('ket-qua-ve').innerHTML = '';
    $('ma-ve').focus();
    $('thong-bao').hidden = true;
  });
}

$('form-tra-cuu').addEventListener('submit', async e => {
  e.preventDefault();
  const ma = $('ma-ve').value.trim();
  if (!ma) {
    thongBao($('thong-bao'), 'Vui lòng nhập mã vé hoặc mã QR.', 'loi');
    return;
  }
  const btn = $('form-tra-cuu').querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Đang tra cứu...';
  try {
    const ve = await api(`/api/ve/soat-ve/${encodeURIComponent(ma)}`);
    hienThiVe(ve);
    thongBao($('thong-bao'), 'Đã tra cứu vé trực tiếp từ CSDL. Hãy kiểm tra đúng phim, phòng và ghế trước khi xác nhận.', 'thanh-cong');
  } catch (err) {
    veDangChon = null;
    $('ket-qua-ve').innerHTML = '';
    thongBao($('thong-bao'), err.message, 'loi');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Tra cứu vé';
  }
});

$('api-status').textContent = 'Nhập mã vé hoặc mã QR để tra cứu trực tiếp từ CSDL Spring Boot.';
