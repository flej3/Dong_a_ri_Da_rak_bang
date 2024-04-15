// 로그인 상태 확인 함수
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
        handleLoginError(err);
    }
}

// 가입신청 목록 가져오는 함수
async function getClubJoinApplications() {
    try {
        const response = await fetch('/api/clubApplications/list/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data.clubApplicationData;
    } catch (error) {
        handleClubApplicationsError(error);
    }
}

// 동아리 가입신청 목록을 테이블에 채우는 함수
function fillClubApplicationsTable(clubApplications) {
    const tableContainer = document.getElementById('clubApplicationsTable');
    tableContainer.innerHTML = ''; // 기존 테이블 삭제

    if (clubApplications.length === 0) {
        displayNoClubApplicationsMessage();
    } else {
        displayClubApplicationsTable(clubApplications);
    }
}

// 상태에 따라 배지 스타일을 지정하는 함수
function getStatusBadgeClass(status) {
    switch (status) {
        case '대기 중':
            return 'bg-warning';
        case '승인됨':
            return 'bg-success';
        case '거절됨':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// 로그인 에러 처리 함수
function handleLoginError(err) {
    alert("에러가 발생했습니다.");
    console.error(err);
    window.location.href = "/";
}

// 가입신청 목록 에러 처리 함수
function handleClubApplicationsError(error) {
    alert(`가입신청중인 동아리 목록을 가져오는데 실패했습니다. ${error}`);
    console.error("가입신청중인 동아리 목록을 가져오는데 실패했습니다.", error);
    window.location.reload();
}

// 가입신청이 없는 경우 메시지 표시 함수
async function displayNoClubApplicationsMessage() {
    const tableContainer = document.getElementById('clubApplicationsTable');
    const noApplicationsMessage = document.createElement('div');
    noApplicationsMessage.classList.add('alert', 'alert-info');
    noApplicationsMessage.textContent = '가입할 동아리가 없으시군요! 관심 있는 동아리를 찾아보고 지금 바로 가입하세요.';
    tableContainer.appendChild(noApplicationsMessage);

    // 로그인 상태에 따라 메시지 표시
    const isLogin = await checkLogin();
    if (!isLogin.isLogin) {
        displayLoginPromptMessage(tableContainer);
        return;
    }
}

// 로그인 프롬프트 메시지 표시 함수
function displayLoginPromptMessage(container) {
    const loginPromptMessage = document.createElement('div');
    loginPromptMessage.classList.add('alert', 'alert-info', 'mt-3');
    loginPromptMessage.innerHTML = `
        <p>동아리에 가입하려면 먼저 <a href="/pages-login">로그인</a>해주세요.</p>
    `;
    container.appendChild(loginPromptMessage);
}

function displayClubApplicationsTable(clubApplications) {
    const tableContainer = document.getElementById('clubApplicationsTable');
    tableContainer.innerHTML = ''; // 이전 테이블 내용을 비웁니다.

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'datatable'); // 부트스트랩 클래스 추가

    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th scope="col">#</th>
            <th scope="col">동아리 이름</th> 
            <th scope="col">동아리 대표</th> 
            <th scope="col">신청 날짜</th>
            <th scope="col">상태</th>
            <th scope="col">취소</th>
        </tr>
    `;
    table.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    clubApplications.forEach((application, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${application.application_id}</th>
            <td>${application.club_name}</td>
            <td>${application.club_owner}</td>
            <td>${application.create_day}</td>
            <td><span class="badge ${getStatusBadgeClass(application.status)}">${application.status}</span></td>
            <td>
                ${application.status === '대기 중' ? `<button type="button" class="btn btn-danger btn-sm" onclick="displayCancelApplicationModal(${application.application_id})">취소</button>` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);

    tableContainer.appendChild(table);

    // DataTables 적용
    $(table).DataTable({
        // DataTables 설정을 여기에 추가합니다.
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Korean.json"
        },
        pageLength: 5, // 기본 페이지당 표시되는 행의 수를 10으로 설정합니다.
        lengthMenu: [[5, 10, 15], [5, 10, 15]], // 사용자가 선택할 수 있는 페이지당 행의 수를 [5, 10, 15]로 설정합니다.
        order: [[0, 'desc']], // 첫 번째 열을 기준으로 내림차순 정렬합니다. 
    });
}

// 동아리 신청 취소 모달 띄우기.
function displayCancelApplicationModal(applicationId) {
    const modal = new bootstrap.Modal(document.getElementById('clubApplicationCancelModal'), {
        keyboard: false
    });
    const confirmBtn = document.getElementById('clubApplicationConfirmCancelBtn');
    confirmBtn.addEventListener('click', function() {
        cancelApplicationFetch(applicationId);
    });
    modal.show();
}

function cancelApplicationFetch(applicationId){
    fetch('/api/clubApplications/list/Cancel',{
        method: 'DELETE',
        body: JSON.stringify({applicationId}),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if(!res.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return res.json();
    })
    .then(data => {
        if(!data.success){
            throw new Error('동아리 신청 취소에 실패하였습니다.');
        }
        alert(`${applicationId}번 신청서에 대해서 취소하였습니다.`);
        window.location.reload();
    })
    .catch(err => {
        alert(`${applicationId}번 동아리 신청 취소중 에러가 발생했습니다.`);
        console.error(err);
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    const isLogin = await checkLogin();
    if (!isLogin.isLogin) {
        fillClubApplicationsTable([]);
    } else {
        const clubAppData = await getClubJoinApplications();
        fillClubApplicationsTable(clubAppData);
    }

    // 목록 접기/펼치기 버튼 이벤트 리스너 추가
    const toggleButton = document.getElementById('toggleButton');
    const tableContainer = document.getElementById('clubApplicationsTable');

    // 버튼 클릭 이벤트 리스너
    toggleButton.addEventListener('click', function() {
        if (tableContainer.classList.contains('show')) {
            // 목록이 펼쳐져 있는 경우
            tableContainer.classList.remove('show'); // 목록을 접음
            toggleButton.getElementsByClassName('buttonText')[0].textContent = '신청중인 동아리 목록 펼치기';
            toggleButton.getElementsByClassName('bi')[0].className = 'bi bi-chevron-down';
        } else {
            // 목록이 접혀 있는 경우
            tableContainer.classList.add('show'); // 목록을 펼침
            toggleButton.getElementsByClassName('buttonText')[0].textContent = '신청중인 동아리 목록 접기';
            toggleButton.getElementsByClassName('bi')[0].className = 'bi bi-chevron-up';
        }
    });
});
