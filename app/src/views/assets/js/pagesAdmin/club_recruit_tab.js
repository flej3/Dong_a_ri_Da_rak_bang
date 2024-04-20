document.addEventListener('click', (event) => {
    if (event.target.matches('#ClubRecruitPostBtn')) {
        window.location.href = "/write-post";
    }
});

function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function getClubRecruitPost() {
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/recruitPost/list/get?query=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const clubRecruitPostList = await response.json();

        if (clubRecruitPostList.recruitPostList.length === 0) {
            showNoPostsUI();
            return;
        }

        displayRecruitPosts(clubRecruitPostList.recruitPostList);

    } catch (error) {
        alert(`동아리 모집 공고 리스트를 가져오던중 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

function goToPost(postNum) {
    window.location.href = `/view-recruit-post?query=${postNum}`;
}

function showNoPostsUI() {
    const container = document.getElementById('recruitPostsContainer');
    container.innerHTML = '';

    const noPostsDiv = document.createElement('div');
    noPostsDiv.classList.add('no-posts-message');
    noPostsDiv.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle-fill"></i> 게시글이 없습니다. <a href="/write-post" class="alert-link">새로운 게시글을 작성해보세요!</a>
        </div>
        `;
    container.appendChild(noPostsDiv);
}

function displayRecruitPosts(posts) {
    const container = document.getElementById('recruitPostsContainer');
    container.innerHTML = '';

    const currentDate = new Date();

    posts.forEach(post => {
        const deadDate = new Date(post.dead_day);
        const isClosed = deadDate < currentDate;

        // 마감된 게시물의 뱃지를 'bg-danger'로 변경하여 더 눈에 띄게 함
        const closedText = isClosed ? `<span class="badge bg-danger">마감됨</span>` : '';

        const cardHtml = `
            <div class="card mb-3 shadow team-card" onclick="goToPost(${post.post_number})" style="max-height: 220px;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="assets/img/card.jpg" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body py-2">
                            <div class="row">
                                <div class="col-12">
                                    <span class="badge bg-secondary me-2">번호 #${post.post_number}</span>
                                    ${closedText}
                                    <h5 class="card-title d-inline mb-2">${post.club_name} - ${post.title}</h5>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <p class="card-text mb-1"><small class="text-muted"><i class="fas fa-user"></i> 작성자: ${post.writer}</small></p>
                                </div>
                                <div class="col-6">
                                    <p class="card-text mb-1"><i class="fas fa-users"></i> 모집인원: <span class="badge bg-primary">${post.recruit_num}명</span></p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <p class="card-text mb-1"><small><i class="fas fa-calendar-alt"></i> 게시일: ${post.create_day.split('T')[0]}</small></p>
                                </div>
                                <div class="col-6">
                                    <p class="card-text mb-1"><small><i class="fas fa-calendar-check"></i> 모집 종료일: <strong>${post.dead_day.split('T')[0]}</strong></small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await getClubRecruitPost();
})