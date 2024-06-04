// 유저 카드 생성 함수.
function createCard(user, cardIndex) {
    const cardContainer = document.querySelector('.row');
    const cardCol = document.createElement('div');
    cardCol.classList.add('col-lg-4', 'mb-4');
    cardCol.setAttribute('id', `card-${cardIndex}`); // 고유한 ID 할당
    cardCol.innerHTML = `
        <div class="card team-card">
            <a href="search-user-profile?query=${user.user_id}" class="card-link">
                <div class="row g-0">
                    <div class="col-md-4 d-flex align-items-center justify-content-center">
                        <img src="${user.profile_img_route}" class="img-fluid rounded-start">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body pt-4">
                            <p class="card-text mb-1">이름: ${user.user_name}</p>
                            <p class="card-text mb-1">학과: ${user.user_department}</p>
                            <p class="card-text mb-1">학번: ${user.user_student_id}</p>
                            <p class="card-text mb-1">이메일: ${user.user_id}</p>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `;
    cardContainer.appendChild(cardCol);
}

function createNoResultMessage(msg) {
    const main = document.getElementById('main');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('alert', 'alert-warning', 'text-center', 'mt-4', 'py-3');

    const icon = document.createElement('i');
    icon.classList.add('bi', 'bi-exclamation-triangle', 'me-2');

    const messageText = document.createElement('span');
    messageText.innerText = `"${msg}" 라는 유저 검색결과가 없습니다.`;

    messageContainer.appendChild(icon);
    messageContainer.appendChild(messageText);

    main.appendChild(messageContainer);
}

function searchUserResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    document.getElementById('searchQueryResult').innerText = `검색 결과: ${searchQuery}`;
    fetch(`/search-user?query=${searchQuery}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                alert('에러가 발생했습니다.');
                window.location.href = "/";
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if(!data.success){
                createNoResultMessage(searchQuery);
                return;
            }
            data.results.forEach((user, index) => {
                createCard(user, index);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// 페이지가 로드될 때 searchUserResult 함수를 실행
document.addEventListener('DOMContentLoaded', function () {
    searchUserResult();
});