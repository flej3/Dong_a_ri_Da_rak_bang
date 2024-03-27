//유저 카드 생성 함수.
function createCard(user) {
    const cardContainer = document.querySelector('.row');
    const cardCol = document.createElement('div');
    cardCol.classList.add('col-lg-4', 'mb-4');
    cardCol.innerHTML = `
        <div class="card team-card">
            <a href="#" class="card-link">
                <div class="row g-0">
                    <div class="col-md-4 d-flex align-items-center justify-content-center">
                        <img src="./../../assets/img/default-profile-img.png" class="img-fluid rounded-start">
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

function createNoResultMessage() {
    const main = document.getElementById('main');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('alert', 'alert-warning', 'text-center', 'mt-4', 'py-3');

    const icon = document.createElement('i');
    icon.classList.add('bi', 'bi-exclamation-triangle', 'me-2');

    const messageText = document.createElement('span');
    messageText.innerText = '검색 결과가 없습니다. 확인후 다시 검색해주세요.';

    messageContainer.appendChild(icon);
    messageContainer.appendChild(messageText);

    main.appendChild(messageContainer);
}

function searchUserResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
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
                //검색결과가 없습니다.
                createNoResultMessage();
            }
            const users = data.result;
            users.forEach(user => {
                createCard(user);
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