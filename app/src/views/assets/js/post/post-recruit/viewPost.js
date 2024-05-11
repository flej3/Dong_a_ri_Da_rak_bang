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

    // deadline이 지났는지 확인하고 알림 표시
    const now = new Date();
    const deadline = new Date(postData.dead_day);
    if (now > deadline) {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger', 'bg-danger', 'text-light', 'border-0', 'alert-dismissible', 'fade', 'show');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = '해당 동아리 게시글은 마감되었습니다.';
        document.getElementById('post_deadline_alert').appendChild(alertDiv);
        
        const joinClubBtn = document.getElementById('joinClubBtn');
        joinClubBtn.disabled = true;
    }
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
        return data;
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
    await showHeartSplit();
    const isUserLoggedIn = await checkLogin();
    if (isUserLoggedIn.isLogin) {
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

document.getElementById("heartSection").addEventListener("click", async function() {
    const isLogin = await checkLogin();
    if (isLogin.isLogin) {
        let icon = document.getElementById("heartIcon");
        if (icon.style.color === "red") { // 좋아요 취소
            const urlParams = new URLSearchParams(window.location.search);
            const postNum = urlParams.get('query');
            await fetch(`/api/minusLike?query=${postNum}`, {
                method: 'POST',
                body: JSON.stringify({postNum: postNum}),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                if (response.ok) {
                    console.log("좋아요 취소 성공");
                    icon.style.color = 'black';
                } else {
                    console.error("좋아요 취소 실패");
                }
            }).catch(error => {
                console.error('네트워크 오류:', error);
            });

        } else { // 좋아요 ++
            const urlParams = new URLSearchParams(window.location.search);
            const postNum = urlParams.get('query');
            await fetch(`/api/addLike?query=${postNum}`, {
                method: 'POST',
                body: JSON.stringify({postNum: postNum}),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                if (response.ok) {
                    console.log("좋아요 추가 성공");
                    icon.style.color = 'red';
                } else {
                    console.error("좋아요 추가 실패");
                }
            }).catch(error => {
                console.error('네트워크 오류:', error);
            });

        }
    } else {
        window.location.href = "/pages-login";
    }
});

async function showHeartSplit() {
    const isLogin = await checkLogin();
    if (isLogin.isLogin) {
        let icon = document.getElementById("heartIcon");
        const urlParams = new URLSearchParams(window.location.search);
        const postNum = urlParams.get('query');
        try {
            const response = await fetch(`/api/likeSplit?query=${postNum}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            const data = await response.json();
            if (data) {
                icon.style.color = 'red';
            } else {
                icon.style.color = 'black';
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
        }
    }
}