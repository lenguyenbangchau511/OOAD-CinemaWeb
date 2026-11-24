// Điểm nối tối thiểu với trang chủ của nhóm; không sửa danh sách phim.
import {api,current,logout,esc,icon} from './cinema-ui.js';
const root=document.getElementById('cinema-home-account');
if(root) init();
async function init(){
    let user;try{user=await current();}catch{return;}
    root.innerHTML=`<details class="cinema-account-menu"><summary class="button secondary" aria-label="Menu tài khoản">${icon('user')} <span>${esc(user.hoTen||user.tenDangNhap)}</span></summary><div class="cinema-account-panel"><strong>${esc(user.tenDangNhap)}</strong><small>${esc(user.email)}</small><hr><a href="tai-khoan-ca-nhan.html">Quản lý tài khoản cá nhân</a>${user.vaiTro==='KHACH_HANG'?'<a href="lich-su-ve.html">Lịch sử mua vé</a>':'<a href="noi-bo.html">Không gian nội bộ</a>'}<hr><a href="doi-mat-khau.html">${icon('lock')} Đổi mật khẩu</a><button type="button" id="home-logout">${icon('logout')} Đăng xuất</button><p id="home-message" role="status" hidden></p></div></details>`;
    document.getElementById('home-logout').onclick=async()=>{try{await logout();}catch(e){message(e.message);}};
    document.addEventListener('click',e=>{if(!root.contains(e.target))root.querySelector('details').open=false;});
}
function message(text){const el=document.getElementById('home-message');el.textContent=text;el.hidden=false;}
