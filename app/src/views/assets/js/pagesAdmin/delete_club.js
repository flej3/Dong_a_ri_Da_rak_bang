let tabsLoaded = false;

function checkTabsLoaded() {
    if (tabsLoaded) return;
    const joinList = document.querySelector('.nav-link.join-list-tab');
    const clubIntroEdit = document.querySelector('.nav-link.club-introduction-edit-tab');
    if (joinList && clubIntroEdit) {
        createDeleteClubTab();
        tabsLoaded = true;
    } else {
        setTimeout(checkTabsLoaded, 100);
    }
}

function init() {
    checkTabsLoaded();
}

function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function thisClubOwnerCheck(){
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
        return data;
    } catch (error) {
        alert(`에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function createDeleteClubTab() {
    const newLi = document.createElement('li');
    newLi.className = 'nav-item';

    const deleteClubTab = document.createElement('button');
    deleteClubTab.className = 'nav-link';
    deleteClubTab.setAttribute('data-bs-toggle', 'tab');
    deleteClubTab.setAttribute('data-bs-target', '#clubDelete');
    deleteClubTab.innerText = '동아리 삭제';
    deleteClubTab.id = 'deleteClubTabBtn';

    newLi.appendChild(deleteClubTab);
    const parentUl = document.querySelector('.nav-tabs');
    parentUl.appendChild(newLi);

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = 'clubDelete';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.innerText = '<동아리 삭제>';

    const paragraph = document.createElement('p');
    paragraph.innerText = '정말로 동아리를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.';

    const form = document.createElement('form');
    form.id = 'deleteClubForm';

    const divPassword = document.createElement('div');
    divPassword.className = 'mb-3';

    const labelPassword = document.createElement('label');
    labelPassword.setAttribute('for', 'clubPasswordConfirmation');
    labelPassword.className = 'form-label';
    labelPassword.innerText = '비밀번호를 입력하세요';

    const inputPassword = document.createElement('input');
    inputPassword.type = 'password';
    inputPassword.className = 'form-control';
    inputPassword.id = 'clubPasswordConfirmation';
    inputPassword.name = 'clubPasswordConfirmation';
    inputPassword.placeholder = '비밀번호';
    inputPassword.required = true;

    const divCheckbox = document.createElement('div');
    divCheckbox.className = 'mb-3 form-check';

    const inputCheckbox = document.createElement('input');
    inputCheckbox.type = 'checkbox';
    inputCheckbox.className = 'form-check-input';
    inputCheckbox.id = 'confirmClubDeleteCheckbox';
    inputCheckbox.required = true;

    const labelCheckbox = document.createElement('label');
    labelCheckbox.className = 'form-check-label';
    labelCheckbox.setAttribute('for', 'confirmClubDeleteCheckbox');
    labelCheckbox.innerText = '위 내용을 확인하였으며, 동아리 삭제를 진행합니다.';

    const warningText = document.createElement('p');
    warningText.className = 'text-danger';
    warningText.innerText = '동아리를 삭제한 후에는 복구할 수 없습니다. 정말로 삭제하시겠습니까?';

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'text-center';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'submit';
    deleteButton.id = 'deleteClubBtn';
    deleteButton.className = 'btn btn-danger';
    deleteButton.innerText = '동아리 삭제하기';

    divPassword.appendChild(labelPassword);
    divPassword.appendChild(inputPassword);

    divCheckbox.appendChild(inputCheckbox);
    divCheckbox.appendChild(labelCheckbox);

    form.appendChild(divPassword);
    form.appendChild(divCheckbox);
    form.appendChild(warningText);
    buttonDiv.appendChild(deleteButton);
    form.appendChild(buttonDiv);

    tabContent.appendChild(title);
    tabContent.appendChild(paragraph);
    tabContent.appendChild(form);

    const tabContainer = document.querySelector('.tab-content');
    tabContainer.appendChild(tabContent);
}

const deleteClubConfirmInput = document.getElementById('deleteClubConfirmInput');
deleteClubConfirmInput.addEventListener('input', function () {
    const input = this.value.trim();
    const deleteClubConfirmBtn = document.getElementById('deleteClubConfirmBtn');
    const deleteClubConfirmError = document.getElementById('deleteClubConfirmError');

    if (input.toLowerCase() === '동아리삭제') {
        deleteClubConfirmBtn.removeAttribute('disabled');
        deleteClubConfirmError.style.display = 'none';
    } else {
        deleteClubConfirmBtn.setAttribute('disabled', true);
        deleteClubConfirmError.style.display = 'block';
    }
});

async function checkClubOwnerPw(){
    try {
        const category = getCategory();
        const pw = document.getElementById('clubPasswordConfirmation').value;
        const response = await fetch('/api/club/owner/check/pw/post', {
            method: 'POST',
            body: JSON.stringify({category, pw}),
            headers: {
                'Content-type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if(!data.success){
            alert(data.msg);
        }
        return data.success;
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert('비밀번호를 조회중 에러가 발생했습니다.');
        window.location.reload();
    }
}

document.getElementById('deleteClubConfirmBtn').addEventListener('click', async () => {
    try {
        const category = getCategory();
        const response = await fetch('/api/delete/club', {
            method: 'DELETE',
            body: JSON.stringify({category}),
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        alert(data.msg);
        window.location.href = "/";
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert('동아리를 삭제하는데 실패하였습니다.');
        window.location.reload();
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const {success, hasClubOwner} = await thisClubOwnerCheck();
    if( success && hasClubOwner){
        init();
    }
    const deleteClubForm = document.getElementById('deleteClubForm');
    if(deleteClubForm){
        deleteClubForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const isClubOwner = await checkClubOwnerPw();
            if(isClubOwner){
                const modal = new bootstrap.Modal(document.getElementById('clubDeleteConfirmModal'));
                modal.show();
            }
        });
    }
})