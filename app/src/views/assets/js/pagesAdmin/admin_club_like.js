function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function addClubLike(category){
    try {
        const response = await fetch('/api/club/like/add', {
            method: 'POST',
            body: JSON.stringify({category}),
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
    } catch (error) {
        console.error(`"좋아요"를 하던중 에러 발생: ${error}`);
        alert(`"좋아요"를 추가하지 못했습니다. ${error}`);
        window.location.reload();
    }
}

async function deleteClubLike(category){
    try {
        const response = await fetch('/api/club/like/delete', {
            method: 'DELETE',
            body: JSON.stringify({category}),
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
    } catch (error) {
        console.error(`"좋아요"를 제거하던중 에러 발생: ${error}`);
        alert(`"좋아요"를 제거하지 못했습니다. ${error}`);
        window.location.reload();
    }
}

async function isLogin(){
    try {
        const response = await fetch('/isLogin', {
            method:'GET',
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const { isLogin } = await response.json();
        return isLogin;
    } catch (error) {
        console.error(`로그인 정보를 확인중 에러발생: ${error}`);
        alert(`로그인 정보를 확인중 에러발생 ${error}`);
        window.location.reload();
    }
}

async function getClubLikesCount(){
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/likes/count?category=${category}`, {
            method:"GET",
            headers: {
                "Content-Type": "Application/json",
            },
        });
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();
        const count = data.clubLikesCount;
        document.getElementById('likeCount').innerText = count;
    } catch (error) {
        console.error(`해당 동아리의 좋아요 정보를 받아오던중 에러발생: ${error}`);
        alert(`해당 동아리의 좋아요 정보를 받아오던중 에러발생 ${error}`);
        window.location.reload();
    }
}

document.getElementById('clubHeartBtn').addEventListener('click', async (event) => {
    const loginCheck = await isLogin();
    if(!loginCheck){
        window.location.href = "/pages-login";
        return ;
    }
    await handleHeartClick(event);
})

async function handleHeartClick(event){
    event.preventDefault();
    const category = getCategory();
    const heartIcon = document.querySelector(`#clubHeartBtn i`);
    const isFilled = heartIcon.classList.contains('bi-heart-fill');

    if (isFilled) {
        try {
            await deleteClubLike(category);
            heartIcon.classList.remove('bi-heart-fill');
            heartIcon.classList.add('bi-heart');
            await getClubLikesCount();
        } catch (error) {
            console.error(`좋아요를 제거하는 중 오류 발생: ${error}`);
            alert(`좋아요를 제거하지 못했습니다. ${error}`);
        }
    } else {
        try {
            await addClubLike(category);
            heartIcon.classList.remove('bi-heart');
            heartIcon.classList.add('bi-heart-fill');
            await getClubLikesCount();
        } catch (error) {
            console.error(`좋아요를 추가하는 중 오류 발생: ${error}`);
            alert(`좋아요를 추가하지 못했습니다. ${error}`);
        }
    }
}

async function isClubLike(){
    try {
        const category = getCategory();
        const response = await fetch(`/api/club/like/one/get?category=${category}`, {
            method: 'GET',
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();        
        if(data.isClubLike){
            const heartIcon = document.querySelector(`#clubHeartBtn i`);
            heartIcon.classList.remove('bi-heart');
            heartIcon.classList.add('bi-heart-fill');
        }
        } catch (error) {
        console.error(`"좋아요" 정보를 불러오던중 에러 발생: ${error}`);
        alert(`"좋아요" 정보를 가져오지 못했습니다. ${error}`);
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getClubLikesCount();
    const loginCheck = await isLogin();
    if(loginCheck){
        await isClubLike();
    }
})