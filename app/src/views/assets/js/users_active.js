document.addEventListener('DOMContentLoaded', async () => {
    const isLogin = await checkLogin();
    if(!(isLogin.isLogin)) {
        alert("비정상적인 접근입니다."+'\n'+"메인 화면으로 이동합니다.");
        window.location.href = "/";
    } else {
       await getUserComment();
    }

});

document.getElementById('like-post-tab').addEventListener('click', async (event) => {
    await getUserLikePost();
});

document.getElementById('like-club-tab').addEventListener('click', async (event) => {
    await getUserClubLike();
});

function extractTextFromDelta(delta) {
    return delta.ops.map(op => {
        if (typeof op.insert === 'string') {
            return op.insert.trim();
        } else if (typeof op.insert === 'object' && op.insert.image) {
            return "(사진)";
        } else {
            return ""; // 다른 데이터 형식에 대한 처리
        }
    }).join('');
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

async function getUserComment() {
    try {
        const response = await fetch(`/api/getUserComment`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        const comments = [];
        for (let i = 0; i < data.result.length; i++) {
            const dateString = data.result[i].created_at;
            const date = new Date(dateString);
            const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('.', '');

            comments.push({ title: data.result[i].title, date: formattedDate, content: data.result[i].content, pNumber: data.result[i].post_number });
        }

        const itemsPerPage = 10;
        let currentPage = 1;

        function renderComments(page) {
            const listGroup = document.getElementById('comment-list-group');
            listGroup.innerHTML = '';

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageComments = comments.slice(start, end);

            pageComments.forEach(comment => {
                const listGroupItem = document.createElement('div');
                listGroupItem.classList.add('list-group-item');

                listGroupItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">게시물 제목 : ${comment.title}</h6>
                        <small>${comment.date}</small>
                    </div>
                    <p class="mb-1">댓글 내용 : ${comment.content}</p>
                `;
                listGroupItem.addEventListener('click', () => {
                    window.location.href = `/view-recruit-post?query=${comment.pNumber}`;
                });
                listGroup.appendChild(listGroupItem);
            });
        }

        function renderPagination() {
            const pagination = document.getElementById('pagination-comment');
            pagination.innerHTML = '';

            const pageCount = Math.ceil(comments.length / itemsPerPage);

            for (let i = 1; i <= pageCount; i++) {
                const pageItem = document.createElement('li');
                pageItem.classList.add('page-item');
                if (i === currentPage) {
                    pageItem.classList.add('active');
                }

                const pageLink = document.createElement('a');
                pageLink.classList.add('page-link');
                pageLink.href = '#';
                pageLink.innerText = i;

                pageLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    currentPage = i;
                    renderComments(currentPage);
                    renderPagination();
                });

                pageItem.appendChild(pageLink);
                pagination.appendChild(pageItem);
            }
        }

        renderComments(currentPage);
        renderPagination();

    } catch (error) {
        console.error('네트워크 오류:', error);
    }
}

async function getUserClubLike() {
    try {
        const response = await fetch(`/api/getUserLikeClub`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        const comments = [];
        for(let i = 0; i < data.result.length; i++) {
            comments.push({ title: data.result[i].club_name, affilition: data.result[i].affilition, category: data.result[i].category });
        }

        const itemsPerPage = 10;
        let currentPage = 1;

        function renderComments(page) {
            const listGroup = document.getElementById('club-list-group');
            listGroup.innerHTML = '';

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageComments = comments.slice(start, end);

            pageComments.forEach(comment => {
                const listGroupItem = document.createElement('div');
                listGroupItem.classList.add('list-group-item');

                listGroupItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">동아리명 : ${comment.title}</h6>
                    </div>
                    <p class="mb-1">소속 : ${comment.affilition}</p>
                `;
                listGroupItem.addEventListener('click', () => {
                    window.location.href = `/club-introduction?category=${comment.category}`;
                });
                listGroup.appendChild(listGroupItem);
            });
        }

        function renderPagination() {
            const pagination = document.getElementById('pagination-club');
            pagination.innerHTML = '';

            const pageCount = Math.ceil(comments.length / itemsPerPage);

            for (let i = 1; i <= pageCount; i++) {
                const pageItem = document.createElement('li');
                pageItem.classList.add('page-item');
                if (i === currentPage) {
                    pageItem.classList.add('active');
                }

                const pageLink = document.createElement('a');
                pageLink.classList.add('page-link');
                pageLink.href = '#';
                pageLink.innerText = i;

                pageLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    currentPage = i;
                    renderComments(currentPage);
                    renderPagination();
                });

                pageItem.appendChild(pageLink);
                pagination.appendChild(pageItem);
            }
        }

        renderComments(currentPage);
        renderPagination();

    } catch (error) {
        console.error('네트워크 오류:', error);
    }
}

async function getUserLikePost() {
    try {
        const response = await fetch(`/api/getUserLikePost`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        const comments = [];
        for(let i = 0; i < data.result.length; i++) {
                    const dateString = data.result[i].create_day;
                    const date = new Date(dateString);
                    const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('.', '');
                    const jsonData = data.result[i].content;
                    const parsedData = JSON.parse(jsonData);
                    comments.push({ title: data.result[i].title, date: formattedDate, content: extractTextFromDelta(parsedData), pNumber: data.result[i].post_number });
                }

        const itemsPerPage = 10;
        let currentPage = 1;

        function renderComments(page) {
            const listGroup = document.getElementById('post-list-group');
            listGroup.innerHTML = '';

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageComments = comments.slice(start, end);

            pageComments.forEach(comment => {
                const listGroupItem = document.createElement('div');
                listGroupItem.classList.add('list-group-item');

                listGroupItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">게시물 제목 : ${comment.title}</h6>
                        <small>${comment.date}</small>
                    </div>
                    <p class="mb-1">게시글 내용 : ${comment.content}</p>
                `;
                listGroupItem.addEventListener('click', () => {
                    window.location.href = `/view-recruit-post?query=${comment.pNumber}`;
                });
                listGroup.appendChild(listGroupItem);
            });
        }

        function renderPagination() {
            const pagination = document.getElementById('pagination-post');
            pagination.innerHTML = '';

            const pageCount = Math.ceil(comments.length / itemsPerPage);

            for (let i = 1; i <= pageCount; i++) {
                const pageItem = document.createElement('li');
                pageItem.classList.add('page-item');
                if (i === currentPage) {
                    pageItem.classList.add('active');
                }

                const pageLink = document.createElement('a');
                pageLink.classList.add('page-link');
                pageLink.href = '#';
                pageLink.innerText = i;

                pageLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    currentPage = i;
                    renderComments(currentPage);
                    renderPagination();
                });

                pageItem.appendChild(pageLink);
                pagination.appendChild(pageItem);
            }
        }

        renderComments(currentPage);
        renderPagination();

    } catch (error) {
        console.error('네트워크 오류:', error);
    }
}