const changePwBtn = document.getElementById('changePwBtn');
changePwBtn.addEventListener('click', setChangePassword);

// 유효성 검증 상태를 추적하는 객체
const validationState = {
    currentPasswordValid: false,
    passwordMatch: false,
};

function getInputValue(inputId) {
    return document.getElementById(inputId).value;
}

// 현재 비밀번호 입력 필드의 변경 사항을 추적하는 함수
function trackPasswordInput() {
    const currentPasswordField = document.getElementById('currentPassword');
    const currentPassword = currentPasswordField.value.trim();

    // 현재 비밀번호 필드가 비어 있는지 여부에 따라 validation 상태를 업데이트합니다.
    validationState.currentPasswordValid = currentPassword !== '';
    updateChangePasswordButtonState(); // 검증 상태에 따라 버튼 상태를 업데이트합니다.
}

function updateChangePasswordButtonState() {
    const changePwBtn = document.getElementById('changePwBtn');
    if (canChangePw()) {
        changePwBtn.disabled = false;
    } else {
        changePwBtn.disabled = true;
    }
}

function canChangePw() {
    return validationState.currentPasswordValid && validationState.passwordMatch;
}

function validatePassword() {
    const password = getInputValue('newPassword');
    const confirmPassword = getInputValue('renewPassword');

    if (password !== confirmPassword) {
        document.getElementById('renewPassword').classList.add('is-invalid');
        document.getElementById('passwordMismatch').style.display = 'block';
        validationState.passwordMatch = false;
    } else {
        document.getElementById('renewPassword').classList.remove('is-invalid');
        document.getElementById('passwordMismatch').style.display = 'none';
        validationState.passwordMatch = true;
    }
    updateChangePasswordButtonState();
}

function setChangePassword(){
    if (!canChangePw()) {
        alert('비밀번호를 다시 확인해주세요.');
        return;
    }

    const userPw = {};
    userPw.currentPassword = getInputValue('currentPassword');
    userPw.newPassword = getInputValue('renewPassword');
    fetch('/setChangePassword', {
        method: 'POST',
        body: JSON.stringify(userPw),
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
            alert(data.message);
            return;
        }
        alert(data.message);
        window.location.href = "pages-login";
    })
    .catch(err => {
        console.error('비밀번호 변경중 오류가 발생했습니다.', err);
    });
}
