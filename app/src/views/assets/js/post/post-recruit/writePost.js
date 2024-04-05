let quill; // Quill 에디터를 전역 변수로 선언

// 폼 유효성 검사 함수
function validateForm() {
    let form = document.querySelector(".needs-validation");
    let inputs = form.querySelectorAll("[required]");
    let isValid = true;

    inputs.forEach(function (input) {
        if (!input.value.trim()) {
            input.classList.add("is-invalid");
            isValid = false;
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid"); // Add is-valid class for valid input
        }
    });

    return isValid;
}

// 해당 동아리에 대표가 아닌 경우
function addInvalidFeedback(input, message) {
    const invalidFeedback = input.nextElementSibling;
    input.classList.add('is-invalid');
    invalidFeedback.textContent = message;
}

// 게시글 데이터 전송 함수
function submitPostData(event) {
    event.preventDefault(); // Prevent form submission if there are invalid inputs

    if (!validateForm()) {
        return;
    }

    // Quill 에디터의 내용을 Delta 형식으로 가져옴
    const quillContents = quill.getContents();

    const postingData = {
        title: document.getElementById('postTitle').value,
        club_name: document.getElementById('dongariName').value,
        recruit_num: document.getElementById('recruitNumber').value,
        dead_day: document.getElementById('recruitDeadline').value,
        image_route: null,
        // Delta 형식의 데이터를 JSON 문자열로 변환하여 전송
        content: JSON.stringify(quillContents),
    };

    // 서버에 데이터 전송
    fetch('/postData', {
        method: 'POST',
        body: JSON.stringify(postingData),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(data => {
            if (!data.isClubOwner) {
                // 해당 동아리에 대표가 아닌 경우
                const dongariNameInput = document.getElementById('dongariName');
                addInvalidFeedback(dongariNameInput, '해당 동아리에 대표가 아닙니다.');
                return;
            }
            if (!data.success) {
                alert('게시글 작성에 실패하였습니다.');
                return;
            }
            alert('게시글 등록에 성공하였습니다.');
            window.location.href = `/view-recruit-post?query=${data.postNum}`;
        })
        .catch(error => {
            console.error('오류 발생:', error.message);
            alert('게시글 작성에 실패하였습니다.');
        });
}

function isClubOwner() {
    fetch('/isClubOwner', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(data => {
            if (!data.isOwner) {
                alert("동아리 대표만 작성 가능합니다.");
                window.location.href = "/";
            }
        })
        .catch(err => {
            alert(`에러발생: ${err}`);
            window.location.href = "/";
        })
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', function () {
    isClubOwner();

    // Quill 에디터 초기화
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                // 텍스트 스타일링
                ['bold', 'italic', 'underline', 'strike'],

                // 리스트
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],

                // 들여쓰기
                [{ 'indent': '-1' }, { 'indent': '+1' }],

                // 링크
                ['link'],

                // 이미지
                ['image'],

                // 줄 간격
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                // 글자색, 배경색
                [{ 'color': [] }, { 'background': [] }],

                // 정렬
                [{ 'align': [] }],
            ],
            // 이미지 크기 조절하는 모듈인데 진짜 도저히 안됌;;
            // ImageResize: {
            //     displaySize: true // 핸들을 통해 이미지 크기 조절 가능하도록 설정
            // }
        },
        placeholder: '내용을 입력해주세요.'
    });

    const completePostBtn = document.getElementById('completePostBtn');
    completePostBtn.addEventListener('click', submitPostData);
});