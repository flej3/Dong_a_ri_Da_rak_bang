// assets/js/main.js

// 카드를 생성하는 함수
function createClubCard(club) {
    const { twitter_link, facebook_link, instagram_link } = club;
    const twitterLink = twitter_link || '';
    const facebookLink = facebook_link || '';
    const instagramLink = instagram_link || '';

    // const setDisplayTwitter = twitterLink
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

    return `
    <div class="col-md-4 mb-4 team-card">
        <a href="/Page-clubAdmin?query=${club.category}" style="margin: auto;">
        <div class="card h-100">
            <img src="../../assets/img/hs-logo.png" alt="">
            <div class="card-body profile-card">
                <h2 class="card-title text-center">동아리명: ${club.club_name}</h2>
                <h3 class="card-subtitle mb-3 text-center">직위: ${club.position}</h3>
                <div class="text-center">
                <a href=${twitterLink} id = twitterBtn-${club.category} class="btn btn-outline-primary me-2 twitter-link-${club.category}" target="_blank" style="display: ${setDisplayTwitter}"><i class="bi bi-twitter"></i></a>
                <a href=${facebookLink} id = facebookBtn-${club.category} class="btn btn-outline-primary me-2 facebook-link-${club.category}" target="_blank" style="display: ${setDisplayFacebook}"><i class="bi bi-facebook"></i></a>
                <a href=${instagramLink} id = instagramBtn-${club.category} class="btn btn-outline-primary me-2 instagram-link-${club.category}" target="_blank" style="display: ${setDisplayInstagram}"><i class="bi bi-instagram"></i></a>
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
        (data.clubs).forEach(club => {
            const cardHtml = createClubCard(club);
            clubsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
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
        alert('동아리를 탈퇴 하였습니다!');
        window.location.reload();
    } catch (error) {
        console.error(`클럽 정보를 가져오지 못했습니다. ${error}`);
        alert(`클럽 정보를 가져오지 못했습니다. ${error}`);
        window.location.reload();
    }
})

// DOMContentLoaded 이벤트 핸들러에서 fetchAndDisplayClubs 함수 호출
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndDisplayClubs();

    document.querySelectorAll('.clubResignationBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const category = handleClubResignationBtnClick(event);
            await getClubData(category);
        });
    });
});
