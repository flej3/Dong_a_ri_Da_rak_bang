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

function quillGetEditor() {
    let editor = document.querySelector('#editor');
    if (!editor.__quill) { // 에디터가 이미 초기화되지 않았다면 초기화
        let quill = new Quill(editor, {
            theme: 'snow', // 테마 설정
            modules: { // 모듈 설정
                toolbar: [ // 툴바 설정
                    // 텍스트 스타일링
                    ['bold', 'italic', 'underline', 'strike'],
                    // 리스트
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    // 들여쓰기
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    // 링크
                    ['link'],
                    // 이미지
                    // ['image'],
                    // 줄 간격
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    // 글자색, 배경색
                    [{ 'color': [] }, { 'background': [] }],
                    // 정렬
                    [{ 'align': [] }]
                ],
            },
            placeholder: '내용을 입력해주세요.',
        });
        editor.__quill = quill;
    }
    return editor.__quill;
}

function setPostingInfo(postData) {
    // 동아리 이름과 제목 설정
    document.getElementById('dongariName').value = postData.club_name;
    document.getElementById('postTitle').value = postData.title;

    // 모집 인원 설정
    document.getElementById('recruitNumber').value = postData.recruit_num;

    // 작성일과 마감일 설정
    document.getElementById('recruitDeadline').value = new Date(postData.dead_day).toISOString().slice(0, 10);

    // Quill Editor 내용 설정
    const quillEditor = quillGetEditor(); // 에디터 초기화 및 인스턴스 가져오기
    quillEditor.setContents(postData.content);
}

function getPostData() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');
    fetch(`/view-recruit-post-from-postNum?query=${postNum}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert("수정할 수 있는 게시글을 찾을 수 없습니다.");
                window.location.href = "/";
            }
            setPostingInfo(data.postData);
        })
        .catch(error => {
            console.error('게시글 수정 중 오류 발생:', error);
        });
}

async function uploadFile(file) {
    try {
        // 로딩 스피너 표시
        document.getElementById('loading-spinner').style.display = 'block';

        const quillEditor = quillGetEditor(); // Quill 에디터의 인스턴스 가져오기

        const formData = new FormData();
        formData.append('file', file);
        const cloudName = await getEnvCloudName();
        formData.append('upload_preset', 'gh4pwyaw'); // Cloudinary upload preset
        formData.append('cloud_name', cloudName); // Cloudinary cloud name

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('이미지 업로드에 실패하였습니다.');
        }

        const data = await response.json();
        const range = quillEditor.getSelection();

        if (!range) {
            // 에디터에 텍스트가 없는 경우
            quillEditor.insertEmbed(0, 'image', data.secure_url);
        } else {
            // 에디터에 텍스트가 있는 경우
            quillEditor.insertEmbed(range.index, 'image', data.secure_url);
        }

        // 로딩 스피너 숨기기
        document.getElementById('loading-spinner').style.display = 'none';

        return data.secure_url; // 이미지 URL 반환

    } catch (err) {
        // 로딩 스피너 숨기기
        document.getElementById('loading-spinner').style.display = 'none';

        console.error('Error uploading file:', err);
        throw err; // 오류를 던져서 호출한 곳에서 처리할 수 있게 함
    }
}

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

function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
}

async function setPostUpdate(event) {
    event.preventDefault(); // Prevent form submission if there are invalid inputs

    if (!validateForm()) {
        return;
    }

    // Quill 에디터의 내용을 Delta 형식으로 가져옴
    const quillEditor = quillGetEditor();
    const quillContents = quillEditor.getContents();

    try {
        // 파일 입력 요소에서 파일을 가져옴
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        let imageUrl = null;

        if (file) {
            imageUrl = await uploadFile(file); // 파일이 있을 경우 업로드
        }

        const postingData = {
            title: document.getElementById('postTitle').value,
            club_name: document.getElementById('dongariName').value,
            recruit_num: document.getElementById('recruitNumber').value,
            dead_day: document.getElementById('recruitDeadline').value,
            image_route: imageUrl, // 이미지 URL 설정
            // Delta 형식의 데이터를 JSON 문자열로 변환하여 전송
            content: JSON.stringify(quillContents),
        };

        const urlParams = new URLSearchParams(window.location.search);
        const postNum = urlParams.get('query');

        // 서버에 데이터 전송
        const response = await fetch(`/post-update?query=${postNum}`, {
            method: 'POST',
            body: JSON.stringify(postingData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }

        const data = await response.json();

        if (!data.isClubAdminAc) {
            // 해당 동아리에 권한자가 아닌 경우
            const dongariNameInput = document.getElementById('dongariName');
            addInvalidFeedback(dongariNameInput, '해당 동아리에 권한자가 아닙니다.');
            return;
        }
        if (!data.success) {
            alert('게시글 수정에 실패하였습니다.');
            return;
        }
        alert('게시글 수정에 성공하셨습니다!');
        window.location.href = `/view-recruit-post?query=${data.postNum}`;
    } catch (error) {
        console.error('오류 발생:', error.message);
        alert('게시글 수정에 실패하였습니다.');
    }
}

function deletePost(postNum) {
    fetch(`/post-delete`, {
        method: 'POST',
        body: JSON.stringify({postNum: postNum}),
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
        if(!data.success){
            alert('게시글 삭제에 실패하였습니다.');
            return;
        }
        alert('게시글이 삭제되었습니다!');
        window.location.href = "/";
    })
    .catch(err => {
        alert(`에러발생: ${err}`);
        window.location.href = "/";
    })
}

//해당 게시글의 편집모드로 들어갈때, 접속자가 해당 게시글의 권한자(owner || admin_ac)인지 확인
function verifyEditAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');

    fetch(`/verifyEditAccess?query=${postNum}`, {
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
            if (!data.isAccess) {
                alert('해당 게시글을 수정하실 권한이 없습니다.');
                window.location.href = "/";
            }
        })
        .catch(err => {
            alert(`에러발생: ${err}`);
            window.location.href = "/";
        })
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    verifyEditAccess();
    getPostData();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    dropZone.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        const files = fileInput.files;
        handleFiles(files);
    });

    const savePostBtn = document.getElementById('save_post_button');
    savePostBtn.addEventListener('click', setPostUpdate);

    const urlParams = new URLSearchParams(window.location.search);
    const postNum = urlParams.get('query');

    const cancelPostBtn = document.getElementById('cancel_post_button');
    cancelPostBtn.addEventListener('click', () => {
        window.location.href = `/view-recruit-post?query=${postNum}`;
    })

    const deletePostBtn = document.getElementById('realDeleteBtn');
    deletePostBtn.addEventListener('click', () => {
        deletePost(postNum);
    });
});