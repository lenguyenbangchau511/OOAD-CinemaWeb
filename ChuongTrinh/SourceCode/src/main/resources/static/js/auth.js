import { mountCustomerLayout } from './customer-layout.js';
import {$,icon,esc,brand,footer,account,bindLogout,notice,api,current,goLogin,safeReturn,emailOk,userOk,field,passField,userHint,bindEyes,clearFormErrors,formError,invalidField} from './cinema-ui.js';

const screen=document.body.dataset.screen;
const primary=t=>`<button class="btn primary" type="submit">${t}</button>`;
const back=t=>`<p class="auth-link"><a href="login.html">← ${t}</a></p>`;
const passHint='Ít nhất 8 ký tự. Nên dùng cụm từ dễ nhớ.';
let user=null;
const internalRegistration=screen==='register'&&new URLSearchParams(location.search).get('noiBo')==='1';

async function init(){
    if(screen==='change'||internalRegistration){
        try{user=await current();}catch(e){if(e.status===401)goLogin();else render('Không thể tải dữ liệu',`<p>${esc(e.message)}</p>`);return;}
    }
    if(internalRegistration&&!['QUAN_LY','NHAN_VIEN'].includes(user?.vaiTro)){location.replace('dang-ky.html');return;}
    if (internalRegistration || (user && user.vaiTro !== 'KHACH_HANG')) {
        footer();
        $('#header').innerHTML=brand(false)+account(user);
        bindLogout();
    } else {
        mountCustomerLayout($('#header').parentElement, $('#footer'), user || undefined);
    }
    await ({login,forgot,reset,register,change})[screen]();
}
function render(title,body){
    const art=['register','change'].includes(screen)?'auth-clapper.svg':'auth-ticket.svg';
    $('#main').innerHTML=`<section class="card auth-card"><h1>${title}</h1><div id="notice" class="notice" role="status" aria-live="polite" hidden></div>${body}</section><aside class="auth-art"><img src="images/${art}" alt=""><h2>Trọn vẹn từng khoảnh khắc</h2><p class="muted">Khám phá phim hay, đặt vé dễ dàng.</p></aside>`;
    $('#main').removeAttribute('aria-busy');bindEyes();
}
function bind(fn){$('#form').addEventListener('input',e=>{clearFormErrors(e.currentTarget);notice($('#notice'));});$('#form').addEventListener('submit',async e=>{
    e.preventDefault();clearFormErrors(e.target);notice($('#notice'));const b=e.submitter||$('#form button[type=submit]');b.disabled=true;
    try{await fn(Object.fromEntries(new FormData(e.target)));}catch(err){
        const fields={'Vui lòng nhập mật khẩu hiện tại':'hienTai','Mật khẩu hiện tại':'hienTai',
            'Vui lòng nhập lại mật khẩu':'xacNhan','Mật khẩu nhập lại':'xacNhan',
            'Vui lòng nhập mật khẩu':'matKhau','Mật khẩu mới':'matKhau','Mật khẩu':'matKhau',
            'Email':'email','Vui lòng nhập địa chỉ email':'email','Tên đăng nhập':'tenDangNhap',
            'Số điện thoại':'soDienThoai','Vui lòng nhập số điện thoại':'soDienThoai','Vui lòng nhập họ và tên':'hoTen'};
        const id=err.field||([400,409].includes(err.status)?Object.entries(fields).find(([prefix])=>err.message.startsWith(prefix))?.[1]:null);
        if(id&&e.target.elements.namedItem(id))formError(e.target,err,fields);
        else notice($('#notice'),err.message);
    }finally{b.disabled=false;}
});}
function login(){
    render('Đăng nhập',`<p class="intro muted">Chào mừng đến với MegaCine.</p><form id="form" novalidate>${field('taiKhoan','Tài khoản','text','Tên đăng nhập hoặc email','autocomplete="username"')}<div class="label-row"><label for="matKhau">Mật khẩu<span class="required-mark" aria-hidden="true"> *</span></label><a href="quen-mat-khau.html">Quên mật khẩu?</a></div><div class="password"><input id="matKhau" name="matKhau" type="password" autocomplete="current-password" required><button type="button" class="toggle" aria-label="Hiện mật khẩu" data-toggle="matKhau">${icon('eye')}</button></div>${primary('Đăng nhập')}</form><p class="auth-link">Chưa có tài khoản? <a href="dang-ky.html"><strong>Đăng ký ngay</strong></a></p>`);
    const pre=sessionStorage.getItem('cinema.auth.prefill'),msg=sessionStorage.getItem('cinema.auth.message');
    if(pre){$('#taiKhoan').value=pre;sessionStorage.removeItem('cinema.auth.prefill');$('#matKhau').focus();}
    if(msg){notice($('#notice'),msg,'success');sessionStorage.removeItem('cinema.auth.message');}
    bind(async d=>{
        if(!d.taiKhoan.trim()||d.taiKhoan.trim().length>255)invalidField('taiKhoan','Vui lòng nhập tài khoản hợp lệ.');
        if(!d.matKhau)invalidField('matKhau','Vui lòng nhập mật khẩu.');
        const me=await api('/api/auth/dang-nhap',d);
        location.replace(me.vaiTro==='KHACH_HANG'?(safeReturn()||'./'):'noi-bo.html');
    });
}
async function forgot(){
    const state=await api('/api/auth/khoi-phuc/trang-thai');
    if(state.cheDo==='TAT'){
        render('Quên mật khẩu','<p>Chức năng khôi phục mật khẩu chưa được cấu hình. Vui lòng liên hệ quản trị viên.</p>'+back('Quay lại đăng nhập'));return;
    }
    render('Quên mật khẩu',`<p class="intro muted">Nhập email đã đăng ký để yêu cầu liên kết đặt lại mật khẩu.</p><form id="form" novalidate>${field('email','Email đã đăng ký','email','','autocomplete="email" placeholder="Nhập địa chỉ email"')}${primary('Gửi yêu cầu đặt lại')}</form>${back('Quay lại đăng nhập')}<p class="muted">Chế độ kiểm thử cục bộ: chưa gửi email thật.</p>`);
    bind(async d=>{
        const email=d.email.trim().toLowerCase();
        if(!emailOk(email))invalidField('email','Vui lòng nhập địa chỉ email hợp lệ.');
        await api('/api/auth/quen-mat-khau',{email});
        render('Khôi phục mật khẩu',`<p>Yêu cầu đã được tiếp nhận. Nếu email hợp lệ, liên kết khôi phục sẽ được tạo.</p><p class="muted">Kiểm thử cục bộ: người vận hành kiểm tra hộp thư thử trên máy chủ. Chưa gửi email thật.</p>${back('Quay lại đăng nhập')}`);
    });
}
async function reset(){
    const token=new URLSearchParams(location.hash.slice(1)).get('token')||new URLSearchParams(location.search).get('token');
    // Không giữ token trên URL sau khi đọc; tránh lộ qua referrer và lịch sử trình duyệt.
    history.replaceState(null,'',location.pathname);
    try { await api('/api/auth/kiem-tra-lien-ket',{token}); }
    catch(e){render('Tạo mật khẩu mới',`<p>${esc(e.message)}</p><p class="auth-link"><a href="quen-mat-khau.html">Gửi yêu cầu mới</a></p>`);return;}
    render('Tạo mật khẩu mới',`<form id="form" novalidate>${passField('matKhau','Mật khẩu mới',passHint)}${passField('xacNhan','Nhập lại mật khẩu mới')}${primary('Đặt lại mật khẩu')}</form>`);
    bind(async d=>{
        validatePass(d.matKhau,d.xacNhan,true);
        await api('/api/auth/dat-lai-mat-khau',{token,matKhauMoi:d.matKhau,xacNhan:d.xacNhan});
        toLogin('','Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
    });
}
function register(){
    render('Đăng ký',`<p class="intro muted">Trở thành thành viên của MegaCine.</p><form id="form" novalidate>${field('hoTen','Họ và tên','text','','maxlength="100" autocomplete="name"')}${field('email','Email','email','','autocomplete="email"')}<div class="field"><label for="soDienThoai">Số điện thoại<span class="required-mark" aria-hidden="true"> *</span></label><input id="soDienThoai" name="soDienThoai" type="tel" autocomplete="tel" inputmode="numeric" required><small>Nhập 10 chữ số bắt đầu bằng 0.</small></div>${field('tenDangNhap','Tên đăng nhập','text',userHint,'autocomplete="username"')}${passField('matKhau','Mật khẩu','Ít nhất 8 ký tự. Nên dùng cụm từ dễ nhớ.')}${passField('xacNhan','Nhập lại mật khẩu')}${primary('Đăng ký')}</form><p class="auth-link">${internalRegistration?'<a href="khach-hang.html">← Quay lại danh sách khách hàng</a>':'Đã có tài khoản? <a href="login.html"><strong>Đăng nhập</strong></a>'}</p>`);
    bind(async d=>{
        if(!d.hoTen.trim()||Array.from(d.hoTen.trim()).length>100)invalidField('hoTen','Vui lòng nhập họ và tên, tối đa 100 ký tự.');
        if(!emailOk(d.email.trim()))invalidField('email','Email không hợp lệ.');
        if(!d.soDienThoai.trim())invalidField('soDienThoai','Vui lòng nhập số điện thoại.');
        if(!/^0[0-9]{9}$/.test(d.soDienThoai.trim()))invalidField('soDienThoai','Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.');
        if(!userOk(d.tenDangNhap))invalidField('tenDangNhap','Tên đăng nhập không hợp lệ.');
        validatePass(d.matKhau,d.xacNhan,false);
        await api('/api/auth/dang-ky',{...d,hoTen:d.hoTen.trim(),email:d.email.trim(),soDienThoai:d.soDienThoai.trim(),noiBo:internalRegistration});
        render('Đăng ký thành công',`<p>Đăng ký thành viên thành công.</p><p class="auth-link"><a class="btn primary" href="${internalRegistration?'khach-hang.html':'login.html'}">${internalRegistration?'Quay lại danh sách':'Đăng nhập'}</a></p><p class="auth-link"><a href="dang-ky.html${internalRegistration?'?noiBo=1':''}">Đăng ký tài khoản khác</a></p>`);
    });
}
function change(){
    render('Đổi mật khẩu',`<p class="intro muted">Cập nhật mật khẩu cho tài khoản của bạn.</p><form id="form" novalidate>${passField('hienTai','Mật khẩu hiện tại','','current-password')}${passField('matKhau','Mật khẩu mới','Ít nhất 8 ký tự. Nên dùng cụm từ dễ nhớ.')}${passField('xacNhan','Nhập lại mật khẩu mới')}${primary('Đổi mật khẩu')}</form><p class="auth-link"><a href="${user.vaiTro==='KHACH_HANG'?'./':'noi-bo.html'}">← Quay lại</a></p>`);
    bind(async d=>{
        if(!d.hienTai)invalidField('hienTai','Vui lòng nhập mật khẩu hiện tại.');
        validatePass(d.matKhau,d.xacNhan,true);
        if(d.hienTai===d.matKhau)invalidField('matKhau','Mật khẩu mới phải khác mật khẩu hiện tại.');
        await api('/api/auth/toi/doi-mat-khau',{hienTai:d.hienTai,matKhauMoi:d.matKhau,xacNhan:d.xacNhan});
        toLogin(user.tenDangNhap,'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
    });
}
function validatePass(p,c,moi=false){
    const ten=moi?'Mật khẩu mới':'Mật khẩu',nhap=moi?'mật khẩu mới':'mật khẩu';
    if(!p)invalidField('matKhau','Vui lòng nhập '+nhap+'.');
    if(!p.trim())invalidField('matKhau',ten+' không được chỉ chứa khoảng trắng.');
    if(p.includes('\0'))invalidField('matKhau',ten+' chứa ký tự không hợp lệ.');
    if([...p].length<8)invalidField('matKhau',ten+' phải có ít nhất 8 ký tự.');
    if(new TextEncoder().encode(p).length>72)invalidField('matKhau',ten+' quá dài. Vui lòng nhập mật khẩu ngắn hơn.');
    if(!c)invalidField('xacNhan','Vui lòng nhập lại '+nhap+'.');
    if(p!==c)invalidField('xacNhan','Mật khẩu nhập lại không khớp với '+nhap+'.');
}
function toLogin(email,msg){Object.keys(sessionStorage).filter(k=>k.startsWith('cinema.profile.')||k.startsWith('cinema.mock.')).forEach(k=>sessionStorage.removeItem(k));sessionStorage.setItem('cinema.auth.prefill',email);sessionStorage.setItem('cinema.auth.message',msg);location.replace('login.html');}
init().catch(e=>render('Không thể tải giao diện',`<p>${esc(e.message)}</p>`));
