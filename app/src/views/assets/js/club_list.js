// 클럽 목록 가져오기
function fetchClubList() {
    fetch('/api/clubs')
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            return response.json();
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
    const clubTableBody = document.getElementById('club-table-body');

    clubs.forEach(club => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${club.club_name}</td>
            <td>${club.club_owner}</td>
            <td>${club.member_count}</td>
            <td>${club.affiliation}</td>
        `;
        clubTableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", fetchClubList);
