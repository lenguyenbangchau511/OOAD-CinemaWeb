import {$,icon,esc,brand,footer,account,bindLogout,notice,api,current,goLogin,safeReturn,emailOk,userOk,passOk,field,passField,passHint,userHint,bindEyes,demoEmails,clearFormErrors,formError,invalidField} from './cinema-ui.js';

const screen=document.body.dataset.screen;
const primary=t=>`<button class="btn primary" type="submit">${t}</button>`;
const back=t=>`<p class="auth-link"><a href="login.html">← ${t}</a></p>`;
const demo='<p class="muted" style="margin-top:12px">Giao diện mẫu · Không thay đổi dữ liệu thật.</p>';
let user=null;
const internalRegistration=screen==='register'&&new URLSearchParams(location.search).get('noiBo')==='1';
footer();
async function init(){
    if(screen==='change'||internalRegistration){
        try{user=await current();}catch(e){if(e.status===401)goLogin();else render('Không thể tải dữ liệu',`<p>${esc(e.message)}</p>`);return;}
    }
    if(internalRegistration&&!['QUAN_LY','NHAN_VIEN'].includes(user?.vaiTro)){location.replace('dang-ky.html');return;}
    $('#header').innerHTML=brand(false)+(user?account(user):'<a class="btn" href="login.html">Đăng nhập</a>');
    bindLogout();
    ({login,forgot,reset,register,change})[screen]();
}
function render(title,body){
    const art=['register','change'].includes(screen)?'auth-clapper.svg':'auth-ticket.svg';
    $('#main').innerHTML=`<section class="card auth-card"><h1>${title}</h1><div id="notice" class="notice" role="status" aria-live="polite" hidden></div>${body}</section><aside class="auth-art"><img src="images/${art}" alt=""><h2>Trọn vẹn từng khoảnh khắc</h2><p class="muted">Khám phá phim hay, đặt vé dễ dàng.</p></aside>`;
    $('#main').removeAttribute('aria-busy');bindEyes();
}
function bind(fn){$('#form').addEventListener('input',e=>{clearFormErrors(e.currentTarget);notice($('#notice'));});$('#form').addEventListener('submit',async e=>{
    e.preventDefault();clearFormErrors(e.target);notice($('#notice'));const b=e.submitter||$('#form button[type=submit]');b.disabled=true;
    try{await fn(Object.fromEntries(new FormData(e.target)));}catch(err){notice($('#notice'),err.message);formError(e.target,err,{'Email':'email','Tên đăng nhập':'tenDangNhap','Số điện thoại':'soDienThoai','Mật khẩu hiện tại':'hienTai'});}finally{b.disabled=false;}
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
function forgot(){
    render('Quên mật khẩu',`<p class="intro muted">Nhập email đã đăng ký, MegaCine sẽ gửi liên kết đặt lại mật khẩu.</p><form id="form" novalidate>${field('email','Email đã đăng ký','email','','autocomplete="email" placeholder="Nhập địa chỉ email"')}${primary('Gửi liên kết đặt lại')}</form>${back('Quay lại đăng nhập')}${demo}`);
    bind(d=>{
        const email=d.email.trim().toLowerCase();
        if(!emailOk(email))invalidField('email','Vui lòng nhập địa chỉ email hợp lệ.');
        if(!demoEmails.includes(email))invalidField('email','Email không hợp lệ hoặc chưa đăng ký trong dữ liệu mô phỏng.');
        const token=crypto.randomUUID();
        sessionStorage.setItem('cinema.auth.reset',JSON.stringify({email,token,expires:Date.now()+15*60*1000}));
        render('Khôi phục mật khẩu',`<p>Yêu cầu phục hồi mật khẩu của bạn đã được thực hiện. Hãy kiểm tra email đăng ký và làm theo hướng dẫn.</p><p class="auth-link"><small>Demo: không gửi email thật.</small><br><a href="dat-lai-mat-khau.html?token=${encodeURIComponent(token)}">Mở liên kết email mô phỏng</a></p>`);
    });
}
function reset(){
    let data;try{data=JSON.parse(sessionStorage.getItem('cinema.auth.reset'));}catch{}
    const token=new URLSearchParams(location.search).get('token');
    if(!data||!token||data.token!==token||Date.now()>data.expires){render('Tạo mật khẩu mới','<p>Liên kết không còn hiệu lực.</p><p class="auth-link"><a href="quen-mat-khau.html">Gửi yêu cầu mới</a></p>');return;}
    render('Tạo mật khẩu mới',`<form id="form" novalidate>${passField('matKhau','Mật khẩu mới',passHint)}${passField('xacNhan','Nhập lại mật khẩu mới')}${primary('Đặt lại mật khẩu')}</form>${demo}`);
    bind(d=>{
        const fresh=JSON.parse(sessionStorage.getItem('cinema.auth.reset')||'null');
        if(!fresh||fresh.token!==token||Date.now()>fresh.expires)throw Error('Liên kết không còn hiệu lực. Vui lòng gửi yêu cầu mới.');
        validatePass(d.matKhau,d.xacNhan);sessionStorage.removeItem('cinema.auth.reset');
        toLogin(data.email,'Đặt lại mật khẩu thành công (mô phỏng). Mật khẩu thật không thay đổi.');
    });
}
function register(){
    render('Đăng ký',`<p class="intro muted">Trở thành thành viên của MegaCine.</p><form id="form" novalidate>${field('hoTen','Họ và tên','text','','maxlength="100" autocomplete="name"')}${field('email','Email','email','','autocomplete="email"')}<div class="field"><label for="soDienThoai">Số điện thoại (không bắt buộc)</label><input id="soDienThoai" name="soDienThoai" type="tel" autocomplete="tel" inputmode="numeric"><small>Nếu nhập, dùng 10 chữ số bắt đầu bằng 0.</small></div>${field('tenDangNhap','Tên đăng nhập','text',userHint,'autocomplete="username"')}${passField('matKhau','Mật khẩu',passHint)}${passField('xacNhan','Nhập lại mật khẩu')}${primary('Đăng ký')}</form><p class="auth-link">${internalRegistration?'<a href="khach-hang.html">← Quay lại danh sách khách hàng</a>':'Đã có tài khoản? <a href="login.html"><strong>Đăng nhập</strong></a>'}</p>${demo}`);
    bind(async d=>{
        if(!d.hoTen.trim()||Array.from(d.hoTen.trim()).length>100)invalidField('hoTen','Vui lòng nhập họ và tên, tối đa 100 ký tự.');
        if(!emailOk(d.email.trim()))invalidField('email','Email không hợp lệ.');
        if(d.soDienThoai.trim()&&!/^0[0-9]{9}$/.test(d.soDienThoai.trim()))invalidField('soDienThoai','Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.');
        if(!userOk(d.tenDangNhap))invalidField('tenDangNhap','Tên đăng nhập không hợp lệ.');
        validatePass(d.matKhau,d.xacNhan);
        await api('/api/auth/kiem-tra-dang-ky',{email:d.email.trim(),tenDangNhap:d.tenDangNhap,soDienThoai:d.soDienThoai.trim()});
        render('Đăng ký thành công',`<p>Đăng ký thành viên thành công (mô phỏng). Tài khoản chưa được lưu vào CSDL.</p><p class="auth-link"><a class="btn primary" href="${internalRegistration?'khach-hang.html':'login.html'}">${internalRegistration?'Quay lại danh sách':'Đăng nhập'}</a></p><p class="auth-link"><a href="dang-ky.html${internalRegistration?'?noiBo=1':''}">Đăng ký tài khoản khác</a></p>`);
    });
}
function change(){
    render('Đổi mật khẩu',`<p class="intro muted">Cập nhật mật khẩu cho tài khoản của bạn.</p><form id="form" novalidate>${passField('hienTai','Mật khẩu hiện tại','','current-password')}${passField('matKhau','Mật khẩu mới',passHint)}${passField('xacNhan','Nhập lại mật khẩu mới')}${primary('Đổi mật khẩu')}</form><p class="auth-link"><a href="${user.vaiTro==='KHACH_HANG'?'./':'noi-bo.html'}">← Quay lại</a></p>${demo}`);
    bind(async d=>{
        if(!d.hienTai)invalidField('hienTai','Vui lòng nhập mật khẩu hiện tại.');
        validatePass(d.matKhau,d.xacNhan);
        if(d.hienTai===d.matKhau)invalidField('matKhau','Mật khẩu mới phải khác mật khẩu hiện tại.');
        await api('/api/auth/toi/kiem-tra-mat-khau',{hienTai:d.hienTai});$('#form').reset();notice($('#notice'),'Đổi mật khẩu thành công (mô phỏng). Mật khẩu thật không thay đổi.','success');
    });
}
function validatePass(p,c){if(!passOk(p))invalidField('matKhau','Mật khẩu phải có từ 8 đến 128 ký tự.');if(p!==c)invalidField('xacNhan','Hai lần nhập mật khẩu không khớp.');}
function toLogin(email,msg){sessionStorage.setItem('cinema.auth.prefill',email);sessionStorage.setItem('cinema.auth.message',msg);location.replace('login.html');}
init().catch(e=>render('Không thể tải giao diện',`<p>${esc(e.message)}</p>`));
