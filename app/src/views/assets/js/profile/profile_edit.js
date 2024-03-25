// 이벤트 리스너를 등록할 요소 가져오기
const addClubBtn = document.getElementById('addClubBtn');

// + 버튼에 대한 이벤트 리스너 등록
addClubBtn.addEventListener('click', () => {
    // 새로운 입력 필드 생성
    const newInputGroup = document.createElement('div');
    newInputGroup.classList.add('input-group', 'mb-3');
    newInputGroup.innerHTML = `
        <input type="text" class="form-control" name="clubs[]" placeholder="동아리명">
        <button class="btn btn-outline-secondary remove-club-btn" type="button">-</button>
    `;

    // 생성된 입력 필드를 추가
    container.appendChild(newInputGroup);
});


const container = document.getElementById('clubInputContainer');
// - 버튼에 대한 이벤트 리스너 등록
container.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-club-btn')) {
        const inputGroup = event.target.closest('.input-group');
        inputGroup.remove();
    }
});

// 사용자 입력 값을 가져오는 함수
function getInputValue(id) {
    return document.getElementById(id).value;
}

// 동아리명 입력 필드들의 값을 수집하여 문자열로 만듭니다.
function collectClubNames() {
    const clubInputs = document.querySelectorAll('input[name="clubs[]"]');
    const joinedClubs = Array.from(clubInputs)
        .map(input => input.value.trim()) // 각 입력값의 양쪽 공백을 제거합니다.
        .filter(value => value !== '') // 빈 값이 아닌 것들만 필터링하여 남깁니다.
        .join(','); // 각 클럽명을 쉼표로 구분된 문자열로 합칩니다.
    return joinedClubs;
}

// 새로운 클럽 입력 필드 추가하는 함수
function addClubInput(clubName) {
    const newInputGroup = document.createElement('div');
    newInputGroup.classList.add('input-group', 'mb-3');
    newInputGroup.innerHTML = `
        <input type="text" class="form-control" name="clubs[]" value="${clubName}" placeholder="동아리명">
        <button class="btn btn-outline-secondary remove-club-btn" type="button">-</button>
    `;
    container.appendChild(newInputGroup);
}

function createProfileElements(profileData) {
    document.getElementById('about').value = profileData.about || '';
    document.getElementById('Twitter').value = profileData.twitter_link || '';
    document.getElementById('Facebook').value = profileData.facebook_link || '';
    document.getElementById('Instagram').value = profileData.instagram_link || '';

    const joinedClubs = profileData.joined_clubs ? profileData.joined_clubs.split(',') : [];
    joinedClubs.forEach(clubName => {
        addClubInput(clubName.trim());
    });
}

//이전에 저장한 프로필 불러오기. 있다면 저장한부분부터 이어서 편집.
function checkProfileExistenceAndFetch() {
    fetch('/check-profile-existence', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                alert('에러가 발생했습니다.');
                window.location.href = "/";
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (data.success && data.userProfile) {
                createProfileElements(data.userProfile);
            }
        })
        .catch(err => {
            console.error('프로필을 불러오는 중 에러가 발생했습니다.', err);
        });
}
document.getElementById('profile_edit').addEventListener('click', checkProfileExistenceAndFetch);

//프로필 업데이트
function updateProfile(event) {
    event.preventDefault();

    const userProfile = {
        //user_id는 클라이언트 말고 서버측에서 추가할 예정.
        profile_img_route: `NULL`, //프로필 이미지 아직 미구현
        about: getInputValue('about'),
        joined_clubs: collectClubNames(),
        twitter_link: getInputValue('Twitter'),
        facebook_link: getInputValue('Facebook'),
        instagram_link: getInputValue('Instagram'),
    }
    fetch('/update-user-profile', {
        method: 'POST',
        body: JSON.stringify(userProfile),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                alert('에러가 발생했습니다.');
                window.location.href = "/";
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert(data.message);
                window.location.href = "/";
                return;
            }
            alert(data.message);
            window.location.href = "users-profile";
        })
        .catch(err => {
            console.error('프로필 업데이트중 에러가 발생했습니다.', err);
        });
}

const profileEditForm = document.getElementById('profileEditForm');
profileEditForm.addEventListener('submit', updateProfile);
