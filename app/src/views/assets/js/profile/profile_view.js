function convertToNewLines(str) {
    const items = str.split(',');
    const result = items.join('\n');
    return result;
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('/getUserProfileData', {
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
        if (data.success) {
            const userProfile = data.userProfile;
            document.getElementById('viewAbout').innerText = userProfile.about;
            document.getElementById('joinedClubs').innerText = convertToNewLines(userProfile.joined_clubs);
            
            // Twitter 링크 설정
            const twitterLink = userProfile.twitter_link;
            const twitterElement = document.querySelector('.twitter');
            if (twitterLink) {
                twitterElement.href = twitterLink;
            } else {
                twitterElement.style.display = 'none'; // 링크가 없을 경우 숨김 처리
            }

            // Facebook 링크 설정
            const facebookLink = userProfile.facebook_link;
            const facebookElement = document.querySelector('.facebook');
            if (facebookLink) {
                facebookElement.href = facebookLink;
            } else {
                facebookElement.style.display = 'none'; // 링크가 없을 경우 숨김 처리
            }

            // Instagram 링크 설정
            const instagramLink = userProfile.instagram_link;
            const instagramElement = document.querySelector('.instagram');
            if (instagramLink) {
                instagramElement.href = instagramLink;
            } else {
                instagramElement.style.display = 'none'; // 링크가 없을 경우 숨김 처리
            }
        } else {
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    // 외부 사이트 링크 설정
    const twitterElement = document.querySelector('.twitter');
    twitterElement.addEventListener('click', function(event) {
        event.preventDefault(); // 기본 동작인 링크 이동을 막습니다.
        window.open(twitterElement.href, '_blank'); // 새 탭에서 링크를 여십니다.
    });

    const facebookElement = document.querySelector('.facebook');
    facebookElement.addEventListener('click', function(event) {
        event.preventDefault(); // 기본 동작인 링크 이동을 막습니다.
        window.open(facebookElement.href, '_blank'); // 새 탭에서 링크를 여십니다.
    });

    const instagramElement = document.querySelector('.instagram');
    instagramElement.addEventListener('click', function(event) {
        event.preventDefault(); // 기본 동작인 링크 이동을 막습니다.
        window.open(instagramElement.href, '_blank'); // 새 탭에서 링크를 여십니다.
    });
});