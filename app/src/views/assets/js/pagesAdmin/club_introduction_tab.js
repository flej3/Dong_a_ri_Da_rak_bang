function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');
    return category;
}

function fillClubIntro(clubIntroData) {
    const { profile_img_route, about, twitter_link, facebook_link, instagram_link } = clubIntroData;
    const aboutWithLineBreaks = about ? about.replace(/\n/g, '<br>') : '';
    const twitterLink = twitter_link || '';
    const facebookLink = facebook_link || '';
    const instagramLink = instagram_link || '';

    document.getElementById('club-profile-img').src = profile_img_route;
    document.getElementById('profile-edit-img').src = profile_img_route;
    document.getElementById('clubIntroMsg').innerHTML = aboutWithLineBreaks;
    document.getElementById('clubMessage').value = about || '';
    document.getElementById('clubTwitterProfile').value = twitterLink;
    document.getElementById('clubFacebookProfile').value = facebookLink;
    document.getElementById('clubInstagramProfile').value = instagramLink;
}

function activateSns(clubIntroData) {
    const twitter = document.getElementById('twitterLink');
    const facebook = document.getElementById('facebookLink');
    const instagram = document.getElementById('instagramLink');
    if (clubIntroData.twitter_link) {
        twitter.href = clubIntroData.twitter_link;
        twitter.style.display = "inline-block";
    }
    if (clubIntroData.facebook_link) {
        facebook.href = clubIntroData.facebook_link;
        facebook.style.display = "inline-block";
    }
    if (clubIntroData.instagram_link) {
        instagram.href = clubIntroData.instagram_link;
        instagram.style.display = "inline-block";
    }
}

async function getClubIntroduction() {
    try {
        const category = getCategory();
        const response = await fetch(`/api/club-introduction-data/get?category=${category}`, {
            method: "GET",
            headers: {
                'Content-Type': 'Applicaion/json',
            },
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const clubIntroData = await response.json();
        activateSns(clubIntroData.clubIntroData);
        const { hasAdminAc } = await isClubAdminAc();
        if (hasAdminAc) {
            fillClubIntro(clubIntroData.clubIntroData);
        }
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert("클럽 소개 정보를 가져오지 못했습니다.");
        window.location.reload();
    }
}

document.getElementById('saveClubProfileBtn').addEventListener('click', async (event) => {
    event.preventDefault();
    const editClubIntroData = getEditClubIntroData();
    editClubIntroData.category = getCategory();
    await saveClubIntroEdit(editClubIntroData);
})

const profileEditImg = document.getElementById('profile-edit-img');

function getEditClubIntroData() {
    const clubIntroData = {};
    clubIntroData.profile_img_route = profileEditImg.src;
    clubIntroData.about = document.getElementById('clubMessage').value;
    clubIntroData.twitter = document.getElementById('clubTwitterProfile').value;
    clubIntroData.facebook = document.getElementById('clubFacebookProfile').value;
    clubIntroData.instagram = document.getElementById('clubInstagramProfile').value;
    return clubIntroData;
}

async function saveClubIntroEdit(clubEditData) {
    try {
        const response = await fetch(`/api/club/intro/edit/save`, {
            method: "PUT",
            body: JSON.stringify(clubEditData),
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error('저장하는중 에러가 발생했습니다.');
        }
        alert(`동아리 소개 내용 저장 완료!`);
        window.location.reload();
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert("동아리 소개 데이터를 저장하는데 에러가 발생했습니다.");
        window.location.reload();
    }
}

async function isClubAdminAc() {
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/adminAc/check/get?query=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert("동아리 권한자 확인중 에러발생.");
        window.location.reload();
    }
}

// Cloudinary 이미지 업로드 함수
async function uploadProfileImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    const cloudName = await getEnvCloudName();
    formData.append('upload_preset', 'gh4pwyaw');
    formData.append('cloud_name', cloudName);

    // 로딩 스피너 표시
    document.getElementById('loading-spinner').style.display = 'block';

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    // 로딩 스피너 숨기기
    document.getElementById('loading-spinner').style.display = 'none';

    if (!response.ok) {
        throw new Error('이미지 업로드에 실패하였습니다.');
    }

    const data = await response.json();
    return data.secure_url;
}

// 환경 변수에서 Cloudinary 클라우드 이름을 가져오는 함수
async function getEnvCloudName() {
    try {
        const response = await fetch(`/api/get/env`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        return data.env;
    } catch (error) {
        alert(`에러발생: ${error}`);
        window.location.href = "/";
    }
}

// 프로필 이미지 업로드 및 삭제 이벤트 리스너 등록
const profileImageInput = document.getElementById('clubImageInput');
const uploadProfileBtn = document.getElementById('upload-profile-btn');
const deleteProfileBtn = document.getElementById('delete-profile-btn');

uploadProfileBtn.addEventListener('click', (event) => {
    event.preventDefault();
    profileImageInput.click();
});

profileImageInput.addEventListener('change', async () => {
    const file = profileImageInput.files[0];
    if (file) {
        try {
            const imageUrl = await uploadProfileImageToCloudinary(file);
            profileEditImg.src = imageUrl; // 이미지 미리보기 업데이트
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('프로필 이미지 업로드에 실패했습니다.');
        }
    }
});

deleteProfileBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
        profileEditImg.src = 'https://res.cloudinary.com/dtn8eum07/image/upload/v1716523504/kietouckugzsekobidcx.png'; // 기본 이미지로 변경
    } catch (error) {
        console.error('Error deleting profile image:', error);
        alert('프로필 이미지 삭제에 실패했습니다.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await getClubIntroduction();
})