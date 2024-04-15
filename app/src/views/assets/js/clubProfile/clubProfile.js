// assets/js/main.js

// 카드를 생성하는 함수
function createClubCard(club) {
    return `
    <div class="col-md-4 mb-4 team-card">
    <a href="/Page-clubAdmin?query=${club.category}" style="margin: auto;">
      <div class="card h-100">
        <img src="../../assets/img/hs-logo.png" alt="">
        <div class="card-body profile-card">
          <h2 class="card-title text-center">동아리명: ${club.club_name}</h2>
          <h3 class="card-subtitle mb-3 text-center">직위: ${club.position}</h3>
          <div class="text-center">
            <a href="#" class="btn btn-outline-primary me-2"><i class="bi bi-twitter"></i></a>
            <a href="#" class="btn btn-outline-primary me-2"><i class="bi bi-facebook"></i></a>
            <a href="#" class="btn btn-outline-primary me-2"><i class="bi bi-instagram"></i></a>
            <a href="#" class="btn btn-outline-primary"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
      </a>
    </div>
  `;
}

function fetchAndDisplayClubs() {
    fetch('/get-clubs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(clubs => {
            const clubsContainer = document.getElementById('container');
            (clubs.clubs).forEach(club => {
                const cardHtml = createClubCard(club);
                clubsContainer.insertAdjacentHTML('beforeend', cardHtml);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// DOMContentLoaded 이벤트 핸들러에서 fetchAndDisplayClubs 함수 호출
document.addEventListener('DOMContentLoaded', fetchAndDisplayClubs);
