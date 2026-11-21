const films = [
    {
        name: "Ma Mút Con Vượt Kỷ Băng Hà", rating: "P", genre: "Hoạt hình", minutes: 90, tab: "now",
        tones: ["#eef8fa", "#b9dce8"],
        description: "Tỉnh dậy sau hàng nghìn năm, chú ma mút Fluffy lên đường tìm mẹ cùng một chú chim nhỏ mơ làm rapper."
    },
    {
        name: "Godzilla Trừ Không", rating: "T16", genre: "Khoa học viễn tưởng", minutes: 135, tab: "now",
        tones: ["#eeeaf3", "#cec3dc"],
        poster: "https://images.squarespace-cdn.com/content/v1/5bbcad0f2727be3646b9fee1/23b248aa-b236-4ecd-a1af-e926ea528e81/IMG_1910.jpeg",
        description: "Khi Nhật Bản đang tái thiết sau chiến tranh, sự trở lại của Godzilla đe dọa nền hòa bình vừa được khôi phục."
    },
    {
        name: "Trại Giam Hạnh Phúc", rating: "T16", genre: "Hài, Tâm lý", minutes: 127, tab: "now",
        tones: ["#f5f5df", "#dbe2be"],
        poster: "https://cdn.cinenjoy.com/cinematimes/posters/69cad2ba0e4f4.jpg",
        description: "Một thầy giáo nhận tội thay để bảo vệ em gái. Trong tù, lòng tốt của anh dần thay đổi những người xung quanh."
    },
    {
        name: "Chị Chị Em Em 3", rating: "T18", genre: "Tâm lý, Tình cảm", minutes: 122, tab: "now",
        tones: ["#f8edda", "#e5cda5"],
        poster: "https://cdn.moveek.com/storage/media/cache/mini/6ab3c75a0c379466815413.webp",
        description: "Ở vùng Kinh Bắc xưa, Thị Mầu vướng vào những mối tình đan xen, nơi mỗi lựa chọn đều có thể làm lung lay danh dự."
    },
    {
        name: "Bắt Cá Ba Tay", rating: "T13", genre: "Hài, Tình cảm", minutes: 100, tab: "soon",
        tones: ["#fff0e5", "#efc7b9"],
        description: 'Trong BẮT CÁ BA TAY, sau một lần cầu duyên, Yên (Thúy Ngân) bất ngờ chứng kiến cả ba người yêu cũ là Tùng (Steven Nguyễn), Phong (Ngô Kiến Huy) và Minh (Otis) đồng loạt muốn nối lại tình xưa. Đứng trước ba chàng trai với ba tính cách và ba màu sắc tình yêu khác biệt, Yên quyết định cho cả ba cơ hội cùng lúc. Nhưng khi những cuộc hẹn chồng chéo và bí mật dần có nguy cơ bị phanh phui, liệu cô nàng có thể tìm được tình yêu đích thực hay sẽ nhận về một cú "nghiệp quật" nhớ đời?'
    }
];

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector("#films");
const grid = document.querySelector(".film-grid");
const empty = document.querySelector(".empty");
const count = document.querySelector("#count");
const search = document.querySelector(".search");
const input = document.querySelector("#query");
const detail = document.querySelector("#detail");
const template = document.querySelector("#film-card");
let currentTab = "now";
let query = "";

function normalize(value) {
    return value.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").trim();
}

function movieMeta(film) {
    return `${film.genre} · ${film.minutes} phút`;
}

function showDetails(film) {
    document.querySelector("#detail-title").textContent = film.name;
    document.querySelector("#detail-meta").textContent = `${film.rating} · ${movieMeta(film)}`;
    document.querySelector("#detail-description").textContent = film.description;
    detail.showModal();
}

function createCard(film) {
    const card = template.content.cloneNode(true);
    const poster = card.querySelector(".poster");
    poster.style.setProperty("--poster-light", film.tones[0]);
    poster.style.setProperty("--poster-dark", film.tones[1]);
    poster.querySelector(".poster-fallback").textContent = film.name;
    if (film.poster) {
        const image = new Image();
        image.alt = `Poster phim ${film.name}`;
        image.hidden = true;
        image.addEventListener("load", () => { image.hidden = false; }, { once: true });
        image.addEventListener("error", () => image.remove(), { once: true });
        poster.insertBefore(image, poster.querySelector(".age"));
        image.src = film.poster;
    }
    card.querySelector(".age").textContent = film.rating;
    card.querySelector("h2").textContent = film.name;
    card.querySelector(".meta").textContent = movieMeta(film);
    const button = card.querySelector("button");
    button.setAttribute("aria-label", `Xem chi tiết ${film.name}`);
    button.addEventListener("click", () => showDetails(film));
    return card;
}

function render() {
    const visible = films.filter(film => film.tab === currentTab && normalize(film.name).includes(query));
    grid.replaceChildren(...visible.map(createCard));
    empty.hidden = visible.length > 0;
    count.textContent = `${visible.length} phim`;
}

function selectTab(tab) {
    currentTab = tab.id;
    for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", currentTab);
    render();
}

for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
        const destination = {
            ArrowRight: (index + 1) % tabs.length,
            ArrowLeft: (index + tabs.length - 1) % tabs.length,
            Home: 0,
            End: tabs.length - 1
        }[event.key];
        if (typeof destination !== "number") return;
        event.preventDefault();
        selectTab(tabs[destination]);
        tabs[destination].focus();
    });
}

search.addEventListener("submit", event => {
    event.preventDefault();
    query = normalize(input.value);
    render();
});

document.querySelector("#clear").addEventListener("click", () => {
    search.reset();
    query = "";
    render();
    input.focus();
});

render();
