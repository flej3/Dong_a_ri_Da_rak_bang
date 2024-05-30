let currentSortOrder = 'asc';
let currentSortField = 'club_name';
let previousCategory = 'all';

// 클럽 목록 가져오기
function fetchClubList(affilition = 'all', sortField = currentSortField, sortOrder = currentSortOrder, searchQuery = '') {
    let url = `/api/clubs/${affilition}?sortField=${sortField}&sortOrder=${sortOrder}&searchQuery=${searchQuery}`;

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
        displayClubList(clubs.clubsList, searchQuery);
    })
    .catch(err => {
        console.error(`에러: ${err}`);
        if (searchQuery && searchQuery.trim() !== '') {
            alert(`"${searchQuery}"라는 동아리는 없습니다.`);
        }
    });
}

// 클럽 목록을 화면에 표시
function displayClubList(clubs, searchQuery) {
    const clubTableBody = document.getElementById('club-table-body');
    clubTableBody.innerHTML = '';

    if (clubs.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 4;
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '20px';
        if (searchQuery && searchQuery.trim() !== '') {
            emptyCell.textContent = `"${searchQuery}"라는 동아리는 없습니다.`;
        } else {
            emptyCell.textContent = "해당 탭에 동아리가 없습니다.";
        }
        emptyRow.appendChild(emptyCell);
        clubTableBody.appendChild(emptyRow);
        return;
    }

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

// 페이지 로드 시 전체 동아리 목록 가져오기
document.addEventListener("DOMContentLoaded", () => {
    fetchClubList();
});

// 카테고리 클릭 이벤트 리스너
document.querySelectorAll('.category-container').forEach(category => {
    category.addEventListener('click', async () => {
        document.querySelectorAll('.category-container').forEach(cat => cat.classList.remove('active'));
        category.classList.add('active');
        
        previousCategory = category.dataset.category;
        document.getElementById('searchInput').value = '';
        
        const selectedAffilition = category.dataset.category;
        await fetchClubList(selectedAffilition, currentSortField, currentSortOrder, '');
    });
});

// 정렬 아이콘 클릭 이벤트 리스너
document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', async () => {
        const selectedAffilition = 'all';
        const sortField = header.dataset.sortField;
        const currentOrder = header.querySelector('i').classList.contains('bi-sort-alpha-down') ? 'asc' : 'desc';
        const sortOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        const searchQuery = document.getElementById('searchInput').value;

        currentSortField = sortField;
        currentSortOrder = sortOrder;

        fetchClubList(selectedAffilition, sortField, sortOrder, searchQuery);

        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.classList.remove('bi-sort-alpha-up', 'bi-sort-alpha-down');
            icon.classList.add('bi-sort-alpha-down');
        });

        const currentIcon = header.querySelector('i');
        if (currentOrder === 'asc') {
            currentIcon.classList.remove('bi-sort-alpha-down');
            currentIcon.classList.add('bi-sort-alpha-up');
        } else {
            currentIcon.classList.remove('bi-sort-alpha-up');
            currentIcon.classList.add('bi-sort-alpha-down');
        }
    });
});

// 검색 함수
function handleSearch() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    const selectedAffilition = 'all';
    fetchClubList(selectedAffilition, currentSortField, currentSortOrder, searchQuery);

    //searchInput.value = '';

    document.querySelectorAll('.category-container').forEach(cat => cat.classList.remove('active'));
}

// 검색 버튼 클릭 이벤트 리스너
document.getElementById('searchButton').addEventListener('click', handleSearch);

// 엔터 키로 검색
document.getElementById("searchInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
    }
});
