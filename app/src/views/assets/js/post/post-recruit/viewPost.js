function setViewPostingInfo(postData) {
    // 동아리 이름과 제목 표시
    const clubName = postData.club_name;
    const title = postData.title;
    document.getElementById('post_club_name').innerText = `[${clubName}]`;
    document.getElementById('post_title').innerText = title;

    // 모집 인원 표시
    const recruitNum = postData.recruit_num;
    document.getElementById('post_recruitment_count').innerText = `${recruitNum}명`;

    // 작성일과 마감일 표시
    const createDay = new Date(postData.create_day).toLocaleDateString();
    const deadDay = new Date(postData.dead_day).toLocaleDateString();
    document.getElementById('post_created_at').innerText = `${createDay}`;
    document.getElementById('post_deadline').innerText = `${deadDay}`;
}

function quillGetHTML(inputDelta) {
    let tempCont = document.createElement("div");
    (new Quill(tempCont)).setContents(inputDelta);
    return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
}

function getUserPosts() {
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
            console.log(data)
            if (!data.success) {
                alert("최근에 작성한 홍보 게시글이 없습니다.");
                window.location.href = "/";
            }
            //와 이게 되네;;
            setViewPostingInfo(data.postData); // Assuming postData contains club_name and content
            // Getting HTML content from Quill and setting it to post_club_content
            let htmlContent = quillGetHTML(data.postData.content);
            document.getElementById('post_club_content').innerHTML = htmlContent;
        })
}

// 페이지가 로드될 때 getUserPosts 함수를 실행
document.addEventListener('DOMContentLoaded', function () {
    getUserPosts();
});
