function getPostNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');

    return postNum;
}

//content의 값이 없으면 "댓글달기" 버튼 비활성화.
function contentNotNull() {
    const contentText = document.getElementById('comment_input').value;
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');

    if (contentText === "") {
        commentSubmitBtn.disabled = true;
    } else {
        commentSubmitBtn.disabled = false;
    }
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

function addCommentNew() {
    const commentData = {};

    commentData.content = document.getElementById('comment_input').value;
    commentData.postNumber = getPostNumber();
    commentData.userId = "";

    fetch('/api/comments/new', {
        method: 'POST',
        body: JSON.stringify(commentData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert('댓글 작성에 실패하였습니다. 다시 시도하여주세요.');
                window.location.reload();
            }
            window.location.reload();
        })
        .catch(err => {
            alert("댓글을 작성중 에러가 발생했습니다.");
            console.error(`에러발생 ${err}`);
            window.location.href = "/";
        })
}

document.getElementById('commentSubmitBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const isUserLoggedIn = await checkLogin();
    if (!isUserLoggedIn.isLogin) {
        return window.location.href = "/pages-login";
    }
    addCommentNew();
});

function displayComments(commentData, currentUserId) {
    const commentsList = document.querySelector('.comments-list');
    // 기존 댓글 목록 초기화
    commentsList.innerHTML = '';

    commentData.forEach(comment => {
        // 각 댓글에 대한 요소 생성
        const commentElement = document.createElement('div');
        commentElement.classList.add('card', 'mb-3');
        commentElement.id = `comment-${comment.comment_id}`;

        let buttonsHTML = '';
        // 로그인한 사용자가 댓글 작성자인 경우 편집 및 삭제 버튼 추가
        if (comment.user_id === currentUserId) {
            buttonsHTML = `
                <button class="btn btn-sm btn-outline-primary edit-btn" data-comment-id="${comment.comment_id}">편집</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-comment-id="${comment.comment_id}">삭제</button>
            `;
        }

        // 대댓글이 아닌 경우에만 대댓글 달기 버튼 추가
        if (!comment.parent_comment_id) {
            buttonsHTML += `<button class="btn btn-sm btn-outline-secondary reply-btn" data-comment-id="${comment.comment_id}">대댓글 달기</button>`;
        }
        let commentHTML = `
            <div class="card-body">
                <h6 class="card-title">${comment.user_id}<small class="ms-3 text-muted">${new Date(comment.created_at).toLocaleString()}</small></h6>
                <p class="card-text" id="comment-content-${comment.comment_id}">${comment.content}</p>
                ${buttonsHTML}
            </div>
        `;

        if (comment.is_deleted === 1) {
            // 댓글이 삭제된 경우
            commentElement.innerHTML = `
                <div class="alert alert-secondary p-3 text-center" role="alert">
                    삭제된 댓글입니다.
                </div>
            `;
        } else {
            commentElement.innerHTML = commentHTML;
        }

        // 대댓글일 경우
        if (comment.parent_comment_id) {
            const parentCommentElement = document.getElementById(`comment-${comment.parent_comment_id}`);
            // 대댓글을 위한 별도의 컨테이너가 있는지 확인
            let repliesContainer = parentCommentElement.querySelector('.replies');
            if (!repliesContainer) {
                // 부모 댓글에 대댓글 컨테이너가 없으면 생성
                repliesContainer = document.createElement('div');
                repliesContainer.classList.add('replies', 'ms-4'); // 'ms-4' 클래스로 들여쓰기 효과
                parentCommentElement.appendChild(repliesContainer);
            }
            // 대댓글 컨테이너에 대댓글 요소 추가
            repliesContainer.appendChild(commentElement);

            // 자식 댓글 디자인 변경
            commentElement.classList.add('child-comment');
            commentElement.style.backgroundColor = '#f8f9fa';
            commentElement.style.borderLeft = '3px solid #0d6efd';
        } else {
            // 부모 댓글일 경우 댓글 목록에 현재 댓글 요소 추가
            commentsList.appendChild(commentElement);
        }
    });

    // 대댓글 버튼 및 편집/삭제 버튼 이벤트 리스너 등록
    document.querySelectorAll('.reply-btn, .edit-btn, .delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const commentId = this.dataset.commentId;
            if (this.classList.contains('reply-btn')) {
                const isUserLoggedIn = await checkLogin();
                if (!isUserLoggedIn.isLogin) {
                    return window.location.href = "/pages-login";
                }
                toggleReplyInput(commentId);
            } else if (this.classList.contains('edit-btn')) {
                const originalContent = document.querySelector(`#comment-content-${commentId}`).textContent;
                editComment(commentId, originalContent);
            } else if (this.classList.contains('delete-btn')) {
                deleteComment(commentId);
            }
        });
    });
}

// 댓글 목록을 표시하고 대댓글 상태를 관리하는 객체
const replyInputsState = {};

// 대댓글 입력 UI 표시 함수
function showReplyInput(parentId) {
    // 모든 대댓글 창을 닫음
    closeAllReplyInputs();

    const replyInputHTML = `
        <div class="reply-input-container" id="reply-input-container-${parentId}">
            <textarea class="form-control mb-2" id="reply-input-${parentId}"></textarea>
            <button class="btn btn-primary" id="reply-button-${parentId}" onclick="addReply(${parentId})" disabled>대댓글 달기</button>
        </div>
    `;
    const parentCommentElement = document.querySelector(`#comment-content-${parentId}`).parentNode;
    parentCommentElement.insertAdjacentHTML('afterend', replyInputHTML);

    // textarea와 버튼의 참조를 가져옴
    const textarea = document.getElementById(`reply-input-${parentId}`);
    const replyButton = document.getElementById(`reply-button-${parentId}`);

    // textarea에 입력 이벤트 리스너를 추가하여 버튼의 활성화 상태를 업데이트
    textarea.addEventListener('input', function () {
        // textarea의 값이 비어있지 않은 경우에만 버튼을 활성화
        replyButton.disabled = !this.value.trim();
    });
}

// 모든 대댓글 창을 닫는 함수
function closeAllReplyInputs() {
    for (const parentId in replyInputsState) {
        if (replyInputsState.hasOwnProperty(parentId) && replyInputsState[parentId]) {
            const replyInputContainer = document.getElementById(`reply-input-container-${parentId}`);
            if (replyInputContainer) {
                replyInputContainer.remove();
                replyInputsState[parentId] = false;
            }
        }
    }
}

// 대댓글 입력 UI 표시/숨기기 함수
function toggleReplyInput(parentId) {
    // 대댓글 상태 확인
    const replyInputContainer = document.getElementById(`reply-input-container-${parentId}`);
    if (replyInputContainer) {
        const isOpen = replyInputsState[parentId];
        if (isOpen) {
            // 대댓글 입력 UI가 열려있으면 닫음
            replyInputContainer.remove();
            replyInputsState[parentId] = false;
        } else {
            // 대댓글 입력 UI가 닫혀있으면 열기
            showReplyInput(parentId);
            replyInputsState[parentId] = true;
        }
    } else {
        // 대댓글 입력 UI가 없으면 새로 열기
        showReplyInput(parentId);
        replyInputsState[parentId] = true;
    }
}

// 편집 모달을 표시하고 데이터를 처리하는 함수
function editComment(commentId, originalContent) {
    const editModal = document.getElementById('commentEditModal');
    const editModalInstance = new bootstrap.Modal(editModal);

    // 기존 댓글 내용을 편집 폼에 세팅
    editModal.querySelector('#commentEditTextarea').value = originalContent;

    // 모달 내 저장 버튼에 이벤트 리스너 추가
    const saveBtn = editModal.querySelector('#commentEditSaveBtn');
    saveBtn.onclick = function () {
        const updatedContent = editModal.querySelector('#commentEditTextarea').value;
        updateComment(commentId, updatedContent);
        editModalInstance.hide();
    };

    editModalInstance.show();
}

function deleteComment(commentId) {
    const confirmDeleteBtn = document.querySelector('#commentDeleteModalLabel');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.replaceWith(confirmDeleteBtn.cloneNode(true));

        document.getElementById('commentConfirmDeleteBtn').addEventListener('click', function () {
            deleteCommentFetch(commentId);
        });

        const deleteModal = new bootstrap.Modal(document.getElementById('commentDeleteModal'));
        deleteModal.show();
    } else {
        console.error('삭제 확인 버튼을 찾을 수 없습니다.');
    }
}

//대댓글을 추가하는 함수.
function addReply(parentId) {
    const childCommentData = {};
    childCommentData.content = document.getElementById(`reply-input-${parentId}`).value;
    childCommentData.parentId = parentId;
    childCommentData.postNum = getPostNumber();
    childCommentData.user_id = "";

    fetch('api/comments/child/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(childCommentData),
    })
        .then(res => {
            if (!res.ok) {
                throw new error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if(!data.success){
                alert('대댓글을 작성중에 에러가 발생했습니다.');
                window.location.reload();
                return;
            }
            window.location.reload();
        })
        .catch(err => {
            alert("대댓글을 작성중에 에러가 발생했습니다.");
            console.error(`에러발생 ${err}`);
            window.location.href = "/";
        })
}

//편집한 내용의 댓글내용을 업데이트 하는 함수. 
function updateComment(commentId, originalContent) {
    fetch('/api/comments/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentId, originalContent })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert('댓글을 업데이트중에 에러가 발생했습니다.');
                window.location.reload();
                return;
            }
            window.location.reload();
        })
        .catch(err => {
            alert('댓글을 삭제중에 에러가 발생했습니다.');
            console.error(`에러발생 ${err}`);
            window.location.href = "/";
        })
}

//댓글을 delete 하는 함수 
function deleteCommentFetch(commentId) {
    fetch('/api/comments/delete', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentId })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert('댓글을 삭제중에 에러가 발생했습니다.');
                window.location.reload();
                return;
            }
            window.location.reload();
        })
        .catch(err => {
            alert('댓글을 삭제중에 에러가 발생했습니다.');
            console.error(`에러발생 ${err}`);
            window.location.href = "/";
        })
}

function getCommentData(userData) {
    const postNumber = getPostNumber();
    fetch(`/api/comments/get?query=${postNumber}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert('댓글을 가져오는중에 에러가 발생했습니다.');
                window.location.reload();
                return;
            }
            displayComments(data.commentData, userData);
        })
        .catch(err => {
            alert('댓글을 가져오는중에 에러가 발생했습니다.');
            console.error(`에러발생 ${err}`);
            window.location.href = "/";
        })
}

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkLogin();
    if (!userData.isLogin) {
        getCommentData("");
    } else {
        getCommentData(userData.decoded.id);
    }
})