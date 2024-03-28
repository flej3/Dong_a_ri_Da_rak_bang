// function searchUser(event) {
//     event.preventDefault(); // 폼의 기본 동작인 페이지 새로고침을 막습니다.

//     const searchQuery = document.getElementById('searchQuery').value; // 검색어를 가져옵니다.

//     fetch(`/search?query=${searchQuery}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//         .then(res => {
//             if (!res.ok) {
//                 alert('에러가 발생했습니다.');
//                 window.location.href = "/";
//                 throw new Error('네트워크 응답이 올바르지 않습니다.');
//             }
//             return res.json();
//         })
//         .then(data => {
//             console.log(data);
//             window.location.href = `/search-user?query=${encodeURIComponent(searchQuery)}`;
//         })
//         .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);
//         });
// }

// document.getElementById('searchForm').addEventListener('submit', searchUser);

function searchUser(event) {
    event.preventDefault(); // 폼의 기본 동작인 페이지 새로고침을 막습니다.

    const searchQuery = document.getElementById('searchQuery').value; // 검색어를 가져옵니다.
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
}

document.getElementById('searchForm').addEventListener('submit', searchUser);
