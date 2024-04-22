// 클럽 목록 가져오기
function fetchClubList() {
    fetch('/api/clubs')
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            return response.json();ㅇ
        })
        .then(clubs => {
            displayClubList(clubs);
        })
        .catch(err => {
            console.error(`에러: ${err}`);
        });
}

// 클럽 목록을 화면에 표시
function displayClubList(clubs) {
    const clubListElement = document.getElementById('clubList');

    clubs.forEach(club => {
        const clubItem = document.createElement('li');
        clubItem.textContent = club.name;
        clubListElement.appendChild(clubItem);
    });
}

document.addEventListener("DOMContentLoaded", fetchClubList);