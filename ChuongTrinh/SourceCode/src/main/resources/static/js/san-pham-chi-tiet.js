import { anhMon } from './datve-common.js';
import { tien, anToan, trangThaiTon } from './kho-common.js';
const ma=new URLSearchParams(location.search).get('ma');
const box=document.getElementById('noi-dung-chi-tiet');
const status=document.getElementById('api-status');
const edit=document.getElementById('nut-sua');
async function taiChiTiet(){
  if(!ma){ status.className='alert loi';status.textContent='Thiếu mã sản phẩm hoặc combo.';return; }
  try{
    const res=await fetch('/api/quan-ly/ton-kho/chi-tiet/'+encodeURIComponent(ma),{credentials:'same-origin',headers:{Accept:'application/json'}});
    if(!res.ok){let msg=`HTTP ${res.status}`;try{const b=await res.json();msg=b.thongBao||b.message||b.thongDiep||msg;}catch{}throw new Error(msg);}
    const d=await res.json();
    status.className='alert thanh-cong';status.textContent='Dữ liệu chi tiết được tải trực tiếp từ CSDL Spring Boot.';
    if(d.loaiDoiTuong==='SAN_PHAM'){
      document.querySelector('h1').textContent=d.tenSanPham;
      const [label,cls]=trangThaiTon({soLuongTon:d.soLuongTon,mucTonToiThieu:d.mucTonToiThieu});
      const img=anhMon(d);
      box.innerHTML=`<div class="product-hero"><div class="product-art">${img?`<img src="${anToan(img)}" alt="${anToan(d.tenSanPham)}">`:d.loaiSanPham==='DO_AN'?'🍿':'🥤'}</div><div><h2>${anToan(d.tenSanPham)}</h2><p class="muted">${anToan(d.maSanPham)} · ${d.loaiSanPham==='DO_AN'?'Đồ ăn':'Thức uống'}</p><p style="font-size:24px;font-weight:700;color:var(--primary);margin:10px 0">${tien(d.giaBan)}</p><span class="status-pill ${d.trangThai==='DANG_BAN'?'active':'off'}">${d.trangThai==='DANG_BAN'?'Đang bán':'Ngừng bán'}</span></div></div>
      <section class="form-card"><h2>Thông tin sản phẩm</h2><div class="detail-grid">
      <div class="detail-item"><small>Mã sản phẩm</small><strong>${anToan(d.maSanPham)}</strong></div><div class="detail-item"><small>Loại sản phẩm</small><strong>${d.loaiSanPham==='DO_AN'?'Đồ ăn':'Thức uống'}</strong></div><div class="detail-item"><small>Đơn vị tính</small><strong>${anToan(d.donViTinh)}</strong></div><div class="detail-item"><small>Giá bán</small><strong>${tien(d.giaBan)}</strong></div><div class="detail-item"><small>Tồn hiện tại</small><strong>${d.soLuongTon} ${anToan(d.donViTinh)}</strong></div><div class="detail-item"><small>Tồn tối thiểu</small><strong>${d.mucTonToiThieu}</strong></div><div class="detail-item"><small>Tình trạng tồn</small><strong><span class="chip ${cls}">${label}</span></strong></div></div><h3 style="margin-top:18px">Mô tả</h3><p style="margin-top:6px">${anToan(d.moTa)}</p></section>`;
      edit.href=`san-pham-form.html?ma=${encodeURIComponent(ma)}`;
    }else{
      document.querySelector('h1').textContent=d.tenCombo;
      const rows=(d.thanhPhan||[]).map(x=>`<tr><td>${anToan(x.maSanPham)}</td><td>${anToan(x.tenSanPham)}</td><td class="so">${x.soLuong}</td><td>${anToan(x.donViTinh)}</td></tr>`).join('');
      const img=anhMon(d);
      box.innerHTML=`<div class="product-hero"><div class="product-art">${img?`<img src="${anToan(img)}" alt="${anToan(d.tenCombo)}">`:'🍿🥤'}</div><div><h2>${anToan(d.tenCombo)}</h2><p class="muted">${anToan(d.maCombo)} · Combo</p><p style="font-size:24px;font-weight:700;color:var(--primary);margin:10px 0">${tien(d.giaCombo)}</p><span class="status-pill ${d.trangThai==='DANG_BAN'?'active':'off'}">${d.trangThai==='DANG_BAN'?'Đang bán':'Ngừng bán'}</span></div></div><section class="form-card"><h2>Thông tin combo</h2><p>${anToan(d.moTa)}</p><h3 style="margin-top:18px;margin-bottom:10px">Thành phần combo</h3><div class="table-wrap"><table><thead><tr><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th class="so">Số lượng</th><th>Đơn vị</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted" style="margin-top:10px">Combo không có số lượng tồn kho riêng; tồn kho được quản lý theo từng sản phẩm thành phần.</p></section>`;
      edit.href=`combo-form.html?ma=${encodeURIComponent(ma)}`;
    }
  }catch(e){
    status.className='alert loi';status.textContent=`Không tải được chi tiết từ máy chủ: ${e.message}. Hãy đăng nhập bằng tài khoản có quyền Quản lý/Nhân viên.`;
    box.innerHTML='<div class="trong"><h2>Không thể tải dữ liệu</h2><p>Kiểm tra đăng nhập, mã tra cứu và trạng thái máy chủ.</p></div>';
    edit.hidden=true;
  }
}
taiChiTiet();
