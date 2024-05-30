function getFindIdFormData() {
    const findIdFormData = {};
    findIdFormData.user_name = document.getElementById('userName').value;
    findIdFormData.user_ph_number = document.getElementById('userPhone').value;
    findIdFormData.user_student_id = document.getElementById('userStudentID').value;
    findIdFormData.user_department = document.getElementById('userDepartment').value;
    return findIdFormData;
}

document.getElementById('findIDForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const findIdFormData = getFindIdFormData();
    try {
        const response = await fetch('/api/find/ID', {
            method: 'POST',
            body: JSON.stringify(findIdFormData),
            headers: {
                'Content-type': 'Application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        const resultModalBody = document.getElementById('resultModalBody');
        if (data.user_id && data.user_id.user_id) {
            resultModalBody.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="bi bi-check-circle-fill"></i> 회원님의 ID는 <strong>${data.user_id.user_id}</strong> 입니다.
            </div>
            `;
        } else {
            resultModalBody.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> 입력하신 정보로 가입된 ID를 찾을 수 없습니다.
            </div>
            `;
        }

        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        resultModal.show();
    } catch (error) {
        console.error('ID를 찾는도중 에러가 발생했습니다.');
        alert('ID를 찾는도중 에러가 발생했습니다.');
        window.location.reload();
    }
})

document.getElementById('findPwButton').addEventListener('click', () => {
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    passwordModal.show();
})

async function checkPasswordCode(pwCode){
    try {
        const response = await fetch('/api/check/change/pw/code', {
            method: 'post',
            body: JSON.stringify({pwCode}),
            headers: {
                'Content-type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        const data = await response.json();

        if(!data.success){
            alert('올바른 코드가 아닙니다. 코드를 다시 확인해주세요.');
            window.location.reload();
            return;
        }
        document.getElementById('userId').value = data.user_id;

        const previousModal = document.querySelector('.modal.show');
        if (previousModal) {
            const modalInstance = bootstrap.Modal.getInstance(previousModal);
            modalInstance.hide();
        }

        const passwordResetModal = new bootstrap.Modal(document.getElementById('passwordResetModal'));
        passwordResetModal.show();

        document.getElementById('resetPasswordButton').addEventListener('click', async () => {
            const newPasswordInput = document.getElementById('newPassword').value;
            const confirmPasswordInput = document.getElementById('confirmPassword').value;
            if (newPasswordInput === confirmPasswordInput) {
                await changePw(data.user_id, confirmPasswordInput);
            }
        });

    } catch (error) {
        console.error('pw 변경 코드를 확인중 에러발생');
        alert('pw 변경 코드를 확인중 에러발생');
        window.location.reload();
    }
}

async function changePw(id, pw){
    try {
        const response = await fetch('/api/change/pw', {
            method: 'put',
            body: JSON.stringify({id, pw}),
            headers: {
                'Content-type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        
        if(!data.success){
            alert('비밀번호 변경에 실패 하였습니다.');
            window.location.reload();
            return;
        }
        
        alert('비밀번호 변경에 성공하였습니다!');
        window.location.href = "/pages-login";
    } catch (error) {
        console.error('비밀번호 변경중 에러발생');
        alert('비밀번호 변경중 에러발생');
        window.location.reload();
    }
}

document.getElementById('verifyCodeButton').addEventListener('click', async () => {
    const pwCode = document.getElementById('verificationCode').value;
    await checkPasswordCode(pwCode);
})

const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMismatchMessage = document.getElementById('passwordMismatchMessage');

newPasswordInput.addEventListener('input', checkPasswordMatch);
confirmPasswordInput.addEventListener('input', checkPasswordMatch);

function checkPasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword === confirmPassword) {
        passwordMismatchMessage.style.display = 'none';
    } else {
        passwordMismatchMessage.style.display = 'block';
    }
}