// assets/js/main.js

async function getClubLikesCount(category){
    try {
        const response = await fetch(`/api/club/likes/count?category=${category}`, {
            method:"GET",
            headers: {
                "Content-Type": "Application/json",
            },
        });
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();
        const count = data.clubLikesCount;
        return count;
    } catch (error) {
        console.error(`해당 동아리의 좋아요 정보를 받아오던중 에러발생: ${error}`);
        alert(`해당 동아리의 좋아요 정보를 받아오던중 에러발생 ${error}`);
        window.location.reload();
    }
}

// 카드를 생성하는 함수
async function createClubCard(club) {
    const { twitter_link, facebook_link, instagram_link } = club;
    const twitterLink = twitter_link || '';
    const facebookLink = facebook_link || '';
    const instagramLink = instagram_link || '';

    let setDisplayTwitter = "none";
    let setDisplayFacebook = "none";
    let setDisplayInstagram = "none";

    if(twitterLink !== ''){
        setDisplayTwitter = "inline-block"
    }
    if(facebookLink !== ''){
        setDisplayFacebook = "inline-block"
    }
    if(instagramLink !== ''){
        setDisplayInstagram = "inline-block"
    }

    const count = await getClubLikesCount(club.category);
    return `
    <div class="col-md-4 mb-4 team-card">
        <a href="/Page-clubAdmin?query=${club.category}" style="margin: auto;">
        <div class="card h-100">
            <img id="club-introduction-page-profile-img-${club.category}" src="${club.profile_img_route}" alt="Profile" class="rounded-circle" style="width: 300px;">
            <div class="card-body profile-card">
                <h2 class="card-title text-center">동아리명: ${club.club_name}<br/>담당자: ${club.user_name}</h2>
                <h3 class="card-subtitle mb-3 text-center">나의 직위: ${club.position}</h3>
                <div class="text-center">
                <a href=${twitterLink} id = twitterBtn-${club.category} class="btn btn-outline-primary me-2 twitter-link-${club.category}" target="_blank" style="display: ${setDisplayTwitter}"><i class="bi bi-twitter"></i></a>
                <a href=${facebookLink} id = facebookBtn-${club.category} class="btn btn-outline-primary me-2 facebook-link-${club.category}" target="_blank" style="display: ${setDisplayFacebook}"><i class="bi bi-facebook"></i></a>
                <a href=${instagramLink} id = instagramBtn-${club.category} class="btn btn-outline-primary me-2 instagram-link-${club.category}" target="_blank" style="display: ${setDisplayInstagram}"><i class="bi bi-instagram"></i></a>
                <a href="#" id="heartBtn-${club.category}" class="btn btn-outline-danger me-2" onclick="handleHeartClick(event, '${club.category}')"><i class="bi bi-heart"></i>
                    <span id="likeCount-${club.category}">${count}</span>
                </a>
                </div>
                <div class="text-center mt-3">
                    <button class="clubResignationBtn btn btn-danger club-resignation-${club.category}" data-bs-toggle="modal" data-bs-target="#clubResignationModal">탈퇴하기</button>
                </div>
            </div>
        </div>
        </a>
    </div>
    `;
}

async function isClubLike(){
    try {
        const response = await fetch('/api/club/like', {
            method: 'GET',
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();
        data.clubLikes.forEach(category => {
            const heartIcon = document.querySelector(`#heartBtn-${category.category} i`);
            if(heartIcon){
                heartIcon.classList.remove('bi-heart');
                heartIcon.classList.add('bi-heart-fill');
            }
        })
    } catch (error) {
        console.error(`"좋아요" 정보를 불러오던중 에러 발생: ${error}`);
        alert(`"좋아요" 정보를 가져오지 못했습니다. ${error}`);
        window.location.reload();
    }
}

async function addClubLike(category){
    try {
        const response = await fetch('/api/club/like/add', {
            method: 'POST',
            body: JSON.stringify({category}),
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
    } catch (error) {
        console.error(`"좋아요"를 하던중 에러 발생: ${error}`);
        alert(`"좋아요"를 추가하지 못했습니다. ${error}`);
        window.location.reload();
    }
}

async function deleteClubLike(category){
    try {
        const response = await fetch('/api/club/like/delete', {
            method: 'DELETE',
            body: JSON.stringify({category}),
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
    } catch (error) {
        console.error(`"좋아요"를 제거하던중 에러 발생: ${error}`);
        alert(`"좋아요"를 제거하지 못했습니다. ${error}`);
        window.location.reload();
    }
}

async function handleHeartClick(event, category){
    event.preventDefault();
    const heartIcon = document.querySelector(`#heartBtn-${category} i`);
    const isFilled = heartIcon.classList.contains('bi-heart-fill');

    if (isFilled) {
        try {
            await deleteClubLike(category);
            heartIcon.classList.remove('bi-heart-fill');
            heartIcon.classList.add('bi-heart');
            const count = await getClubLikesCount(category);
            document.getElementById(`likeCount-${category}`).innerText = count;
        } catch (error) {
            console.error(`좋아요를 제거하는 중 오류 발생: ${error}`);
            alert(`좋아요를 제거하지 못했습니다. ${error}`);
        }
    } else {
        try {
            await addClubLike(category);
            heartIcon.classList.remove('bi-heart');
            heartIcon.classList.add('bi-heart-fill');
            const count = await getClubLikesCount(category);
            document.getElementById(`likeCount-${category}`).innerText = count;
        } catch (error) {
            console.error(`좋아요를 추가하는 중 오류 발생: ${error}`);
            alert(`좋아요를 추가하지 못했습니다. ${error}`);
        }
    }
}

async function fetchAndDisplayClubs() {
    try {
        const response = await fetch('/get-clubs', {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        const clubsContainer = document.getElementById('container');
        if (data && data.clubs && data.clubs.length > 0) {
            for (const club of data.clubs) {
                const cardHtml = await createClubCard(club);
                clubsContainer.insertAdjacentHTML('beforeend', cardHtml);
            }
        } else {
            displayNoClubMessage();
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert('가입된 동아리 리스트를 가져오지 못했습니다.')
    }
}

function fillClubResinationModal(clubData){
    document.getElementById('resignClubName').innerText = clubData.club_name;
    document.getElementById('resignClubAffiliation').innerText = clubData.affilition;

    const clubResignationModalBtn = document.getElementById('clubResignationModalBtn');
    clubResignationModalBtn.setAttribute('category', clubData.category);
}

async function getClubData(cateogory){
    try {
        const response = await fetch(`/api/club/data/get?category=${cateogory}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        })
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        fillClubResinationModal(data.clubData);
    } catch (error) {
        console.error(`클럽 정보를 가져오지 못했습니다. ${error}`);
        alert(`클럽 정보를 가져오지 못했습니다. ${error}`);
        window.location.reload();
    }
}

function handleClubResignationBtnClick(event) {
    const btn = event.target;
    const classes = btn.className.split(' ')[3];
    const category = classes.split('-')[2];
    return category;
}

async function checkClubOwner(category){
    try {
        const response = await fetch(`/api/club/owner/resignation/check?category=${category}`, {
            method:"GET",
            headers: {
                'Content-Type':'Application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        return data.isClubOwner;
    } catch (error) {
        console.error(`동아리 회장여부를 확인 못했습니다. ${error}`);
        alert(`동아리 회장여부를 확인 못했습니다. ${error}`);
        window.location.reload();
    }
}

document.getElementById('clubResignationModalBtn').addEventListener('click', async () => {
    try {
        const category = document.getElementById('clubResignationModalBtn').getAttribute('category');
        const isClubOwner = await checkClubOwner(category);
        if(isClubOwner){
            alert('해당 동아리의 대표는 권한을 위임해야 탈퇴가 가능합니다.');
            return;
        }

        const response = await fetch("/api/club/resignation/delete", {
            method:"DELETE",
            body: JSON.stringify({category}),
            headers: {
                'Content-Type':'Application/json',
            },
        });
        if(!response.ok){
            throw new Error(`네트워크 응답이 올바르지 않습니다.`);
        }
        const data = await response.json();
        updateMemberCount();
        alert('동아리를 탈퇴 하였습니다!');
        window.location.reload();
    } catch (error) {
        console.error(`클럽 정보를 가져오지 못했습니다. ${error}`);
        alert(`클럽 정보를 가져오지 못했습니다. ${error}`);
        window.location.reload();
    }
})

async function displayNoClubMessage() {
    const tableContainer = document.getElementById('alertContainer');
    const noApplicationsMessage = document.createElement('div');
    noApplicationsMessage.classList.add('alert', 'alert-info');
    noApplicationsMessage.textContent = '가입된 동아리가 없으시군요! 관심 있는 동아리를 찾아보고 지금 바로 가입하세요.';
    tableContainer.appendChild(noApplicationsMessage);
    const button = document.createElement('button');
    button.textContent = '새로운 동아리 찾기';
    button.classList.add('btn', 'btn-primary');

    noApplicationsMessage.insertAdjacentElement('afterend', button);

    button.addEventListener('click', function() {
        window.location.href = '../';
    });
    // 로그인 상태에 따라 메시지 표시
    const isLogin = await checkLogin();
    if (!isLogin.isLogin) {
        displayLoginPromptMessage(tableContainer);
        return;
    }
}

// DOMContentLoaded 이벤트 핸들러에서 fetchAndDisplayClubs 함수 호출
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndDisplayClubs();
    await isClubLike();

    document.querySelectorAll('.clubResignationBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const category = handleClubResignationBtnClick(event);
            tempCategory = category;
            await getClubData(category);
        });
    });
});

let tempCategory;
async function updateMemberCount() {
    if(tempCategory !== null) {
        try {
            const response = await fetch(`/update/memberCount?query=${tempCategory}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'Application/json',
                },
            });

            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }

        } catch (error) {
            alert(`에러가 발생했습니다. ${error}`);
            console.error(`에러가 발생했습니다. ${error}`);
            window.location.reload();
        }
    }
}