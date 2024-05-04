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

function getEditClubIntroData() {
    const clubIntroData = {};
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

document.addEventListener('DOMContentLoaded', async () => {
    await getClubIntroduction();
})