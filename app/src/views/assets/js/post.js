function setViewPostingInfo(postData){
    document.getElementById('post_club_name').innerText = postData.club_name;
    document.getElementById('post_club_content').innerText = postData.content;
}

function getUserPosts(){
    fetch('/userPosts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return res.json();
    })
    .then(data => {
        // console.log(data);
        if(!data.success){
            alert("최근에 작성한 홍보 게시글이 없습니다.");
            window.location.href = "/";
        }
        setViewPostingInfo(data.postData);
    })
}

// 페이지가 로드될 때 getUserPosts 함수를 실행
document.addEventListener('DOMContentLoaded', function () {
    getUserPosts();
});