function formatData(DBdate){
    const date = new Date(DBdate);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function initializeDataTables() {
    $('.table').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Korean.json"
        },
        pageLength: 5,
        lengthMenu: [[5, 10, 15], [5, 10, 15]],
        order: [[0, 'desc']]
    });
}

async function getCreateClubApplicationListData(){
    try {
        const response = await fetch('/api/create/club/list/admin/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();

        fillTableWithData(data.CreateClubList);
        initializeDataTables();
    } catch (error) {
        alert(`동아리(모음) 신청서를 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function fillTableWithData(data) {
    // 상태별로 데이터 필터링
    const pendingData = data.filter(item => item.application_status === '대기 중');
    const approvedData = data.filter(item => item.application_status === '승인됨');
    const rejectedData = data.filter(item => item.application_status === '거절됨');

    // 각 탭에 데이터 채우기
    fillTable('#pending tbody', pendingData);
    fillTable('#approved tbody', approvedData);
    fillTable('#rejected tbody', rejectedData);
}

function fillTable(selector, data) {
    const tbody = document.querySelector(selector);
    tbody.innerHTML = ''; // 기존 내용을 비웁니다.

    data.forEach((item, index) => {
        const badgeClass = getBadgeClass(item.application_status);
        const processedDate = item.processed_date ? formatData(item.processed_date) : '-';
        const row = `
            <tr onclick=viewClubDetailModal(${item.club_application_id})>
                <td>${index + 1}</td>
                <td>${item.club_application_id}</td>
                <td>${item.user_name}</td>
                <td>${item.club_name}</td>
                <td>${item.affilition}</td>
                <td><span class="badge ${badgeClass}">${item.application_status}</span></td> <!-- 여기에 뱃지 적용 -->
                <td>${formatData(item.application_date)}</td>
                <td>${processedDate}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

async function viewClubDetailModal(clubApplicationId){
    const resData = await getCreateClubApplicationData(clubApplicationId)
    let clubModal = new bootstrap.Modal(document.getElementById('clubModal'));

    fillModalWithRowData(resData.CreateClubData);
    clubModal.show();
}

function fillModalWithRowData(data) {
    const badgeClass = getBadgeClass(data.application_status);
    const statusElement = document.getElementById('modalApplicationStatus');
    statusElement.className = '';
    statusElement.classList.add('badge', badgeClass);
    const processedDate = data.processed_date ? formatData(data.processed_date) : '-';
    
    setDisplayBtn(data);

    document.getElementById('clubModalLabel').textContent = `신청서 고유 번호: ${data.club_application_id}`;
    document.getElementById('modalClubName').textContent = `클럽 이름: ${data.club_name}`;
    document.getElementById('modalAffiliation').textContent = `소속: ${data.affilition}`;
    document.getElementById('modalApplicationDate').textContent = `신청 날짜: ${formatData(data.application_date)}`;
    document.getElementById('modalApplicationProcessedDate').textContent = `처리 날짜: ${(processedDate)}`;
    statusElement.textContent = `신청 상태: ${data.application_status}`;
    document.getElementById('modalMemberCount').textContent = `회원 수: ${data.member_count}`;
    const clubContentFromDB = data.club_content;
    const clubContentHTML = clubContentFromDB.replace(/\n/g, '<br>');
    document.getElementById('modalClubContent').innerHTML = clubContentHTML;
}

function setDisplayBtn(data){
    const applicationStatus = data.application_status;
    const approveBtn = document.getElementById('approveButton');
    const rejectBtn = document.getElementById('rejectButton');
    const editBtn = document.getElementById('editButton');

    const clubApplicationId = data.club_application_id;
    switch (applicationStatus) {
        case '대기 중':
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'block';
            approveBtn.setAttribute('data-application-id', clubApplicationId);
            rejectBtn.setAttribute('data-application-id', clubApplicationId);
            editBtn.setAttribute('data-application-id', clubApplicationId);
            
            return;
        case '거절됨':
        case '승인됨':
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            editBtn.setAttribute('data-application-id', clubApplicationId);
            break;
        default:
            break;
    }
}

document.getElementById('approveButton').addEventListener('click', async () => {
    const approveBtn = document.getElementById('approveButton');
    const applicationId = approveBtn.dataset.applicationId;
    await updateStatus(applicationId, "승인됨");
})

document.getElementById('rejectButton').addEventListener('click', async () => {
    const rejectBtn = document.getElementById('rejectButton');
    const applicationId = rejectBtn.dataset.applicationId;
    await updateStatus(applicationId, "거절됨");
})

document.getElementById('editButton').addEventListener('click', async () => {
    var editModal = new bootstrap.Modal(document.getElementById('editModal'), {});
    editModal.show();

    const editBtn = document.getElementById('editButton');
    const applicationId = editBtn.dataset.applicationId;

    const editSaveBtn = document.getElementById('editSaveBtn');
    editSaveBtn.setAttribute('data-application-id', applicationId);

    const resData = await getCreateClubApplicationData(applicationId)
    fillEditModalWithRowData(resData.CreateClubData);
})

document.getElementById('editSaveBtn').addEventListener('click', async () => {
    const editSaveBtn = document.getElementById('editSaveBtn');
    const applicationId = editSaveBtn.dataset.applicationId;

    const editApplicationData = getEditApplicationData();
    editApplicationData.club_application_id = applicationId;
    await saveEditApplication(editApplicationData);
})

function fillEditModalWithRowData(data) {
    // 신청 상태에 따른 badgeClass 설정 및 텍스트 설정
    const badgeClass = getBadgeClass(data.application_status);
    const applicationStatusText = document.getElementById('applicationStatusText');
    applicationStatusText.className = '';
    applicationStatusText.classList.add('badge', badgeClass);
    applicationStatusText.textContent = data.application_status || '-';
    
    // 신청 날짜 및 처리 날짜 텍스트 설정
    document.getElementById('applicationDateText').textContent = data.application_date ? formatData(data.application_date) : '-';
    document.getElementById('processedDateText').textContent = data.processed_date ? formatData(data.processed_date) : '-';

    // 수정 가능한 입력 필드들에 데이터 할당
    document.getElementById('clubNameInput').value = data.club_name || '';
    document.getElementById('memberCountInput').value = data.member_count || '';
    document.getElementById('affiliationInput').value = data.affilition || '';
    document.getElementById('userPhoneInput').value = data.user_ph_number || '';
    document.getElementById('clubContentInput').value = data.club_content || '';

    document.getElementById('userIdText').textContent = data.user_id || '-';
    document.getElementById('userNameText').textContent = data.user_name || '-';
}

async function updateStatus(applicationId, status){
    try {
        const response = await fetch('/api/create/club/application/data/status/put', {
            method:'PUT',
            body: JSON.stringify({applicationId, status}),
            headers: {
                'Content-Type':'application/json',
            },
        })
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        if(!data.success){
            throw new Error(`동아리 상태 처리에 실패하였습니다.`);
        }
        alert(`처리되었습니다.`);
        window.location.reload();
    } catch (error) {
        alert(`동아리 신청서의 신청 상태를 변경하던중 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

async function saveEditApplication(editApplicationData){
    try {
        const response = await fetch('/api/create/club/application/data/edit/save', {
            method:'PUT',
            body: JSON.stringify({editApplicationData}),
            headers: {
                'Content-Type':'application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        alert(`동아리 등록 신청서 수정후 저장이 처리되었습니다!`);
        window.location.reload();
    } catch (error) {
        alert(`동아리 신청서를 수정하고 저장하는중에 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function getEditApplicationData(){
    const editInputApplicationData = {};

    editInputApplicationData.club_name = document.getElementById('clubNameInput').value;
    editInputApplicationData.member_count = document.getElementById('memberCountInput').value;
    editInputApplicationData.affilition = document.getElementById('affiliationInput').value;
    editInputApplicationData.user_ph_number = document.getElementById('userPhoneInput').value;
    editInputApplicationData.club_content = document.getElementById('clubContentInput').value;

    return editInputApplicationData;
}

//application_id에 해당하는 한개의 row를 가져옴.
async function getCreateClubApplicationData(clubApplicationId){
    try {
        const response = await fetch('/api/create/club/application/data/get',{
            method:'POST',
            body: JSON.stringify({clubApplicationId}),
            headers: {
                'Content-Type':'application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        alert(`동아리 신청서 세부데이터를 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

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

document.addEventListener('DOMContentLoaded', async () => {
    await getCreateClubApplicationListData();
})