function getPostNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');
    return postNum;
}

async function checkLogin() {
    try {
        const response = await fetch('/isLogin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data;
    } catch (err) {
        alert("에러가 발생했습니다.");
        console.error(err);
        window.location.href = "/";
    }
}

document.getElementById('joinClubBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const isUserLoggedIn = await checkLogin();
    if (!isUserLoggedIn.isLogin) {
        return window.location.href = "/pages-login";
    }
    const isJoinedClub = await isJoinedThisClub();
    if(!isJoinedClub){
        return;
    }
    getMemberData();
});

function setJoinClubModal(joinClubUserData){
        document.getElementById('nameInput').innerText = joinClubUserData.user_name;
        document.getElementById('emailInput').innerText = joinClubUserData.user_id;
        document.getElementById('studentIdInput').innerText = joinClubUserData.user_student_id;
        document.getElementById('departmentInput').innerText = joinClubUserData.user_department;
        document.getElementById('phoneInput').innerText = joinClubUserData.user_ph_number;
        
        const joinClubModal = document.getElementById('clubJoinApplicationModal');
        const joinClubModalInstance = new bootstrap.Modal(joinClubModal);
        joinClubModalInstance.show();
}

// "가입신청" 버튼 클릭 시 실행되는 함수
document.getElementById("clubJoinApplicationForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const userJoinClubData = {};

    userJoinClubData.postNum = getPostNumber();
    userJoinClubData.user_id = document.getElementById('emailInput').innerText;
    userJoinClubData.gender = document.getElementById("genderInput").value;
    userJoinClubData.residence = document.getElementById("residenceInput").value;
    userJoinClubData.introduction = document.getElementById("introductionInput").value;

    fetch(`/api/join_club/applications/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userJoinClubData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        return response.json();
    })
    .then(data => {
        if(!data.success){
            alert('신청서를 제출에 실패하였습니다.');
            window.location.reload();
            return;
        }
        alert(`신청서 제출에 성공하였습니다!`);
        window.location.reload();
    })
    .catch(error => {
        alert(`클럽 가입 신청서를 작성중에 에러가 발생했습니다. ${error}`);
        console.error("클럽 가입 신청서를 작성중에 에러가 발생했습니다.", error);
        window.location.reload();
    });
});

function getMemberData(){
    fetch('/api/join_club/memberData/get', {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if(!res.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return res.json();
    })
    .then(data => {
        if(!data.success){
            alert('유저 정보를 가져오지 못했습니다.');
            window.location.reload();
            return;
        }
        setJoinClubModal(data.userData);
    })
    .catch(err => {
        alert(`에러발생: ${err}`);
        window.location.href = "/";
    })
}

//동아리에 가입 가능한 유저인지 확인.
//해당동아리에 가입이 되어있는지?
async function isJoinedThisClub() {
    try {
        const postNum = getPostNumber();
        const res = await fetch(`/api/check/JoinedThisClub?query=${postNum}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('유저의 클럽가입 여부를 확인중 에러 발생.');
        }
        const data = await res.json();
        if (!data.success) {
            alert('유저 정보 조회를 실패하였습니다.');
            window.location.reload();
            return false;
        }
        if (!data.canJoinUser) {
            alert('이미 가입된 동아리 입니다.');
            return false;
        }
        return true;
    } catch (error) {
        alert('클럽 가입여부를 확인중 에러가 발생했습니다.');
        console.error(`에러발생 ${error}`);
        window.location.reload();
    }
}
