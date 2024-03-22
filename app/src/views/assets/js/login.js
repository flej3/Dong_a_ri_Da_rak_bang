// 사용자 입력 값을 가져오는 함수
function getInputValue(id) {
    return document.getElementById(id).value;
}

// 피드백 표시 함수
function showInvalidFeedback(message) {
    let invalidFeedback = document.querySelector('.invalid-feedback');
    invalidFeedback.textContent = message;
    invalidFeedback.style.display = 'block';
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
