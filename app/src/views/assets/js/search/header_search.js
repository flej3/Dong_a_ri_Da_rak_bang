function searchUser(event) {
    event.preventDefault(); // 폼의 기본 동작인 페이지 새로고침을 막습니다.

    const searchQuery = document.getElementById('searchQuery').value; // 검색어를 가져옵니다.
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
}

document.getElementById('searchForm').addEventListener('submit', searchUser);
