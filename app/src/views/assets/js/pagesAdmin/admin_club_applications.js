function formatData(DBdate){
    const date = new Date(DBdate);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function initializeDataTables() {
    $('.club-application-table').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Korean.json"
        },
        pageLength: 5,
        lengthMenu: [[5, 10, 15], [5, 10, 15]],
        order: [[0, 'desc']]
    });
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

function fillTable(selector, data) {
    const tbody = document.querySelector(selector);
    tbody.innerHTML = ''; // 기존 내용을 비웁니다.

    data.forEach((item, index) => {
        const badgeClass = getBadgeClass(item.application_status);
        const processedDate = item.processed_date ? formatData(item.processed_date) : '-';
        const row = `
            <tr onclick=viewApplicationDetailModal(${item.application_id})>
                <td>${item.application_id}</td>
                <td>${item.user_name}</td>
                <td>${item.gender}</td>
                <td><span class="badge ${badgeClass}">${item.application_status}</span></td>
                <td>${formatData(item.application_date)}</td>
                <td>${processedDate}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function getClubApplicationList(isGetData){
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/application/list/get?query=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();

        if(isGetData){
            return data.clubApplicationList;
        }

        fillTableWithData(data.clubApplicationList);
        initializeDataTables();
    } catch (error) {
        alert(`가입 신청 현황을 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

async function viewApplicationDetailModal(applicationId){
    try {
        const resData = await getClubApplicationList(true);
        const applicationDetail = resData.find(app => app.application_id === applicationId);

        let clubModal = new bootstrap.Modal(document.getElementById('clubModal'));
        clubModal.show();
        fillModalWithRowData(applicationDetail);
    } catch (error) {
        alert(`해당 신청서의 세부 정보를 가져오던중 에러가 발생했습니다. ${error}`);
        console.error("해당하는 신청서 정보를 찾을 수 없습니다.");
    }
}

function setDisplayBtn(data){
    const applicationStatus = data.application_status;
    const approveBtn = document.getElementById('approveButton');
    const rejectBtn = document.getElementById('rejectButton');

    const clubApplicationId = data.application_id;
    switch (applicationStatus) {
        case '대기 중':
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'block';
            approveBtn.setAttribute('data-application-id', clubApplicationId);
            rejectBtn.setAttribute('data-application-id', clubApplicationId);
            break;
        case '거절됨':
        case '승인됨':
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            break;
        default:
            break;
    }
}

function fillModalWithRowData(data) {
    const badgeClass = getBadgeClass(data.application_status);
    const statusElement = document.getElementById('modalApplicationStatus');
    statusElement.className = '';
    statusElement.classList.add('badge', badgeClass);
    const processedDate = data.processed_date ? formatData(data.processed_date) : '-';
    
    setDisplayBtn(data);

    document.getElementById('modalApplicationID').textContent = data.application_id;
    statusElement.textContent = data.application_status;

    document.getElementById('modalUserID').textContent = data.user_id;
    document.getElementById('modalUserName').textContent = data.user_name;
    document.getElementById('modalStudentID').textContent = data.user_student_id;
    document.getElementById('modalDepartment').textContent = data.user_department;
    document.getElementById('modalPhone').textContent = data.user_ph_number;
    
    document.getElementById('modalGender').textContent = data.gender;
    document.getElementById('modalRegion').textContent = data.residence;
    document.getElementById('modalApplicationDate').textContent = formatData(data.application_date);
    document.getElementById('modalApplicationProcessedDate').textContent = processedDate;
    
    const introductionFromDB = data.introduction;
    const introductionHTML = introductionFromDB.replace(/\n/g, '<br>');
    document.getElementById('modalSelfIntroduction').innerHTML = introductionHTML;
}

document.getElementById('approveButton').addEventListener('click', async () => {
    const approveBtn = document.getElementById('approveButton');
    const applicationId = parseInt(approveBtn.dataset.applicationId, 10);

    const resData = await getClubApplicationList(true);
    const applicationDetail = resData.find(app => app.application_id === applicationId);

    await updateStatusDB(applicationDetail, '승인됨');
})

document.getElementById('rejectButton').addEventListener('click', async () => {
    const rejectBtn = document.getElementById('rejectButton');
    const applicationId = parseInt(rejectBtn.dataset.applicationId, 10);

    const resData = await getClubApplicationList(true);
    const applicationDetail = resData.find(app => app.application_id === applicationId);

    await updateStatusDB(applicationDetail, '거절됨');
})

async function updateStatusDB(applicationDetail, status){
    try {
        const response = await fetch('/api/club/application/update/status', {
            method: 'PUT',
            body: JSON.stringify({applicationDetail, status}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        if(data.isUserMember !== undefined && data.isUserMember){
            alert(`해당 유저는 이미 가입이 된 유저입니다. 거절 처리 되었습니다. (학번이 동일한 유저가 있습니다.)`);
        }
        if(data.success){
            window.location.reload();
        }
    } catch (error) {
        alert(`해당 신청서를 처리하는데 에러가 발생했습니다. ${error}`);
        console.error("해당 신청서를 처리하는데 에러가 발생했습니다.");
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getClubApplicationList();
})