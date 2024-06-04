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
        return data.isLogin;
    } catch (err) {
        alert("에러가 발생했습니다.");
        console.error(err);
        window.location.href = "/";
    }
}

async function getUserProfile(){
    try {
        const response = await fetch('/getUserProfileData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();
        if (data.success) {
            const userProfile = data.userProfile;
            document.getElementById('header-profile-img').src = userProfile.profile_img_route;
        }
    } catch (error) {
        console.error(`프로필 이미지 가져오던중 에러 발생: ${error}`);
        alert(`프로필 이미지 가져오던중 에러 발생: ${error}`);
        window.location.href = "/error-page";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isLogin = await checkLogin();
    if(isLogin.isLogin){
        await getUserProfile();
    }
})