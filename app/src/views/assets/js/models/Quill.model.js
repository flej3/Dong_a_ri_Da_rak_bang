document.addEventListener("DOMContentLoaded", function () {
    // Quill 에디터 초기화
    var quill = new Quill('#editor', {
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
});