// 클럽 목록 가져오기
function fetchClubList() {
    fetch('/api/clubs', {
        method: "GET",
        headers: {
            'Content-Type': 'Application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(clubs => {
            if(!clubs.success){
                throw new Error("동아리 목록을 불러오지 못했습니다.");
            }
            displayClubList(clubs.clubsList);
        })
        .catch(err => {
            console.error(`에러: ${err}`);
            alert('동아리 목록을 불러오지 못했습니다.');
            window.location.href = "/";
        });
}

// 클럽 목록을 화면에 표시
function displayClubList(clubs) {
    const clubTableBody = document.getElementById('club-table-body');

    clubs.forEach(club => {
        const row = document.createElement('tr');
        // row.classList.add('category-container');
        row.addEventListener('click', () => {
            console.log(`${club.category} 클릭됨`);
            window.location.href = `/club-introduction?category=${club.category}`;
        })
        row.innerHTML = `
            <td>${club.club_name}</td>
            <td>${club.club_owner}</td>
            <td>${club.member_count}</td>
            <td>${club.affilition}</td>
        `;
        clubTableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", fetchClubList);
