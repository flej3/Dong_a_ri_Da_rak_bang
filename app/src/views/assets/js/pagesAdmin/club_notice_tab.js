document.addEventListener('click', async (event) => {
    if (event.target.matches('#clubNoticePostBtn')) {
        try {
            const response = await fetch("/api/club/owner/check", {
                method:'GET',
                headers: {
                    'Content-Type': 'Applicaion/json',
                },
            });
        
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
        
            const data = await response.json();
            if(!data.success){
                alert("동아리 회장(대표)만 공지사항을 작성할 수 있습니다.");
                return;
            }
            const modalElement = document.getElementById('writeNoticeModal');
            const myModal = new bootstrap.Modal(modalElement);
            myModal.show();
        } catch (error) {
            alert(`에러가 발생했습니다. ${error}`);
            console.error(`에러가 발생했습니다. ${error}`);
            window.location.reload();
        }
    }
});

document.getElementById('noticeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = {};
    notice.title = document.getElementById('noticeTitle').value;
    notice.content = document.getElementById('noticeContent').value;
    notice.category = getCategory();

    await saveNotilePost(notice);

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('writeNoticeModal'));
    modalInstance.hide();
})

function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');
    return category;
}

async function saveNotilePost(notice) {
    try {
        const response = await fetch("/api/club/notice/create/push", {
            method: 'POST',
            body: JSON.stringify(notice),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error('저장 실패');
        }
        alert(`공지사항을 저장 하였습니다!`);
        window.location.reload();
    } catch (error) {
        alert(`공지사항을 저장하던중 에러가 발생했습니다. ${error}`);
        console.error(`공지사항을 저장하던중 에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function createEmptyNoticeCard() {
    const container = document.getElementById('notice-cards-container');
    container.innerHTML = '';

    const emptyCard = document.createElement('div');
    emptyCard.className = 'card mb-3 shadow-lg p-3 mb-5 bg-body rounded border-primary border-2 animate__animated animate__fadeIn'; // animate.css 클래스 추가
    emptyCard.innerHTML = `
        <div class="card-body text-center">
            <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 2rem;"></i> <!-- 부트스트랩 아이콘 사용 -->
            <h5 class="card-title mt-3">공지사항이 없습니다.</h5>
            <p class="card-text">현재 해당 카테고리에 공지사항이 없습니다. 새로운 소식을 기대해주세요!</p>
        </div>
    `;
    container.appendChild(emptyCard);
}

async function getNoticePost() {
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/notice/post/get?query=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'Applicaion/json',
            },
        });

        if (!response.ok) {
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }

        const data = await response.json();
        if (data.noticeList.length === 0) {
            createEmptyNoticeCard();
            return ;
        } 
        addNoticeCards(data.noticeList);

    } catch (error) {
        alert(`공지사항을 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`공지사항을 가져오던중 에러가 발생했습니다. ${error}`);
        window.location.href = "/";
    }
}

function addNoticeCards(noticeList) {
    const container = document.getElementById('notice-cards-container');
    for (let idx = noticeList.length - 1; idx >= 0; idx--) {
        const notice = noticeList[idx];
        const createDay = notice.create_day.split('T')[0];
        const card = document.createElement('div');
        card.className = 'card mb-3 shadow-sm border-primary border-2 rounded team-card';
        card.id = `noticeNumber${notice.post_number}`;
        card.onclick = () => {
            getDetailNotice(notice.post_number);
        }
        card.innerHTML = `
            <div class="card-header bg-info text-white">#${idx+1} 공지사항</div>
            <div class="card-body bg-light">
                <h5 class="card-title">${notice.title}</h5>
                <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; width: 100%;">
                ${notice.content}
                </p>
            </div>
            <div class="card-footer bg-transparent">
            <small class="text-muted">작성자: ${notice.writer} | 작성날짜: ${createDay}</small>
            </div>
        `;
        container.appendChild(card);
    }
}

async function getDetailNoticeData(postNum){
    try {
        const response = await fetch(`/api/club/notice/detail/get?query=${postNum}`, {
            method:'GET',
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        fillDetailNoticeModal(data.noticeData[0]);
    } catch (error) {
        alert(`공지사항의 세부 정보를 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`공지사항의 세부 정보를 가져오던중 에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function fillDetailNoticeModal(noticeData){
    const createDay = noticeData.create_day.split('T')[0];
    const contentFromDB = noticeData.content;
    const contentHTML = contentFromDB.replace(/\n/g, '<br>');

    document.getElementById('noticeDetailModalLabel').innerText = `세부 공지 사항`;
    document.getElementById('detailNoticeTitle').innerText = `${noticeData.title}`;
    document.getElementById('detailNoticeAuthor').innerText = `${noticeData.writer}`;
    document.getElementById('detailNoticeDate').innerText = `${createDay}`;
    document.getElementById('detailNoticeContent').innerHTML = contentHTML;
}

async function getDetailNotice(noticeNum){
    await getDetailNoticeData(noticeNum);
    await hasAdminAc(noticeNum);
    const detailModal = new bootstrap.Modal(document.getElementById('noticeDetailModal'), {
        keyboard: false
    });
    detailModal.show();
}

document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'noticeEditBtn') {
        handleNoticeEditButtonClick();
        return;
    }
    if(event.target && event.target.id === 'noticeDeleteBtn') {
        handleNoticeDeleteButtonClick();
        return;
    }
});

function handleNoticeDeleteButtonClick() {
    const detailModalElement = document.getElementById('noticeDetailModal');
    const detailModal = bootstrap.Modal.getInstance(detailModalElement);
    const deleteNoticeModal = new bootstrap.Modal(document.getElementById('deleteNoticeModal'));

    detailModalElement.addEventListener('hidden.bs.modal', function onModalHidden() {
        deleteNoticeModal.show();
        detailModalElement.removeEventListener('hidden.bs.modal', onModalHidden);
    }, { once: true });

    detailModal.hide();

    const postNum = document.getElementById('noticeDeleteBtn').getAttribute('data-action-delete');
    const realDeleteNoticeBtn = document.getElementById('realDeleteBtn');
    realDeleteNoticeBtn.setAttribute('data-real-delete-action', postNum);
}

document.getElementById('realDeleteBtn').addEventListener('click', async () => {
    try {
        const postNum = document.getElementById('realDeleteBtn').getAttribute('data-real-delete-action');
        const response = await fetch('/api/club/notice/delete', {
            method:'DELETE',
            body:JSON.stringify({postNum}),
            headers: {
                'Content-Type':'Application/json',
            },
        });
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if(!data.success){
            throw new Error('공지 사항 삭제중 에러가 발생했습니다.');
        }
        alert('공지 사항을 삭제 하였습니다!');
        window.location.reload();
    } catch (error) {
        alert(`공지 사항 삭제중에 에러발생. ${error}`);
        console.error(`공지 사항 삭제중에 에러발생. ${error}`);
        // window.location.reload();
    }
})

function handleNoticeEditButtonClick() {
    const title = document.getElementById('detailNoticeTitle').innerText;
    const content = document.getElementById('detailNoticeContent').innerText;
    const postNum = document.getElementById('noticeEditBtn').getAttribute('data-action-edit');

    document.getElementById('editNoticeModalLabel').innerText = `공지 사항 수정`
    document.getElementById('editNoticeTitle').value = title;
    document.getElementById('editNoticeContent').value = content;

    const editNoticeSaveBtn = document.getElementById('editNoticeSaveBtn');
    editNoticeSaveBtn.setAttribute('data-postnum', postNum);

    const detailModalElement = document.getElementById('noticeDetailModal');
    const detailModal = bootstrap.Modal.getInstance(detailModalElement);
    const editModal = new bootstrap.Modal(document.getElementById('editNoticeModal'));

    detailModalElement.addEventListener('hidden.bs.modal', function onModalHidden() {
        editModal.show();
        detailModalElement.removeEventListener('hidden.bs.modal', onModalHidden);
    }, { once: true });

    detailModal.hide();
};

document.getElementById('editNoticeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const noticeData = {};
    noticeData.postNum = document.getElementById('editNoticeSaveBtn').getAttribute('data-postnum');
    noticeData.title = document.getElementById('editNoticeTitle').value;
    noticeData.content = document.getElementById('editNoticeContent').value;

    await updateNoticeData(noticeData);
})

async function updateNoticeData(noticeData){
    try {
        const response = await fetch('/api/club/notice/data/update', {
            method:'PUT',
            body: JSON.stringify(noticeData),
            headers: {
                'Content-Type': 'Application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        if(!data.success){
            throw new Error('공지 사항 수정중 에러발생.');
        }
        alert(`#${noticeData.postNum} 공지사항을 수정 하였습니다!`);
        window.location.reload();
    } catch (error) {
        alert(`공지 사항 수정중 에러발생. ${error}`);
        console.error(`공지 사항 수정중 에러발생. ${error}`);
        window.location.reload();
    }
}

async function hasAdminAc(noticeNum) {
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/adminAc/check/get?query=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();

        if (data.hasAdminAc) {
            const modalFooter = document.querySelector('#noticeDetailModal .modal-footer');

            if (!document.getElementById('noticeEditBtn')) {
                const editButton = document.createElement('button');
                editButton.type = 'button';
                editButton.className = 'btn btn-outline-primary';
                editButton.innerText = '수정';
                editButton.id = 'noticeEditBtn';
                editButton.setAttribute('data-action-edit', noticeNum);
                modalFooter.insertBefore(editButton, modalFooter.firstChild);
            }

            if (!document.getElementById('noticeDeleteBtn')) {
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-outline-danger';
                deleteButton.innerText = '삭제';
                deleteButton.id = 'noticeDeleteBtn';
                deleteButton.setAttribute('data-action-delete', noticeNum);
                modalFooter.insertBefore(deleteButton, modalFooter.firstChild);
            }
        }
    } catch (error) {
        alert(`권한자 여부를 체크중 에러발생. ${error}`);
        console.error(`권한자 여부를 체크중 에러발생. ${error}`);
        window.location.reload();
    }
}

//페이지 해당 카드 페이지 번호 출력.
document.addEventListener('DOMContentLoaded', async function () {
    await getNoticePost();
    const cardsContainer = document.getElementById('notice-cards-container');
    const pagination = document.getElementById('notice-pagination');
    const cardsPerPage = 5;
    let currentPage = 1;

    function setupPagination() {
        const cards = cardsContainer.getElementsByClassName('card');
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
        const cards = cardsContainer.getElementsByClassName('card');
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
});