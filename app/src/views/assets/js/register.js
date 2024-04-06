// 비밀번호 일치 검증 함수
function validatePassword() {
    const password = getInputValue('userPw');
    const confirmPassword = getInputValue('confirmUserPw');

    if (password !== confirmPassword) {
        document.getElementById('confirmUserPw').classList.add('is-invalid');
    } else {
        document.getElementById('confirmUserPw').classList.remove('is-invalid');
    }
}

function removeHyphensAndSpaces(phoneNumber) {
    // 정규 표현식을 사용하여 전화번호에서 하이픈과 공백을 제거
    return phoneNumber.replace(/[-\s]/g, '');
}

//input창 색상 변경.
function changeInputColor(elementId, isValid) {
    const inputElement = document.getElementById(elementId);
    if (isValid) {
        inputElement.style.borderColor = 'green'; // 유효한 경우 파란색으로 설정
    } else {
        inputElement.style.borderColor = 'red'; // 유효하지 않은 경우 빨간색으로 설정
    }
}

// 이메일 형식 검증 함수
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// 사용자 입력 값을 가져오는 함수
function getInputValue(id) {
    return document.getElementById(id).value;
}

// 학번 유효성 검증 함수
function validateStudentId() {
    const studentId = getInputValue('userStudentId');

    // 학번이 정확히 9자리인지 확인
    if (studentId.length === 9) {
        document.getElementById('userStudentId').classList.remove('is-invalid');
        return true;
    } else {
        document.getElementById('userStudentId').classList.add('is-invalid');
        return false;
    }
}

function showInvalidFeedback(fieldId, message) {
    let invalidFeedback = document.getElementById(fieldId);

    invalidFeedback.innerText = message;
    invalidFeedback.style.display = 'block';
}

function hideInvalidFeedback(fieldId) {
    let invalidFeedback = document.getElementById(fieldId);

    invalidFeedback.style.display = 'none';
}

function isUserIdDuplicate() {
    const userId = getInputValue('userId');
    return new Promise((resolve, reject) => {
        if (!validateEmail(userId)) {
            showInvalidFeedback('invalid_user_id', '잘못된 이메일 형식입니다.');
            changeInputColor('userId', false);
            resolve(false);
            return;
        }
        fetch('/userId-check', {
            method: 'POST',
            body: JSON.stringify({ userId }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('네트워크 응답이 올바르지 않습니다.');
                }
                return response.json();
            })
            .then(data => {
                if (data.isAvailable) {
                    showInvalidFeedback('invalid_user_id', '이미 사용중인 이메일 입니다.');
                    changeInputColor('userId', false);
                    resolve(false);
                } else {
                    hideInvalidFeedback('invalid_user_id');
                    changeInputColor('userId', true);
                    resolve(true);
                }
            })
            .catch(err => {
                alert(`에러가 발생했습니다.`);
                console.error(err);
                window.location.href = "/";
                reject(err);
            });
    });
}
document.getElementById('userIdCheckButton').addEventListener('click', isUserIdDuplicate);

function isStudentIdDuplicate() {
    const userStudentId = getInputValue('userStudentId');
    return new Promise((resolve, reject) => {
        if (!validateStudentId()) {
            showInvalidFeedback('userStudentIdFeedback', '학번은 9자리의 숫자로 이루어져있습니다.');
            changeInputColor('userStudentId', false);
            resolve(false);
            return;
        }
        fetch('userStudentId-check', {
            method: 'POST',
            body: JSON.stringify({ userStudentId }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('네트워크 응답이 올바르지 않습니다.');
                }
                return res.json();
            })
            .then(data => {
                if(data.isAvailable){
                    showInvalidFeedback('userStudentIdFeedback', '이미 등록된 학번 입니다.');
                    changeInputColor('userStudentId', false);
                    resolve(false);
                }else{
                    hideInvalidFeedback('userStudentIdFeedback');
                    changeInputColor('userStudentId', true);
                    resolve(true);
                }
            })
            .catch(err => {
                alert(`에러가 발생했습니다.`);
                console.error(err);
                window.location.href = "/";
                reject(err);
            });
    })
}
document.getElementById('studentIdCheckButton').addEventListener('click', isStudentIdDuplicate);

function createUser(){
    const userPhNum = removeHyphensAndSpaces(getInputValue('userPhNumber'));
    
    const userData = {
        user_id: getInputValue('userId'),
        user_pw: getInputValue('userPw'),
        user_name: getInputValue('userName'),
        user_student_id: getInputValue('userStudentId'),
        user_department: getInputValue('userDepartment'),
        user_ph_number: userPhNum,
    };
    fetch('/create-account', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return res.json();
    })
    .then(data => {
        if(!data.success){
            setModalMessage('계정 생성에 실패하였습니다. 오류가 반복되면 문의 부탁드립니다.');
            return;
        }
        alert(data.message);
        window.location.href = data.locate;
    })
    .catch(error => {
        console.error('계정 생성 중 에러가 발생하였습니다:', error);
    });
}

function setModalMessage(message){
    document.getElementById('error-modal-body').innerText = message;
    let errorModal = new bootstrap.Modal(document.getElementById('errorModal'), {
        keyboard: false
    });
    errorModal.show();
}

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const userIdDuplicate = await isUserIdDuplicate();
    const studentIdDuplicate = await isStudentIdDuplicate();

    if(!userIdDuplicate){
        setModalMessage('Email이 올바르지 않습니다.')
        return;
    }
    if(!studentIdDuplicate){
        setModalMessage('학번이 올바르지 않습니다.')
        return;
    }
    const password = getInputValue('userPw');
    const confirmPassword = getInputValue('confirmUserPw');
    if(password !== confirmPassword){
        setModalMessage('비밀번호가 일치하지 않습니다.');
        return;
    }

    createUser();
});
