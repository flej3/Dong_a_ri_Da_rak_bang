function getBadgeClass(status) {
    switch (status) {
        case '대기 중':
            return 'bg-warning';
        case '거절됨':
            return 'bg-danger';
        case '승인됨':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

async function getCreateClubList() {
    try {
        const response = await fetch('/api/create/club/list/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        console.log(data);

        const listGroup = document.querySelector('#applicationListModal .list-group');
        listGroup.innerHTML = ''; 

        if (!data.hasClubList) {
            const noApplicationItem = document.createElement('li');
            noApplicationItem.classList.add('list-group-item', 'text-center');
            noApplicationItem.textContent = '등록 신청한 동아리가 없습니다.';
            listGroup.appendChild(noApplicationItem);
        } else {
            data.CreateClubList.forEach((club, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.setAttribute('data-bs-toggle', 'modal');
                listItem.setAttribute('data-bs-target', '#applicationDetailsModal');
                listItem.innerHTML = `#${club.club_application_id} ${club.club_name} 동아리(모임) 신청 <span class="badge ${getBadgeClass(club.application_status)}">${club.application_status}</span>`;
                listItem.onclick = () => {
                    updateModalDetails(club); 
                };
                listGroup.appendChild(listItem);
            });
        }
    } catch (error) {
        alert(`등록 신청한 동아리 리스트를 불러오던 중 오류가 발생했습니다. ${error}`);
        console.error(`등록 신청한 동아리 리스트를 불러오던 중 오류가 발생했습니다. ${error}`);
    }
}

function updateModalDetails(club) {
    console.log(club);
    const modalTitle = document.querySelector('#applicationDetailsModalLabel');
    modalTitle.textContent = `#${club.club_application_id} ${club.club_name} 등록 신청 상세 정보`;

    const statusBadge = document.querySelector('#applicationDetailsModal .modal-body .badge');
    statusBadge.className = 'badge'; // 기존 클래스 초기화
    // getBadgeClass 함수를 사용하여 클래스 추가
    statusBadge.classList.add(getBadgeClass(club.application_status));
    statusBadge.textContent = club.application_status;

    // 나머지 동아리 정보 업데이트
    document.querySelectorAll('#applicationDetailsModal .modal-body .row .col p')[0].textContent = `신청자: ${club.user_name}`;
    document.querySelectorAll('#applicationDetailsModal .modal-body .row .col p')[1].textContent = `연락처: ${club.user_ph_number}`;
    document.querySelectorAll('#applicationDetailsModal .modal-body .row .col p')[2].textContent = `동아리 이름: ${club.club_name}`;
    document.querySelectorAll('#applicationDetailsModal .modal-body .row .col p')[3].textContent = `동아리 소속: ${club.affilition}`;
    document.querySelector('#applicationDetailsModal .application-date').textContent = `신청 날짜: ${new Date(club.application_date).toLocaleDateString('ko-KR')}`;
    document.querySelector('#applicationDetailsModal .application-purpose').textContent = `신청 목적: ${club.club_content}`;

    // "신청 취소" 버튼의 표시 여부 결정
    const cancelButton = document.querySelector('#applicationDetailsModal .btn-danger');
    if (club.application_status === '대기 중') {
        cancelButton.style.display = '';
    } else {
        cancelButton.style.display = 'none';
    }

    // "신청 취소" 버튼에 클릭 이벤트 리스너 추가
    document.querySelector('#applicationDetailsModal .btn-danger').addEventListener('click', function() {
        // "신청 취소 확인" 모달의 "신청 취소" 버튼에 data-application-id 속성 설정
        document.getElementById('deleteCreateClubBtn').setAttribute('data-application-id', club.club_application_id);
    });
}

document.getElementById('deleteCreateClubBtn').addEventListener('click', function() {
    // "신청 취소" 버튼에서 data-application-id 속성을 통해 application_id 가져오기
    const applicationId = this.getAttribute('data-application-id');
    console.log('취소할 동아리의 application_id:', applicationId);

    // 취소 로직을 여기에 구현...
});

document.getElementById('viewCreateClubList').addEventListener('click', async () => {
    console.log('연결');
    await getCreateClubList();
});
