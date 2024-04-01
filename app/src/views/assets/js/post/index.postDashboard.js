function extractTextFromDelta(delta) {
    return delta.ops.map(op => op.insert.trim()).join('');
}

function createCard(data) {
    const textContent = extractTextFromDelta(data.content);

    const cardContainer = document.getElementById("card-container");

    const cardCol = document.createElement("div");
    cardCol.classList.add("col");
    cardCol.setAttribute('id', `post_number-${data.post_number}`); // 고유한 ID 할당

    const card = document.createElement("div");
    card.classList.add("card", "clickable-card", "team-card");
    card.style.maxWidth = "540px";

    // 작성일과 마감일 표시
    const createDay = new Date(data.create_day).toLocaleDateString();
    const deadDay = new Date(data.dead_day).toLocaleDateString();

    const cardContent = `
        <div class="row g-0">
        <a href="/view-current-recruit-post?query=${data.post_number}">
            <div class="col-md-4">
                <img src="assets/img/card.jpg" class="img-fluid rounded-start">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title mb-3">${data.club_name}</h5>
                    <h6 class="card-subtitle mb-3 text-muted">${data.title}</h6>
                    <p class="card-text mb-2"><strong>모집인원:</strong> ${data.recruit_num}명</p>
                    <p class="card-text mb-2"><strong>게시일:</strong> ${createDay}</p>
                    <p class="card-text mb-2"><strong>모집 종료일:</strong> ${deadDay}</p>
                    <p class="card-text text-truncate">${textContent}</p>
                    <span class="badge bg-secondary position-absolute top-0 end-0">게시글 번호: ${data.post_number}</span>
                </div>
            </div>
            </a>
        </div>
    `;

    card.innerHTML = cardContent;
    cardCol.appendChild(card);
    cardContainer.appendChild(cardCol);
}

function setRecruitPostDashboard() {
    fetch('/api/recruitPostDashboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                return createNoResultMessage(`작성된 게시글이 없습니다.`);
            }
            data.postData.reverse().forEach(createCard);
        });
}

document.addEventListener('DOMContentLoaded', setRecruitPostDashboard);