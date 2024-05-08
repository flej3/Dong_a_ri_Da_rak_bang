const openConfirmModalBtn = document.getElementById('deleteAccountForm');
openConfirmModalBtn.addEventListener('submit', async (event) => {
    event.preventDefault();
    const pw = document.getElementById('passwordConfirmation').value;
    const checkingPw = await checkPw(pw);
    if(!checkingPw){
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
});

async function checkPw(pw){
    try {
        const response = await fetch('/api/account/check/pw', {
            method:'POST',
            body: JSON.stringify({pw}),
            headers: {
                'Content-Type': 'Application/json',
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
        alert('회원 정보를 확인하는데 에러가 발생했습니다.');
        window.location.reload();
    }
}

async function deleteAccount(pw){
    try {
        const response = await fetch('/api/delete/account/check/pw', {
            method:'DELETE',
            body: JSON.stringify({pw}),
            headers: {
                'Content-Type': 'Application/json',
            },
        });
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if(!data.success){
            alert(data.msg);
            window.location.reload();
            return;
        }
        alert(data.msg);
        window.location.href = "/";
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert('회원 정보를 확인하는데 에러가 발생했습니다.');
        window.location.reload();
    }
}

const confirmInput = document.getElementById('confirmInput');
confirmInput.addEventListener('input', function () {
    const input = this.value.trim();
    const confirmBtn = document.getElementById('confirmBtn');
    const confirmError = document.getElementById('confirmError');

    if (input.toLowerCase() === '회원탈퇴') {
        confirmBtn.removeAttribute('disabled');
        confirmError.style.display = 'none';
    } else {
        confirmBtn.setAttribute('disabled', true);
        confirmError.style.display = 'block';
    }
});

const confirmBtn = document.getElementById('confirmBtn');
confirmBtn.addEventListener('click', async () => {
    const pw = document.getElementById('passwordConfirmation').value;
    await deleteAccount(pw);
});
