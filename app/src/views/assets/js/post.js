function submitPostData() {
    const postingData = {
        club_name: document.getElementById('dongariName').value,
        content: document.getElementById('introduction').value,
        recruit_num: document.getElementById('recruitNumber').value,
        dead_day: document.getElementById('recruitDeadline').value,
        image_route: document.getElementById('postImageFile').value,
    };

    // 서버에 데이터 전송
    fetch('/postData', {
        method: 'POST',
        body: JSON.stringify(postingData),
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
    .then(data => {
        console.log(data);
        if (!data.success) {
            alert('게시글 작성에 실패하였습니다.');
            return;
        }
        alert('게시글 등록에 성공하였습니다.');
        window.location.href = "/index";
    })
    .catch(error => {
        console.error('오류 발생:', error.message);
        alert('게시글 작성에 실패하였습니다.');
    });
}

const completePostBtn = document.getElementById('completePostBtn');
completePostBtn.addEventListener('click', submitPostData);