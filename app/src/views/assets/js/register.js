// 유효성 검증 상태를 추적하는 객체
const validationState = {
    emailValid: false,
    passwordValid: false,
};

// 사용자 입력 값을 가져오는 함수
function getInputValue(id) {
    return document.getElementById(id).value;
}

// 이메일 형식 검증 함수
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    updateCreateAccountButtonState();
    return re.test(String(email).toLowerCase());
}

// 비밀번호 일치 검증 함수
function validatePassword() {
    const password = getInputValue('userPw');
    const confirmPassword = getInputValue('confirmUserPw');

    if (password !== confirmPassword) {
        document.getElementById('confirmUserPw').classList.add('is-invalid');
        validationState.passwordValid = false;
    } else {
        document.getElementById('confirmUserPw').classList.remove('is-invalid');
        validationState.passwordValid = true;
    }
    updateCreateAccountButtonState();
}

// 피드백 표시 함수
function showInvalidFeedback(message) {
    let invalidFeedback = document.querySelector('.invalid-feedback');
    invalidFeedback.textContent = message;
    invalidFeedback.style.display = 'block';
}

// 피드백 숨기기 함수
function hideInvalidFeedback() {
    let invalidFeedback = document.querySelector('.invalid-feedback');
    invalidFeedback.style.display = 'none';
}

// 유효성 검증 상태 설정 함수
function setValidationState(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (isValid) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
        element.style.display = '';
    } else {
        element.classList.remove('is-valid');
        element.classList.add('is-invalid');
        element.style.display = 'block';
    }
}

// 이메일 검증 및 서버 요청 함수
function isUserIdDuplicate() {
    const userId = getInputValue('userId');
    if (validateEmail(userId)) {
        validationState.emailValid = true;
        fetch('/userId-check', {
            method: 'POST',
            body: JSON.stringify({ userId }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                // if (!response.ok) {
                //     throw new Error('네트워크 응답이 올바르지 않습니다.');
                // }
                return response.json();
            })
            .then(data => {
                if (data.isAvailable) {
                    validationState.emailValid = false;
                    showInvalidFeedback('이미 사용중인 이메일 입니다.');
                    setValidationState('userId', false);
                } else {
                    validationState.emailValid = true;
                    hideInvalidFeedback();
                    setValidationState('userId', true);
                }
            })
            .catch(err => {
                console.error(`에러: ${err}`);
            });
    } else {
        validationState.emailValid = false;
        showInvalidFeedback('잘못된 이메일 형식입니다.');
        setValidationState('userId', false);
    }
}
// 이벤트 리스너 등록
document.getElementById('userIdCheckButton').addEventListener('click', isUserIdDuplicate);

// 계정 생성 전 모든 유효성 검증이 통과되었는지 확인
function canCreateUser() {
    // 여기서는 emailValid와 passwordValid만 확인하지만, 필요에 따라 다른 상태도 확인해야 할 수 있습니다.
    return validationState.emailValid && validationState.passwordValid;
}

function updateCreateAccountButtonState() {
    const createAccountButton = document.getElementById('createAccountButton');
    if (canCreateUser()) {
        createAccountButton.disabled = false;
    } else {
        createAccountButton.disabled = true;
    }
}

function createUser() {
    if (!canCreateUser()) {
        alert('모든 유효성 검사를 통과해야 합니다.');
        return;
    }
    // 사용자 데이터 객체
    const userData = {
        user_id: getInputValue('userId'),
        user_pw: getInputValue('userPw'),
        user_name: getInputValue('userName'),
        user_student_id: getInputValue('userStudentId'),
        user_department: getInputValue('userDepartment'),
        user_ph_number: getInputValue('userPhNumber'),
    };

    fetch('/create-account', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
            console.error('계정 생성 중 에러가 발생하였습니다:', error);
        });
}
document.getElementById('createAccountButton').addEventListener('click', createUser);
