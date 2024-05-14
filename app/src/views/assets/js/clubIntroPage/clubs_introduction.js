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

async function getGraphData(){
    try {
        const category = getCategory();
        const response = await fetch(`/api/club-data/get?category=${category}`, {
            method: "GET",
            headers: {
                'Content-Type': 'Application/json',
            },
        });

        if(!response.ok){
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        let temp=[];
        for(let i = 0; i < data.length; i++) {
        temp[i] = (data[i].member_student_id).substring(2,4);
        }

        let countMap = {};
        temp.forEach(studentId => {
            if (countMap[studentId]) {
                countMap[studentId]++;
            } else {
                countMap[studentId] = 1;
            }
        });

        let labels = Object.keys(countMap);
        let mCount = Object.values(countMap);
        let colorPalette = [
            '#264653', // 깊은 청록색
            '#2a9d8f', // 밝은 청록색
            '#e9c46a', // 황금색
            '#f4a261', // 살구색
            '#e76f51', // 붉은 주황색
            '#ff6f61', // 코랄색
            '#6d6875', // 회보라색
            '#b5838d', // 장미색
            '#ffddd2', // 연한 분홍색
            '#3d405b'  // 어두운 회색
        ];

        new Chart(document.querySelector('#pieChart'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: '인원 수',
                    data: mCount,
                    backgroundColor: colorPalette.slice(0, labels.length),
                    hoverOffset: 4
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        enabled: true
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            let label = context.chart.data.labels[context.dataIndex];
                            return value;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        document.getElementById('chartText').innerText = '총원 : '+temp.length;
    } catch (error) {
        console.error(`에러가 발생했습니다. ${error}`);
        alert('해당 동아리 정보를 불러오는데 에러가 발생했습니다.');
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getClubData();
    await getGraphData();
})