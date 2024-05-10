function getCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('query');

    return category;
}

async function thisClubOwnerCheck(){
    try {
        const category = getCategory();
        const response = await fetch(`/api/thisClubOwnerCheck/get?category=${category}`, {
            method:"GET",
            headers: {
                'Content-Type':'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        alert(`에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await thisClubOwnerCheck();
})