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

    // Quill Delta를 HTML로 변환하여 설정
    let htmlContent = quillGetHTML(postData.content);
    document.getElementById('post_club_content').innerHTML = htmlContent;
}

function quillGetHTML(inputDelta) {
    let tempCont = document.createElement("div");
    let editor = tempCont.appendChild(document.createElement("div"));
    (new Quill(editor)).setContents(inputDelta);
    return tempCont.innerHTML;
}

//게시글을 작성하고 바로 작성자가 지금 작성된 게시글을 확인한다.
function getCurrentRecruitPost() {
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

//post_number를 기준으로 홍보게시판을 보여준다.
function getViewRecruitPostFromNum() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');
    fetch(`/view-recruit-post-from-postNum?query=${postNum}`, {
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
            if (!data.success) {
                alert("현재 존재하지 않는 게시글 입니다.");
                // window.location.href = "/";
                return;
            }
            //와 이게 되네;;
            setViewPostingInfo(data.postData);
            let htmlContent = quillGetHTML(data.postData.content);
            document.getElementById('post_club_content').innerHTML = htmlContent;
        })
}

// 페이지가 로드될 때 getUserPosts 함수를 실행
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');
    if(postNum){
        getViewRecruitPostFromNum();
        return;
    }
    getCurrentRecruitPost();
});
