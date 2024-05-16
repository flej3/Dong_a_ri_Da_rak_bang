async function getClubRankingList(){
    try {
        const response = await fetch('/api/club/ranking', {
            method:"GET",
            headers:{
                'Content-Type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();

        if (data.success) {
            updateClubRankingArea(data.rankingList.slice(0, 3));
            setupSearch(data.fullClubList, data.rankingList);
        }

    } catch (error) {
        console.error(`에러: ${error}`);
        alert('동아리 랭킹 목록을 불러오지 못했습니다.');
        window.location.reload();
    }
}

function updateClubRankingArea(rankingList) {
    const clubRankingArea = document.getElementById('clubRankingArea');
    clubRankingArea.innerHTML = '';

    rankingList.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('col-md-4');
        card.innerHTML = `
            <a href="/club-introduction?category=${item.category}">
                <div class="card mb-4">
                    <div class="card-body text-center">
                        <img src="../assets/img/${index + 1}th-trophy.png" alt="${index + 1}위 트로피" class="img-fluid mt-1 trophy">
                        <h5 class="card-title mt-2">${index + 1}위: ${item.club_name}</h5>
                        <p class="card-text">축하합니다!<br>총 좋아요 수: ${item.count}</p>
                    </div>
                </div>
            </a>
        `;
        clubRankingArea.appendChild(card);
    });
}

function setupSearch(fullClubList, rankingList) {
    const searchInput = document.getElementById('searchClub');
    const clubRankingArea = document.getElementById('clubRankingArea');

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.toLowerCase().trim();
        const club = fullClubList.find(item => item.club_name.toLowerCase() === query);

        clubRankingArea.innerHTML = '';

        if (!query) {
            updateClubRankingArea(rankingList.slice(0, 3));
            return;
        }

        if (club) {
            const ranking = rankingList.find(item => item.category === club.category);
            if (ranking) {
                const card = createRankingCard(ranking, rankingList.indexOf(ranking)+1);
                clubRankingArea.appendChild(card);
            } else {
                const card = createRankingCard({ club_name: club.club_name, category: club.category });
                clubRankingArea.appendChild(card);
            }
        } else {
            const card = createNotFoundAlert(query);
            clubRankingArea.appendChild(card);        
        }
    });
}

function getRankingImg(rank){
    let rankImg = "";
    switch(rank){
        case 1:
            rankImg = "1th-trophy";
            break;
        case 2:
            rankImg = "2th-trophy";
            break;
        case 3:
            rankImg = "3th-trophy";
            break;
        default:
            rankImg = "0th-trophy";
            break;
    }
    return rankImg;
}

function createRankingCard(ranking, index) {
    const rankImg = getRankingImg(index);
    const card = document.createElement('div');
    card.classList.add('col-md-4');
    if(index){
        card.innerHTML = `
        <a href="/club-introduction?category=${ranking.category}">
            <div class="card mb-4">
                <div class="card-body text-center">
                    <img src="../assets/img/${rankImg}.png" alt="${index+1}위 트로피" class="img-fluid mt-1 trophy">
                    <h5 class="card-title mt-2">${index}위: ${ranking.club_name}</h5>
                    <p class="card-text">축하합니다!<br>총 좋아요 수: ${ranking.count}</p>
                </div>
            </div>
        </a>
    `;
    }else{
        card.innerHTML = `
        <a href="/club-introduction?category=${ranking.category}">
            <div class="card mb-4">
                <div class="card-body text-center">
                <img src="../assets/img/empty-Trophy.png" alt="좋아요 부족 트로피" class="img-fluid mt-1 trophy">
                <h5 class="card-title mt-2">${ranking.club_name}</h5>
                    <p class="card-text">1개 이상의 동아리<br>"좋아요!"가 필요합니다.</p>
                </div>
            </div>
        <a>
    `;
    }
    return card;
}

function createNotFoundAlert(clubName = '') {
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('alert', 'alert-warning', 'mt-3', 'd-flex', 'align-items-center');
    alertContainer.setAttribute('role', 'alert');
    alertContainer.innerHTML = `
        <div>
            <h4 class="alert-heading">아쉽게도 찾고 계신 동아리를 찾을 수 없습니다 😢</h4>
            <p>${clubName ? `<strong>${clubName}</strong>에 대한 검색 결과가 없습니다. ` : ''}검색어를 확인하고 다시 시도해 주세요.</p>
        </div>
    `;
    return alertContainer;
}

document.getElementById('clubRankingBtn').addEventListener('click', async () => {
    getClubRankingList();
})