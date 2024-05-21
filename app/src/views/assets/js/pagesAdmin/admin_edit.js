document.addEventListener('DOMContentLoaded', async () => {
    pageSplit();
    paginate();
    await checkOwner();
})

const firstCheckValue = [];
const firstSpot = [];
function editListener() {
    showButtonOnHover();
    document.getElementById('hidden-btn').style.display = 'inline-block';
    let memberTable = document.getElementById('member-table');
    for (let i = 1; i <= memberTable.getElementsByTagName('tr').length-1; i++) {
        let row = memberTable.rows[i];
        let inputElementChecked = row.cells[6].querySelector('input');
        let checkValue = inputElementChecked.checked;
        firstCheckValue.push(checkValue);
        let temp = row.cells[5].querySelector('input');
        firstSpot.push(temp.getAttribute('placeholder'));
    }
    // "편집" 버튼 숨기기
    editButton.style.display = "none";
    // "저장" 버튼 보이기
    saveButton.style.display = "inline-block";
    // "추가" 버튼 보이기
    addButton.style.display = "inline-block";

    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        // checkbox 활성화
        checkbox.removeAttribute("disabled");
    });

    let allPositionTexts = document.querySelectorAll('[id^="position_text_"]');
    allPositionTexts.forEach(function(text) {
        text.style.display = 'none';
    });

    let allPositionInputs = document.querySelectorAll('[id^="position_input_"]');
    allPositionInputs.forEach(function(input) {
        input.style.display = 'inline-block';
        input.focus();
    });
}

let clickCount = 0; //add button count

    function addListener() {
        saveButton = document.getElementById('save-button');
        saveButton.disabled = true;
        document.getElementById('delete-button').style.display = "inline-block";
        clickCount++;
        let memberTable = document.getElementById('member-table');
        let rowCount = memberTable.getElementsByTagName('tr').length;
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <th scope="row">${rowCount}</th>
            <td><input type="text" class="member_name" style="width: 150px; height: 35px;" id="new_member_name_${rowCount + 1}"></td>
            <td><input type="text" class="member_student_id" style="width: 150px; height: 35px;" id="new_member_student_id_${rowCount + 1}" maxlength="9"></td>
            <td><input type="text" class="member_department" style="width: 150px; height: 35px;" id="new_member_department_${rowCount + 1}"></td>
            <td><input type="text" class="member_ph_number" style="width: 150px; height: 35px;" id="new_member_ph_number_${rowCount + 1}"></td>
            <td><input type="text" class="position" style="width: 60px; height: 30px;" id="new_member_position_${rowCount + 1}"></td>
            <td><input type="checkbox" class="admin_ac" id="new_member_admin_ac_${rowCount + 1}"></td>
        `;
        // 테이블에 위의 형식대로 새로운 행 추가
        let table = document.getElementById('member-table');
        table.appendChild(newRow);

        newRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateSaveButtonState);
        });
    }

function updateSaveButtonState() {
    saveButton = document.getElementById('save-button');
    saveButton.disabled = false;
    const inputs = document.querySelectorAll('.member_name, .member_student_id, .member_department, .member_ph_number, .position, .admin_ac');
    let allInputsFilled = true;
    inputs.forEach(function(input) {
        if (input.value.trim() === '') {
            allInputsFilled = false;
        }
    });
    saveButton.disabled = !allInputsFilled;
}

async function saveListener() {
    const studentIdList = document.querySelectorAll('#member-table #student-id-list');

    studentIdList.forEach(function (element) {
        element.style.backgroundColor = 'white';
    });

    const resultArr = checkStId();
    if (resultArr.length > 0) {
        alert('동일한 학번은 추가할 수 없습니다.');
        for (let i = 0; i < resultArr.length; i++) {
            const dup = document.querySelector(`#member-table tr:nth-child(${resultArr[i]}) td#student-id-list`);
            dup.style.backgroundColor = 'yellow';
        }
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('query');

        if (clickCount === 0 && updateDetect()) {  //기존 회원에 대한 변경만 있는 경우
            fetch(`/update-member?query=${category}`, {
                method: 'POST',
                body: JSON.stringify(updateTarget),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    alert('정보 변경에 성공하였습니다.');
                    window.location.reload();
                    saveButton.style.display = 'none'; // save 버튼 숨기기
                    addButton.style.display = 'none'; // add 버튼 숨기기
                    document.getElementById('edit-button').style.display = 'inline-block'; // 편집 버튼 보이기
                } else {
                    throw new Error('변경 중 오류 발생');
                }
            }).catch(error => {
                console.error('변경 중 오류 발생:', error);
            });
        } else if (clickCount > 0 && updateDetect()) { //회원 추가와 변경이 모두 있는 경우
            let newMemData = [];
            let rCount = document.getElementById('member-table').getElementsByTagName('tr').length;
            for (let i = rCount - clickCount + 1; i <= rCount; i++) {
                let rData = {
                    member_name: document.getElementById(`new_member_name_${i}`).value,
                    member_student_id: document.getElementById(`new_member_student_id_${i}`).value,
                    member_department: document.getElementById(`new_member_department_${i}`).value,
                    member_ph_number: document.getElementById(`new_member_ph_number_${i}`).value,
                    position: document.getElementById(`new_member_position_${i}`).value,
                    admin_ac: document.getElementById(`new_member_admin_ac_${i}`).checked,
                };
                newMemData.push(rData);
            }
            try {
                const addRequest = fetch(`/new-member?query=${category}`, {
                    method: 'POST',
                    body: JSON.stringify(newMemData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const updateRequest = fetch(`/update-member?query=${category}`, {
                    method: 'POST',
                    body: JSON.stringify(updateTarget),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const [addResponse, updateResponse] = await Promise.all([addRequest, updateRequest]);

                if (addResponse.ok && updateResponse.ok) {
                    await updateMemberCount();
                    alert('회원 추가와 정보 변경에 성공하였습니다.');
                    window.location.reload();
                } else {
                    alert('동일한 학번은 추가할 수 없습니다.');
                    window.location.reload();
                    throw new Error('회원 추가 또는 정보 변경 중 오류 발생');
                }
            } catch (error) {
                console.error('회원 추가 또는 정보 변경 중 오류 발생:', error);
            }
        } else if (clickCount > 0) {
            let newMemData = [];
            let rCount = document.getElementById('member-table').getElementsByTagName('tr').length;
            for (let i = rCount - clickCount + 1; i <= rCount; i++) {
                let rData = {
                    member_name: document.getElementById(`new_member_name_${i}`).value,
                    member_student_id: document.getElementById(`new_member_student_id_${i}`).value,
                    member_department: document.getElementById(`new_member_department_${i}`).value,
                    member_ph_number: document.getElementById(`new_member_ph_number_${i}`).value,
                    position: document.getElementById(`new_member_position_${i}`).value,
                    admin_ac: document.getElementById(`new_member_admin_ac_${i}`).checked,
                };
                newMemData.push(rData);
            }
            try {
                const addRequest = fetch(`/new-member?query=${category}`, {
                    method: 'POST',
                    body: JSON.stringify(newMemData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                addRequest.then(response => {
                    if (response.ok) {
                        updateMemberCount();
                        alert('회원 추가에 성공하였습니다.');
                        window.location.reload();
                        saveButton.style.display = 'none'; // save 버튼 숨기기
                        addButton.style.display = 'none'; // add 버튼 숨기기
                        document.getElementById('edit-button').style.display = 'inline-block'; // 편집 버튼 보이기
                    } else {
                        alert('동일한 학번은 추가할 수 없습니다.');
                        window.location.reload();
                        console.error('회원 추가 요청 실패:', response.status);
                    }
                });
            } catch (error) {
                console.error('회원 추가 중 오류 발생:', error);
            }
        } else {
            addButton.style.display = 'none';
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            let checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (checkbox) {
                // checkbox 비활성화
                checkbox.setAttribute("disabled", true);
            });

            let allPositionTexts = document.querySelectorAll('[id^="position_text_"]');
            allPositionTexts.forEach(function (text) {
                text.style.display = 'inline-block'; // 이전 상태로 변경
            });

            let allPositionInputs = document.querySelectorAll('[id^="position_input_"]');
            allPositionInputs.forEach(function (input) {
                input.style.display = 'none'; // 숨기기
            });
        }
    }
}


function deleteListener() {
        let table = document.getElementById('member-table');
        let rows = table.getElementsByTagName('tr');
        let lastRowIndex = rows.length - 1;
        if(clickCount>0) {
        if (lastRowIndex > 0) {
            let lastRow = rows[lastRowIndex];
            lastRow.remove(); // 마지막 행 삭제
        }
            clickCount--;
        }
        if(clickCount === 0) {
            saveButton.disabled = false;
            this.style.display = 'none';
        }
}

let updateTarget = [];
let editDataAdmin = [];
let editDataSpot = [];
function updateDetect() { //기존 정보에 대해 어떤 update가 있는지 판단하는 함수
    let memberTable = document.getElementById('member-table');
    for (let i = 1; i <= memberTable.getElementsByTagName('tr').length-2; i++) {

        let row = memberTable.rows[i];
        let inputElementChecked = row.cells[6].querySelector('input');
        let checkValue = inputElementChecked.checked;
        editDataAdmin.push(checkValue);
        let inputElement = row.cells[5].querySelector('input'); //직위, 변경 있으면 값 들어가고 없으면 빈 값
        let inputValue = inputElement.value.trim(); // input 요소의 값 가져오기
        editDataSpot.push(inputValue);
    }
    for (let i = 0; i < firstSpot.length-1; i++) {
        let row = memberTable.rows[i+1];

        if((editDataSpot[i] !== '') && (editDataSpot[i] !== firstSpot[i])) {
            //직위 바뀐거
            let newData = {key: row.cells[2].textContent, value: editDataSpot[i]};
            updateTarget.push(newData);
        }

        if(editDataAdmin[i] !== firstCheckValue[i]) {
            //권한 바뀐거
            let newData = {key: row.cells[2].textContent, value: editDataAdmin[i]};
            updateTarget.push(newData);
        }
    }

    return updateTarget.length > 0;
}

function showButtonOnHover() {
    let rows = document.querySelectorAll('#member-table tr');

    rows.forEach(row => {
        let addBtn = document.querySelector('#add-button');
        let hiddenBtn = row.querySelector('#hidden-btn');

        row.addEventListener('mouseover', () => {
            if (addBtn.style.display !== 'none') {
                hiddenBtn.style.display = 'inline-block';
            }
        });

        row.addEventListener('mouseout', () => {
            if (addBtn.style.display !== 'none') {
                hiddenBtn.style.display = 'none';
            }
        });
    });
}

document.querySelectorAll('#hidden-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('query');
        if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
            const row = this.closest('tr');
            const getStudentId = row.querySelectorAll('td')[1];
            const deleteId = getStudentId.textContent;
            fetch(`/delete-member?query=${category}`, {
                method: 'POST',
                body: JSON.stringify({id: deleteId}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        updateMemberCount();
                        alert('회원 삭제에 성공하였습니다.');
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('삭제 중 문제가 발생하였습니다.', error);
                });
        }
    });
});

function pageSplit() {
    let checkValue;
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');
    fetch(`/check-member?query=${category}`, {
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
            if (!data.success) {
                console.log('error');
            } else {
                checkValue = data.result[0].admin_ac;
                if(checkValue !== 0) {
                    // 새로운 div 요소 생성
                    const newDiv = document.createElement("div");
                    newDiv.setAttribute("style", "display: flex; justify-content: space-between; align-items: center;");

                    const buttonContainerDiv = document.createElement("div");
                    buttonContainerDiv.setAttribute("id", "button-container");
                    buttonContainerDiv.setAttribute("style", "display: flex;");

// 추가 버튼 생성
                    addButton = document.createElement("button");
                    addButton.setAttribute("id", "add-button");
                    addButton.setAttribute("class", "btn btn-primary");
                    addButton.setAttribute("style", "margin-bottom: 15px; display: none;");
                    addButton.textContent = "+";
                    buttonContainerDiv.appendChild(addButton);

// 삭제 버튼 생성
                    deleteButton = document.createElement("button");
                    deleteButton.setAttribute("id", "delete-button");
                    deleteButton.setAttribute("class", "btn btn-primary");
                    deleteButton.setAttribute("style", "margin-bottom: 15px; margin-left: 5px; display: none;");
                    deleteButton.textContent = "-";
                    buttonContainerDiv.appendChild(deleteButton);
// 편집 버튼 생성
                    editButton = document.createElement("button");
                    editButton.setAttribute("id", "edit-button");
                    editButton.setAttribute("class", "btn btn-primary");
                    editButton.setAttribute("style", "margin-bottom: 15px;");
                    editButton.textContent = "편집";
                    buttonContainerDiv.appendChild(editButton);

                    // 저장 버튼 생성
                    saveButton = document.createElement("button");
                    saveButton.setAttribute("id", "save-button");
                    saveButton.setAttribute("type", "submit");
                    saveButton.setAttribute("class", "btn btn-primary");
                    saveButton.setAttribute("style", "margin-bottom: 15px; margin-left: 10px; display: none;");
                    saveButton.textContent = "저장";
                    buttonContainerDiv.appendChild(saveButton);

                    newDiv.appendChild(buttonContainerDiv);

                    const profileOverviewDiv = document.getElementById("profile-overview");
                    profileOverviewDiv.appendChild(newDiv);

                    editButton.style.display = "inline-block";

                    editButton.addEventListener('click', editListener);
                    saveButton.addEventListener('click', saveListener);
                    addButton.addEventListener('click', addListener);
                    deleteButton.addEventListener('click', deleteListener);

                    const parentDiv = document.getElementById('profile-change-password');

                    const notice = document.createElement('div');
                    notice.style.textAlign = 'right';

                    const newButton = document.createElement('button');
                    newButton.id = 'clubNoticePostBtn';
                    newButton.className = 'btn btn-primary';
                    newButton.style.marginBottom = '15px';
                    newButton.innerText = '작성하기';
                    newButton.style.display = 'block';

                    notice.appendChild(newButton);
                    parentDiv.insertBefore(notice, parentDiv.firstChild);

                    const parentDiv2 = document.getElementById('profile-edit');

                    const recruit = document.createElement('div');
                    recruit.style.textAlign = 'right';

                    const newButton2 = document.createElement('button');
                    newButton2.id = 'ClubRecruitPostBtn';
                    newButton2.className = 'btn btn-primary';
                    newButton2.style.marginBottom = '15px';
                    newButton2.innerText = '작성하기';
                    newButton2.style.display = 'block';

                    recruit.appendChild(newButton2);
                    parentDiv2.insertBefore(recruit, parentDiv2.firstChild);

                    notice.style.display = 'flex';
                    notice.style.justifyContent = 'flex-end';

                    recruit.style.display = 'flex';
                    recruit.style.justifyContent = 'flex-end';

                    const newLi = document.createElement('li');
                    newLi.className = 'nav-item';

                    const clubIntroLi = document.createElement('li');
                    clubIntroLi.className = 'nav-item';

                    const joinList = document.createElement('button');
                    joinList.className = 'nav-link join-list-tab';
                    joinList.setAttribute('data-bs-toggle', 'tab');
                    joinList.setAttribute('data-bs-target', '#profile-settings');
                    joinList.innerText = '가입 신청 현황';

                    const clubIntroductionEdit = document.createElement('button');
                    clubIntroductionEdit.className = 'nav-link club-introduction-edit-tab';
                    clubIntroductionEdit.setAttribute('data-bs-toggle', 'tab');
                    clubIntroductionEdit.setAttribute('data-bs-target', '#clubIntroductionEdit');
                    clubIntroductionEdit.innerText = '동아리 소개 편집';

                    newLi.appendChild(joinList);
                    clubIntroLi.appendChild(clubIntroductionEdit);

                    const parentUl = document.querySelector('.nav-tabs');
                    parentUl.appendChild(newLi);
                    parentUl.appendChild(clubIntroLi);
                }
                else {
                    const studentIdElement = document.getElementById("student-id");
                    const phoneNumberElement = document.getElementById("ph-number");

                    if (studentIdElement && phoneNumberElement) {
                        const studentIdColumnIndex = studentIdElement.cellIndex;
                        const phoneNumberColumnIndex = phoneNumberElement.cellIndex;

                        // 테이블의 각 행을 반복하며 학번과 전화번호 열을 숨깁니다.
                        const tableRows = document.getElementById("member-table").rows;
                        for (let i = 0; i < tableRows.length; i++) {
                            tableRows[i].cells[studentIdColumnIndex].style.display = "none"; // 학번 열 숨기기
                            tableRows[i].cells[phoneNumberColumnIndex].style.display = "none"; // 전화번호 열 숨기기
                        }

                        const nameWidth = document.getElementById('student-name');
                        nameWidth.style.width = "220px";

                        const departmentWidth = document.getElementById('student-department');
                        departmentWidth.style.width = "300px";
                    }
                }
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function checkStId() {
    let check = [];
    const rows = document.querySelectorAll('#student-id-list');
    const studentIds = [];
    rows.forEach(row => {
        const studentId = row.textContent.trim();
        studentIds.push(studentId);
    });

    let checkData = [];
    let rCount = document.getElementById('member-table').getElementsByTagName('tr').length;
    for(let i = rCount - clickCount + 1 ; i<=rCount; i++) {
        let rowData = {
            member_student_id: document.getElementById(`new_member_student_id_${i}`).value,
        };
        checkData.push(rowData);
    }

    for(let i=0; i<checkData.length; i++) {
        for(let j = 0; j<studentIds.length; j++) {
            if(checkData[i].member_student_id === studentIds[j]) {
                check.push(j+1);
            }
        }
    }
    return check;
}

async function createOwnerButton() {
    try {
        const response = await fetch('/get-clubs', {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        data.clubs.forEach(club => {
            if (club.category === parseInt(getCategory())) {
                const ownerPrintDiv = document.getElementById('owner-print');

                const newButton = document.createElement('button');
                newButton.className = 'btn btn-primary';
                newButton.innerText = '변경';
                newButton.style.display = 'block';
                newButton.style.marginLeft = '10px';
                newButton.style.width = '70px';

                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'inline-block';

                buttonContainer.appendChild(newButton);
                ownerPrintDiv.appendChild(buttonContainer);

                newButton.addEventListener('click', function() {
                    changeOwner();
                });
            }
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

const itemsPerPage = 10;

let currentPage = 1;

const memberTable = document.getElementById('member-table');

function updatePaginationUI(totalPages) {
    const paginationContainer = document.getElementById('member-pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');

        const a = document.createElement('a');
        a.classList.add('page-link');
        a.href = '#';
        a.textContent = i;
        if (i === currentPage) {
            li.classList.add('active');
        }
        a.addEventListener('click', () => {
            currentPage = i;
            paginate();
        });

        li.appendChild(a);
        paginationContainer.appendChild(li);
    }
}

function paginate() {
    const rows = memberTable.getElementsByTagName('tr');

    const totalItems = rows.length - 1;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }

    for (let i = startIndex; i <= endIndex; i++) {
        rows[i].style.display = '';
    }
    updatePaginationUI(totalPages);
}
function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function changeOwner() {
    let userInput = prompt("위임 할 대상의 학번을 입력하세요.", "");

    if (userInput !== null) {
        if (userInput.trim() !== "") {
            let table = document.getElementById("member-table");

            for (let i = 0, row; row = table.rows[i]; i++) {
                for (let j = 0, cell; cell = row.cells[j]; j++) {
                    // 현재 셀의 텍스트와 사용자 입력 값 비교
                    if (cell.textContent.trim() === userInput.trim()) {
                        if (j > 0) {
                            let previousCellValue = row.cells[j - 1].textContent.trim();
                            let previousPosition = row.cells[j + 3].textContent.trim();
                            let result = confirm("이름:" + previousCellValue + "\n" + "학번:" + userInput + "\n" + "위의 대상에게 권한을 위임하시겠습니까?" + "\n" + "(권함 위임 후 회원님의 직위는 최하위로 변경되며 관리 권한 또한 해제됩니다.)");
                            let updateTarget = {
                                name: previousCellValue,
                                stId: userInput,
                                category: parseInt(getCategory()),
                            }
                            if (result) {

                                try {
                                    const updateRequest = fetch('/change-owner', {
                                        method: 'POST',
                                        body: JSON.stringify(updateTarget),
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    const [updateResponse] = await Promise.all([updateRequest]);

                                    if (updateResponse.ok) {
                                        alert('권한 변경에 성공하였습니다.');
                                        window.location.reload();
                                    } else {
                                        alert('위임 중 오류가 발생하였습니다.'+'\n'+'해당 사용자는 서비스 사용자가 아닐 수 있습니다.');
                                        window.location.reload();
                                        throw new Error('회원 추가 또는 정보 변경 중 오류 발생');
                                    }

                                } catch(error) {
                                    console.error('정보 변경 중 오류 발생:', error);
                                }

                            } else {
                                console.log('사용자가 "아니오"를 선택했습니다.');
                            }
                        }
                        return;
                    }
                }
            }
            alert("입력 값과 일치하는 회원이 존재하지 않습니다.");

        } else {
            alert("잘못된 입력입니다.");
            changeOwner();
        }
    } else {
        console.log('사용자가 입력을 취소했습니다.');
    }
}

async function checkOwner() {
    try {
        const category = getCategory();
        const response = await fetch(`/api/thisClubOwnerCheck/get?category=${category}`, {
            method:"GET",
            headers: {
                'Content-Type':'Application/json',
                },
            });

            if(!response.ok){
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            const data = await response.json();

        if(data.hasClubOwner) {
            createOwnerButton();
        }
        } catch (error) {
            alert(`에러가 발생했습니다. ${error}`);
            console.error(`에러가 발생했습니다. ${error}`);
            window.location.reload();
    }
}

async function updateMemberCount() {
    try {
        const category = getCategory();
        const response = await fetch(`/update/memberCount?query=${category}`, {
            method:"GET",
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

    } catch (error) {
        alert(`에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}
