import {anToan,thongBao} from './kho-common.js';
const $=id=>document.getElementById(id),KEY='cinema.danh.soatve.demo.v1';
const VE_MAU=[
 {maVe:'V-DEMO-001',maQR:'CINEMA-DEMO-OK',tenPhim:'Ma Mút Con Vượt Kỷ Băng Hà',ngay:'25/11/2026',gio:'18:00',phong:'Phòng 03 VIP',ghe:'C05',khach:'Phạm Ngọc Mai',trangThai:'CHUA_SU_DUNG'},
 {maVe:'V01',maQR:'CINEMA-DEMO-01',tenPhim:'Trại Giam Hạnh Phúc',ngay:'21/11/2026',gio:'15:00',phong:'Phòng 01',ghe:'B05',khach:'Phạm Ngọc Mai',trangThai:'DA_SU_DUNG'},
 {maVe:'V05',maQR:'CINEMA-DEMO-05',tenPhim:'Ma Mút Con Vượt Kỷ Băng Hà',ngay:'25/11/2026',gio:'18:00',phong:'Phòng 03 VIP',ghe:'C05',khach:'Khách demo',trangThai:'DA_HUY'}
];
function docVe(){try{const d=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(d))return d;}catch{}localStorage.setItem(KEY,JSON.stringify(VE_MAU));return structuredClone(VE_MAU);}
let veDangChon=null;
function nhan(tt){return ({CHUA_SU_DUNG:'Chưa sử dụng',DA_SU_DUNG:'Đã sử dụng',DA_HUY:'Đã hủy',HET_HAN:'Hết hạn',DA_DOI:'Đã đổi'})[tt]||tt;}
function traCuu(ma){
 const ve=docVe().find(v=>v.maVe.toLowerCase()===ma.toLowerCase()||v.maQR.toLowerCase()===ma.toLowerCase());
 if(!ve){$('ket-qua-ve').innerHTML='';veDangChon=null;thongBao($('thong-bao'),'Không tìm thấy vé. Vui lòng kiểm tra lại mã vé hoặc mã QR.','loi');return;}
 veDangChon=ve;thongBao($('thong-bao'),'Đã tìm thấy thông tin vé. Vui lòng kiểm tra trạng thái trước khi xác nhận.','thanh-cong');
 const hopLe=ve.trangThai==='CHUA_SU_DUNG';
 $('ket-qua-ve').innerHTML=`<section class="ticket-panel"><div class="ticket-panel-head"><div><strong>Vé ${anToan(ve.maVe)}</strong><div class="muted">Mã QR: ${anToan(ve.maQR)}</div></div><span class="chip ${hopLe?'tot':ve.trangThai==='DA_SU_DUNG'?'trung-tinh':'xau'}">${nhan(ve.trangThai)}</span></div><div class="ticket-panel-body"><h2 style="font-size:21px;margin-bottom:16px">${anToan(ve.tenPhim)}</h2><div class="ticket-grid"><div class="ticket-data"><small>Khách hàng</small><strong>${anToan(ve.khach)}</strong></div><div class="ticket-data"><small>Ngày chiếu</small><strong>${anToan(ve.ngay)}</strong></div><div class="ticket-data"><small>Giờ chiếu</small><strong>${anToan(ve.gio)}</strong></div><div class="ticket-data"><small>Phòng chiếu</small><strong>${anToan(ve.phong)}</strong></div><div class="ticket-data"><small>Ghế</small><strong>${anToan(ve.ghe)}</strong></div><div class="ticket-data"><small>Trạng thái</small><strong>${nhan(ve.trangThai)}</strong></div></div><div class="hanh-dong"><button class="button primary" id="xac-nhan" ${hopLe?'':'disabled'}>Xác nhận khách vào rạp</button><button class="button secondary" id="lam-moi">Tra cứu mã khác</button></div>${!hopLe?`<p class="muted" style="margin-top:10px">${ve.trangThai==='DA_SU_DUNG'?'Vé đã được check-in trước đó, không thể xác nhận lại.':'Vé không đủ điều kiện sử dụng.'}</p>`:''}</div></section>`;
 $('xac-nhan')?.addEventListener('click',()=>{
   const ds=docVe(),v=ds.find(x=>x.maVe===ve.maVe);
   if(!v||v.trangThai!=='CHUA_SU_DUNG'){thongBao($('thong-bao'),'Vé đã được sử dụng hoặc không còn hợp lệ.','loi');return;}
   v.trangThai='DA_SU_DUNG';localStorage.setItem(KEY,JSON.stringify(ds));traCuu(v.maVe);thongBao($('thong-bao'),'Check-in demo thành công. Vé đã chuyển sang trạng thái Đã sử dụng.','thanh-cong');
 });
 $('lam-moi').addEventListener('click',()=>{$('ma-ve').value='';$('ma-ve').focus();$('ket-qua-ve').innerHTML='';$('thong-bao').hidden=true;});
}
$('form-tra-cuu').addEventListener('submit',e=>{e.preventDefault();const ma=$('ma-ve').value.trim();if(!ma){thongBao($('thong-bao'),'Vui lòng nhập mã vé.','loi');return;}traCuu(ma);});
