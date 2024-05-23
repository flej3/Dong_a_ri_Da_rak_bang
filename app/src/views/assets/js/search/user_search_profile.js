function setUserProfile(userProfileData){
    document.getElementById('titleUserName').innerText = `${userProfileData.user_name}님의 프로필`;
    document.getElementById('subTitleUserName').innerText = userProfileData.user_name;
    document.getElementById('userName').innerText = userProfileData.user_name;
    document.getElementById('userDepartment').innerText = userProfileData.user_department;
    
    document.getElementById('profileInfoName').innerText = userProfileData.user_name;
    document.getElementById('profileInfoDepartment').innerText = userProfileData.user_department;
    document.getElementById('profileInfoStudentId').innerText = userProfileData.user_student_id;
    document.getElementById('profileInfoUserId').innerText = userProfileData.user_id;
}

//SNS 링크 설정
function setSNSIcon(userProfileData) {
    // 각 소셜 미디어 입력 요소를 가져옵니다.
    var twitterInput = document.getElementById("twitter");
    var facebookInput = document.getElementById("facebook");
    var instagramInput = document.getElementById("instagram");

    if (!userProfileData.hasProfile) {
        twitterInput.style.display = "none";
        facebookInput.style.display = "none";
        instagramInput.style.display = "none";
        return;
    }

    if(userProfileData.profile.twitter_link){
        twitterInput.href = userProfileData.profile.twitter_link;
    }else{
        twitterInput.style.display = "none";
    }

    if(userProfileData.profile.facebook_link){
        facebookInput.href = userProfileData.profile.facebook_link;
    }else{
        facebookInput.style.display = "none";
    }

    if(userProfileData.profile.instagram_link){
        instagramInput.href = userProfileData.profile.instagram_link;
    }else{
        instagramInput.style.display = "none";
    }
}

//프로필 메세지 설정
function setProfileMessage(userProfileData){
    if(!userProfileData.hasProfile){
        return;
    }
    document.getElementById('viewAbout').innerHTML = userProfileData.profile.about;
}

function convertToNewLines(str) {
    const items = str.split(',');
    const result = items.join('\n');
    return result;
}

//가입중인 동아리 설정
function setJoinedClubs(userProfileData){
    if(!userProfileData.hasProfile){
        return;
    }
    document.getElementById('joinedClubs').innerText = convertToNewLines(userProfileData.profile.joined_clubs);
}

//프로필 사진 설정
function setUserProfileImg(userProfileData){
    if(!userProfileData.hasProfile){
        return;
    }
    document.getElementById('search-user-profile-img').src = userProfileData.profile.profile_img_route;
}

function searchUserProfile(){
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    fetch(`/api/search-user-profile?query=${searchQuery}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if(!res.ok){
            alert('에러가 발생했습니다.');
            window.location.href = "/";
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return res.json();
    })
    .then(data => {
        if(!data.success){
            alert('검색결과가 없습니다.');
            return window.location.href = "/";
        }
        const userProfileData = data.userData[0];
        setUserProfile(userProfileData.userData);
        setUserProfileImg(userProfileData)
        setSNSIcon(userProfileData);
        setProfileMessage(userProfileData);
        setJoinedClubs(userProfileData);
    })
    .catch(err=>{
        console.error('There was a problem with the fetch operation:', err);
    })
}

// 페이지가 로드될 때 searchUserProfile 함수를 실행
document.addEventListener('DOMContentLoaded', function () {
    searchUserProfile();
});