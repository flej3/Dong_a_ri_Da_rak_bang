function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    return category;
}

function fillClubData(clubData){
    const { club_name, club_owner, affilition, about, twitter_link, facebook_link, instagram_link } = clubData;

    document.getElementById('clubName').innerText = `동아리명 : ${club_name}`;
    document.getElementById('clubAffilition').innerText = `소속 : ${affilition}`;
    document.getElementById('clubAbout').innerText = about;
}

function activateSns(clubIntroData) {
    const twitter = document.getElementById('twitterLinkIntro');
    const facebook = document.getElementById('facebookLinkIntro');
    const instagram = document.getElementById('instagramLinkIntro');
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

async function getClubData(){
    try {
        const category = getCategory();
        const response = await fetch(`/api/club-introduction-data/get?category=${category}`, {
            method: "GET",
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        activateSns(data.clubIntroData);
        fillClubData(data.clubIntroData);
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert('해당 동아리 정보를 불러오는데 에러가 발생했습니다.');
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getClubData();
})