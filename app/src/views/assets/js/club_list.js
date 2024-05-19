let currentSortOrder = 'asc';

// 클럽 목록 가져오기
function fetchClubList(affilition = 'all', sort = 'asc') {
    const url = affilition === 'all' ? `/api/clubs?sort=${sort}` : `/api/clubs/${affilition}?sort=${sort}`;
    fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(clubs => {
            if (!clubs.success) {
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
    clubTableBody.innerHTML = '';

    clubs.forEach(club => {
        const row = document.createElement('tr');
        row.classList.add('tr-zoom');
        row.addEventListener('click', () => {
            window.location.href = `/club-introduction?category=${club.category}`;
        });
        row.innerHTML = `
            <td>${club.club_name}</td>
            <td>${club.club_owner}</td>
            <td>${club.member_count}</td>
            <td>${club.affilition}</td>
        `;

        clubTableBody.appendChild(row);
    });
}

// 카테고리 클릭 이벤트 리스너
document.querySelectorAll('.category-container').forEach(category => {
    category.addEventListener('click', () => {
        document.querySelectorAll('.category-container').forEach(cat => cat.classList.remove('active'));
        category.classList.add('active');
        const selectedAffilition = category.dataset.category;
        fetchClubList(selectedAffilition, currentSortOrder);
    });
});

// 정렬 아이콘 클릭 이벤트 리스너
document.getElementById('sortClubName').addEventListener('click', () => {
    const selectedAffilition = document.querySelector('.category-container.active')?.dataset.category || 'all';
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    document.getElementById('sortIcon').className = currentSortOrder === 'asc' ? 'bi bi-sort-alpha-down' : 'bi bi-sort-alpha-up';
    fetchClubList(selectedAffilition, currentSortOrder);
});

// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
    fetchClubList();
});
