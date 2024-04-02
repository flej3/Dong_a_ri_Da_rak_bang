const firstCheck = [];
const editBtn = document.getElementById('edit-button');
editBtn.addEventListener("click", function() {
    document.getElementById('hidden-btn').style.display = 'inline-block';
    let memberTable = document.getElementById('member-table');
    for (let i = 1; i <= memberTable.getElementsByTagName('tr').length-1; i++) {
        let row = memberTable.rows[i];
        let inputElementChecked = row.cells[6].querySelector('input');
        let checkValue = inputElementChecked.checked;
        firstCheck.push(checkValue);
    }
    // "편집" 버튼 숨기기
    this.style.display = "none";
    // "저장" 버튼 보이기
    document.getElementById('save-button').style.display = "inline-block";
    // "추가" 버튼 보이기
    document.getElementById('add-button').style.display = "inline-block";

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
});

let clickCount = 0; //add button count
const addButton = document.getElementById('add-button');
    addButton.addEventListener('click', function () {
        document.getElementById('delete-button').style.display = "inline-block";
        clickCount++;
        let memberTable = document.getElementById('member-table');
        let rowCount = memberTable.getElementsByTagName('tr').length;
        let newRow = document.createElement('tr');
        newRow.innerHTML = `
            <th scope="row">${rowCount}</th>
            <td><input type="text" class="member_name" style="width: 150px; height: 35px;" id="new_member_name_${rowCount + 1}"></td>
            <td><input type="text" class="member_student_id" style="width: 150px; height: 35px;" id="new_member_student_id_${rowCount + 1}"></td>
            <td><input type="text" class="member_department" style="width: 150px; height: 35px;" id="new_member_department_${rowCount + 1}"></td>
            <td><input type="text" class="member_ph_number" style="width: 150px; height: 35px;" id="new_member_ph_number_${rowCount + 1}"></td>
            <td><input type="text" class="position" style="width: 60px; height: 30px;" id="new_member_position_${rowCount + 1}"></td>
            <td><input type="checkbox" class="admin_ac" id="new_member_admin_ac_${rowCount + 1}"></td>
        `;
        // 테이블에 위의 형식대로 새로운 행 추가
        let table = document.getElementById('member-table');
        table.appendChild(newRow);
    });

const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', async function() {

    if(clickCount === 0 && updateDetect()) {  //기존 회원에 대한 변경만 있는 경우
        fetch('/update-member', {
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
    }
    else if(clickCount > 0) {
        let newMemData = [];
        let rCount = document.getElementById('member-table').getElementsByTagName('tr').length;
        for(let i = rCount - clickCount + 1 ; i<=rCount; i++) {
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
                    console.error('회원 추가 요청 실패:', response.status);
                }
            });
        } catch (error) {
            console.error('회원 추가 중 오류 발생:', error);
        }
    }
    else if(clickCount > 0 && updateDetect()) { //회원 추가와 변경이 모두 있는 경우
        let newMemData = [];
        let rCount = document.getElementById('member-table').getElementsByTagName('tr').length;
        for(let i = rCount - clickCount + 1 ; i<=rCount; i++) {
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
                throw new Error('회원 추가 또는 정보 변경 중 오류 발생');
            }
        } catch (error) {
            console.error('회원 추가 또는 정보 변경 중 오류 발생:', error);
        }
    }
    else {
        addButton.style.display='none';
        saveButton.style.display='none';
        editBtn.style.display='inline-block';
        let checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            // checkbox 비활성화
            checkbox.setAttribute("disabled", true);
        });

        let allPositionTexts = document.querySelectorAll('[id^="position_text_"]');
        allPositionTexts.forEach(function(text) {
            text.style.display = 'inline-block'; // 이전 상태로 변경
        });

        let allPositionInputs = document.querySelectorAll('[id^="position_input_"]');
        allPositionInputs.forEach(function(input) {
            input.style.display = 'none'; // 숨기기
        });
    }
});

const deleteButton = document.getElementById('delete-button');
deleteButton.addEventListener('click', function() {
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
        if(clickCount === 0) this.style.display = 'none';
});

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

window.addEventListener('load', showButtonOnHover);

document.querySelectorAll('#hidden-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
            const row = this.closest('tr');
            const getStudentId = row.querySelectorAll('td')[1];
            const deleteId = getStudentId.textContent;
            fetch('/delete-member', {
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
