document.addEventListener('DOMContentLoaded', () => {
    pageSplit();
})

const firstCheck = [];
function editListener() {
    showButtonOnHover();
    document.getElementById('hidden-btn').style.display = 'inline-block';
    let memberTable = document.getElementById('member-table');
    for (let i = 1; i <= memberTable.getElementsByTagName('tr').length-1; i++) {
        let row = memberTable.rows[i];
        let inputElementChecked = row.cells[6].querySelector('input');
        let checkValue = inputElementChecked.checked;
        firstCheck.push(checkValue);
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
                const addRequest = fetch('/new-member', {
                    method: 'POST',
                    body: JSON.stringify(newMemData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                addRequest.then(response => {
                    if (response.ok) {
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
                const addRequest = fetch('/new-member', {
                    method: 'POST',
                    body: JSON.stringify(newMemData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const updateRequest = fetch('/update-member', {
                    method: 'POST',
                    body: JSON.stringify(updateTarget),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const [addResponse, updateResponse] = await Promise.all([addRequest, updateRequest]);

                if (addResponse.ok && updateResponse.ok) {
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
let updateChecked = [];
let checkedTarget = [];
function updateDetect() {
    let memberTable = document.getElementById('member-table');
    for (let i = 1; i <= memberTable.getElementsByTagName('tr').length-1; i++) {
        let row = memberTable.rows[i];
        let inputElement = row.cells[5].querySelector('input');
        let inputValue = inputElement.value.trim(); // input 요소의 값 가져오기
        let inputElementChecked = row.cells[6].querySelector('input');
        let checkValue = inputElementChecked.checked;
        if(inputValue !== '') {
            let changedData = {key: row.cells[2].textContent, value: inputValue};
            updateTarget.push(changedData);
        }
        updateChecked.push(checkValue);
    }
    for (let i = 0; i < updateChecked.length; i++) {
        let row = memberTable.rows[i+1];
        if(updateChecked[i] !== firstCheck[i]) {
            let changedCheck = {key: row.cells[2].textContent, value: updateChecked[i]};
            updateTarget.push(changedCheck);
            checkedTarget.push(changedCheck);
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
                    saveButton.setAttribute("style", "margin-bottom: 15px; display: none;");
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
                    newButton.type = 'submit';
                    newButton.id = 'write-post';
                    newButton.className = 'btn btn-primary';
                    newButton.style.marginBottom = '15px';
                    newButton.innerText = '작성하기';

                    notice.appendChild(newButton);
                    parentDiv.insertBefore(notice, parentDiv.firstChild);

                    const parentDiv2 = document.getElementById('profile-edit');

                    const recruit = document.createElement('div');
                    recruit.style.textAlign = 'right';

                    const newButton2 = document.createElement('button');
                    newButton2.type = 'submit';
                    newButton2.id = 'ClubRecruitPostBtn';
                    newButton2.className = 'btn btn-primary';
                    newButton2.style.marginBottom = '15px';
                    newButton2.innerText = '작성하기';

                    recruit.appendChild(newButton2);
                    parentDiv2.insertBefore(recruit, parentDiv2.firstChild);

                    const newLi = document.createElement('li');
                    newLi.className = 'nav-item';


                    const joinList = document.createElement('button');
                    joinList.className = 'nav-link';
                    joinList.setAttribute('data-bs-toggle', 'tab');
                    joinList.setAttribute('data-bs-target', '#profile-settings');
                    joinList.innerText = '가입 신청 현황';


                    newLi.appendChild(joinList);

                    const parentUl = document.querySelector('.nav-tabs');
                    parentUl.appendChild(newLi);
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