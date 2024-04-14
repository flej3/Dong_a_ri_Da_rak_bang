function getCreateClubData() {
    const newClubData = {};
    newClubData.user_id = "";
    newClubData.user_name = "";
    newClubData.club_name = document.getElementById("club_name").value;
    newClubData.club_members = document.getElementById("club_members").value;
    newClubData.affilition = document.getElementById("affiliation").value;
    newClubData.ph_number = document.getElementById("ph_number").value;
    newClubData.club_content = document.getElementById("club_description").value;

    return newClubData;
}

async function createClub(createClubData) {
    try {
        const response = await fetch('/api/create/club/post', {
            method: "POST",
            body: JSON.stringify(createClubData),
            headers: {
                "Content-Type": "application/json",
            },
        })
        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        console.log(data);
        if(!data.success){
            throw new Error('동아리(모임) 신청서를 제출하는데 실패 하였습니다.');
        }
        alert('동아리(모임) 신청서를 제출하였습니다!');
        window.location.reload();
        return;
    } catch (error) {
        alert(`동아리(모음) 신청서 작성중에 에러가 발생했습니다. ${error}`);
        console.error(`에러가 발생했습니다. ${error}`);
        window.location.reload();
    }
}

document.getElementById("createClubForm").addEventListener('submit', async function (event) {
    event.preventDefault();
    const clubData = getCreateClubData();

    await createClub(clubData);
})