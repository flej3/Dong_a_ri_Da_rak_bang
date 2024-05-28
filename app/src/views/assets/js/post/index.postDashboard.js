function extractTextFromDelta(delta) {
    return delta.ops.map(op => {
        if (typeof op.insert === 'string') {
            return op.insert.trim();
        } else if (typeof op.insert === 'object' && op.insert.image) {
            return "(사진)";
        } else {
            return ""; // 다른 데이터 형식에 대한 처리
        }
    }).join('');
}

function createCard(data) {
    const textContent = extractTextFromDelta(data.content);

    const cardContainer = document.getElementById("card-container");

    const cardCol = document.createElement("div");
    cardCol.classList.add("card-all", "col", "mb-4");
    cardCol.setAttribute('id', `post_number-${data.post_number}`);

    const card = document.createElement("div");
    card.classList.add("card", "clickable-card", "team-card", "shadow-sm");
    card.style.maxWidth = "540px";

    const createDay = new Date(data.create_day).toLocaleDateString();
    const deadDay = new Date(data.dead_day).toLocaleDateString();

    //마감일 계산
    const today = new Date();
    const deadline = new Date(data.dead_day);
    const timeDiff = deadline - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let deadlineBadge;
    if (daysDiff <= 0) {
        deadlineBadge = `<span class="badge bg-danger position-absolute custom-badge-position m-2">마감됨</span>`;
        closedList.push(data);
    } else {
        deadlineBadge = `<span class="badge bg-success position-absolute custom-badge-position m-2">D - ${daysDiff}</span>`;
        recruitingList.push(data);
    }

    const writer = `<span class="badge bg-secondary">작성자: ${data.writer}</span>`;

    const checkImg = isPostImg(data.image_route);
    const cardContent = `
        <div class="row g-0">
            <a href="/view-recruit-post?query=${data.post_number}" class="text-decoration-none">
                <div class="col-md-4">
                    <img src="${checkImg}" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title text-dark mb-2">${data.club_name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
                        <div class="mb-2">${writer}</div>
                        <p class="card-text mb-1"><strong>모집인원:</strong> ${data.recruit_num}명</p>
                        <p class="card-text mb-1"><strong>게시일:</strong> ${createDay}</p>
                        <p class="card-text mb-1"><strong>모집 종료일:</strong> ${deadDay}</p>
                        <p class="card-text mb-3 text-truncate">${textContent}</p>
                        <span class="badge bg-info position-absolute top-0 end-0 m-2">번호: ${data.post_number}</span>
                        ${deadlineBadge}
                    </div>
                </div>
       <div style="position: relative;">
        <div class="d-inline-flex align-items-center" id="heartSection" style="position: absolute; bottom: 0; right: 0;">
          <i class="fas fa-heart" style="margin-right: 5px;" id="first_${data.post_number}"></i>
            <span class="badge rounded-pill bg-secondary" style="font-size: 12px;">${data.like_count}</span>
        </div>
       </div>
            </a>
        </div>
    `;

    card.innerHTML = cardContent;
    cardCol.appendChild(card);
    cardContainer.appendChild(cardCol);
}

function createCardRecruiting(data) {
    const textContent = extractTextFromDelta(data.content);

    const cardContainer = document.getElementById("card-container-recruiting");

    const cardCol = document.createElement("div");
    cardCol.classList.add("card-all", "col", "mb-4");
    cardCol.setAttribute('id', `post_number-recruiting-${data.post_number}`);

    const card = document.createElement("div");
    card.classList.add("card", "clickable-card", "team-card", "shadow-sm");
    card.style.maxWidth = "540px";

    const createDay = new Date(data.create_day).toLocaleDateString();
    const deadDay = new Date(data.dead_day).toLocaleDateString();

    //마감일 계산
    const today = new Date();
    const deadline = new Date(data.dead_day);
    const timeDiff = deadline - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const deadlineBadge = `<span class="badge bg-success position-absolute custom-badge-position m-2">D - ${daysDiff}</span>`;

    const writer = `<span class="badge bg-secondary">작성자: ${data.writer}</span>`;

    const checkImg = isPostImg(data.image_route);
    const cardContent = `
        <div class="row g-0">
            <a href="/view-recruit-post?query=${data.post_number}" class="text-decoration-none">
                <div class="col-md-4">
                    <img src="${checkImg}" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title text-dark mb-2">${data.club_name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
                        <div class="mb-2">${writer}</div>
                        <p class="card-text mb-1"><strong>모집인원:</strong> ${data.recruit_num}명</p>
                        <p class="card-text mb-1"><strong>게시일:</strong> ${createDay}</p>
                        <p class="card-text mb-1"><strong>모집 종료일:</strong> ${deadDay}</p>
                        <p class="card-text mb-3 text-truncate">${textContent}</p>
                        <span class="badge bg-info position-absolute top-0 end-0 m-2">번호: ${data.post_number}</span>
                        ${deadlineBadge}
                    </div>
                </div>
                <div style="position: relative;">
                 <div class="d-inline-flex align-items-center" id="heartSection" style="position: absolute; bottom: 0; right: 0;">
                 <i class="fas fa-heart" style="margin-right: 5px;" id="recruiting_${data.post_number}"></i>
                 <span class="badge rounded-pill bg-secondary" style="font-size: 12px;">${data.like_count}</span>
                 </div>
                 </div>
            </a>
        </div>
    `;

    card.innerHTML = cardContent;
    cardCol.appendChild(card);
    cardContainer.appendChild(cardCol);
}

function isPostImg(url){
    if(!url){
        return "assets/img/card.jpg";
    }
    return url;
}

function createCardClosed(data) {
    const textContent = extractTextFromDelta(data.content);

    const cardContainer = document.getElementById("card-container-closed");

    const cardCol = document.createElement("div");
    cardCol.classList.add("card-all", "col", "mb-4");
    cardCol.setAttribute('id', `post_number-closed-${data.post_number}`);

    const card = document.createElement("div");
    card.classList.add("card", "clickable-card", "team-card", "shadow-sm");
    card.style.maxWidth = "540px";

    const createDay = new Date(data.create_day).toLocaleDateString();
    const deadDay = new Date(data.dead_day).toLocaleDateString();

    const deadlineBadge = `<span class="badge bg-danger position-absolute custom-badge-position m-2">마감됨</span>`;

    const writer = `<span class="badge bg-secondary">작성자: ${data.writer}</span>`;

    const checkImg = isPostImg(data.image_route);
    const cardContent = `
        <div class="row g-0">
            <a href="/view-recruit-post?query=${data.post_number}" class="text-decoration-none">
                <div class="col-md-4">
                    <img src="${checkImg}" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title text-dark mb-2">${data.club_name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
                        <div class="mb-2">${writer}</div>
                        <p class="card-text mb-1"><strong>모집인원:</strong> ${data.recruit_num}명</p>
                        <p class="card-text mb-1"><strong>게시일:</strong> ${createDay}</p>
                        <p class="card-text mb-1"><strong>모집 종료일:</strong> ${deadDay}</p>
                        <p class="card-text mb-3 text-truncate">${textContent}</p>
                        <span class="badge bg-info position-absolute top-0 end-0 m-2">번호: ${data.post_number}</span>
                        ${deadlineBadge}
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="d-inline-flex align-items-center" id="heartSection_${data.post_number}" style="position: absolute; bottom: 0; right: 0;">
                        <i class="fas fa-heart" style="margin-right: 5px;" id="dead_${data.post_number}"></i>
                        <span class="badge rounded-pill bg-secondary" style="font-size: 12px;">${data.like_count}</span>
                    </div>
                </div>
            </a>
        </div>
    `;

    card.innerHTML = cardContent;
    cardCol.appendChild(card);
    cardContainer.appendChild(cardCol);
}

async function setRecruitPostDashboard() {
    try {
        const response = await fetch('/api/recruitPostDashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if (!data.success) {
            return createNoResultMessage(`작성된 게시글이 없습니다.`);
        }
        data.postData.reverse().forEach(createCard);
    } catch (error) {
        alert('게시글을 불러오던 중 에러가 발생했습니다.');
        console.error(`에러발생 ${error}`);
    }
}

let activeTab = 'all';
let recruitingList = [];
let closedList = [];
document.addEventListener('DOMContentLoaded', async () => {
    await setRecruitPostDashboard();
    await showLikes();
    recruitingList.forEach(createCardRecruiting);
    closedList.forEach(createCardClosed);
    updatePagination();

    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', function () {
            activeTab = this.id.split('-')[0];
            updatePagination();
        });
    });
});

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    let cardsContainer = "";
    if (activeTab === 'all') {
        cardsContainer = document.getElementById('cards-container');
    } else if (activeTab === 'recruiting') {
        cardsContainer = document.getElementById('cards-container-recruiting');
    } else {
        cardsContainer = document.getElementById('cards-container-closed');
    }

    const cardsPerPage = 9;
    let currentPage = 1;

    function setupPagination() {
        const cards = cardsContainer.getElementsByClassName("card-all");
        const pageCount = Math.ceil(cards.length / cardsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = 'page-item';
            const a = document.createElement('a');
            a.href = '#';
            a.innerText = i;
            a.className = 'page-link';
            a.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                showPage(currentPage);
            });
            li.appendChild(a);
            pagination.appendChild(li);
        }

        showPage(currentPage);
    }

    function showPage(page) {
        const cards = cardsContainer.getElementsByClassName("card-all");
        const startIndex = (page - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;

        for (let i = 0; i < cards.length; i++) {
            if (i >= startIndex && i < endIndex) {
                cards[i].style.display = '';
            } else {
                cards[i].style.display = 'none';
            }
        }

        const paginationLinks = pagination.getElementsByClassName('page-link');
        Array.from(paginationLinks).forEach(link => {
            if (parseInt(link.textContent) === page) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
    }

    setupPagination();
}

async function showLikes() {
    const isLogin = await checkLogin();
    if (isLogin) {
        try {
            const response = await fetch(`/api/getLikes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            const data = await response.json();
            if (data) {
                await markLikedPosts('first');
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
        }
    }
}

async function checkLogin() {
    try {
        const response = await fetch('/isLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data;
    } catch (err) {
        alert("에러가 발생했습니다.");
        console.error(err);
        window.location.href = "/";
    }
}

async function markLikedPosts(prefix) {
    try {
        const response = await fetch(`/api/getLikeSplit`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        data.like.forEach(item => {
            let selectPostNumber = document.getElementById(`${prefix}_${item.post_number}`);
            if (selectPostNumber !== null) {
                selectPostNumber.style.color = 'red';
            }
        });
    } catch (error) {
        console.error('네트워크 오류:', error);
    }
}

async function checkLogin() {
    try {
        const response = await fetch('/isLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data.isLogin;
    } catch (err) {
        alert("에러가 발생했습니다.");
        console.error(err);
        window.location.href = "/";
    }
}

document.getElementById('closed-tab').addEventListener('click', async function() {
    const isLogin = await checkLogin();
    if(isLogin){
        await markLikedPosts('dead');
    }
});

document.getElementById('recruiting-tab').addEventListener('click', async function() {
    const isLogin = await checkLogin();
    if(isLogin){
        await markLikedPosts('recruiting');
    }
});