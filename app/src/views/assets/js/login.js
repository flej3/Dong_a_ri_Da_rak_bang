// 사용자 입력 값을 가져오는 함수
function getInputValue(id) {
    return document.getElementById(id).value;
}

function showInvalidFeedback(message) {
    let invalidFeedback = document.querySelector('.invalid-feedback-login');
    invalidFeedback.textContent = message;
    invalidFeedback.style.display = 'block';

    // 애니메이션을 재활성화하기 위해 요소의 offsetWidth에 접근
    // 이는 브라우저에게 요소를 다시 렌더링하도록 강제함
    void invalidFeedback.offsetWidth;

    // 애니메이션을 다시 적용
    invalidFeedback.style.animation = 'none';
    setTimeout(() => {
        invalidFeedback.style.animation = '';
    }, 10); // 약간의 지연을 두어 애니메이션을 재시작
}

function authenticateUser(event) {
    event.preventDefault();
    const userId = getInputValue('userEmail');
    const userPw = getInputValue('userPassword');
    fetch('/api/users/check-availability', {
        method: 'POST',
        body: JSON.stringify({
            userId,
            userPw,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(id => {
            if (!id.isAvailable) {
                showInvalidFeedback(id.message);
                return;
            }
            alert("로그인에 성공하였습니다.");
            window.location.href = id.location;
        })
        .catch(err => {
            console.error(`에러: ${err}`);
        })
}

document.getElementById('loginForm').addEventListener('submit', authenticateUser);
