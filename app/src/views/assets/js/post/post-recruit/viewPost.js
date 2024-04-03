function setViewPostingInfo(postData) {
    // 동아리 이름과 제목 표시
    const clubName = postData.club_name;
    const title = postData.title;
    document.getElementById('post_club_name').innerText = `[${clubName}]`;
    document.getElementById('post_title').innerText = title;

    //가장 마지막에 수정한 작성자 표시
    const writer = postData.writer;
    document.getElementById('post_writer').innerText = `작성자: ${writer}`;

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
    // Quill 에디터를 읽기 전용으로 초기화
    let quill = new Quill(editor, {
        readOnly: true, // 편집 비활성화
        theme: 'bubble' // 필요에 따라 테마 설정 가능
    });
    quill.setContents(inputDelta);
    return tempCont.innerHTML;
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
                window.location.href = "/";
                return;
            }
            setViewPostingInfo(data.postData);
        })
        .catch(err => {
            alert("에러가 발생했습니다.");
            console.error(err);
            window.location.href = "/";
        })
}

//해당 게시글의 편집버튼 및 삭제버튼을 보여줄때, 
//접속자가 해당 게시글의 권한자(owner || admin_ac)인지 확인
function verifyEditAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');

    fetch(`/verifyEditAccess?query=${postNum}`, {
        method: 'GET',
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
            if (data.isAccess) {
                document.getElementById('edit_post_button').style.display = 'inline-block';
                document.getElementById('delete_post_button').style.display = 'inline-block';
            } else {
                document.getElementById('edit_post_button').style.display = 'none';
                document.getElementById('delete_post_button').style.display = 'none';
            }
        })
        .catch(err => {
            alert("에러가 발생했습니다.");
            console.error(err);
            window.location.href = "/";
        })
}

async function checkLogin() {
    try {
        const response = await fetch('/isLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data.isLogin;
    } catch (err) {
        alert("에러가 발생했습니다.");
        console.error(err);
        window.location.href = "/";
    }
}

function deletePost(postNum) {
    fetch(`/post-delete`, {
        method: 'POST',
        body: JSON.stringify({ postNum: postNum }),
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
            if (!data.success) {
                alert('게시글 삭제에 실패하였습니다.');
                return;
            }
            alert('게시글이 삭제되었습니다!');
            window.location.href = "/";
        })
        .catch(err => {
            alert(`에러발생: ${err}`);
            window.location.href = "/";
        })
}

document.addEventListener('DOMContentLoaded', async function () {
    const isUserLoggedIn = await checkLogin();
    if (isUserLoggedIn) {
        verifyEditAccess();
    }
    getViewRecruitPostFromNum();

    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');

    document.getElementById('edit_post_button').addEventListener('click', () => {
        window.location.href = `/edit-post?query=${postNum}`;
    });

    const deletePostBtn = document.getElementById('realDeleteBtn');
    deletePostBtn.addEventListener('click', () => {
        deletePost(postNum);
    });
});
