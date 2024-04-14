// 이용약관 표시/숨기기 함수 수정
function toggleTermsModal() {
    var modal = document.getElementById('termsModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('acceptTerms').addEventListener('change', function() {
        var termsModal = document.getElementById('termsModal');
        if (termsModal) {
            termsModal.style.display = this.checked ? 'block' : 'none';
        }
    });
});


// 동의 버튼 클릭 시 이용약관 체크
function confirmAgreement() {
    var acceptTerms = document.getElementById('acceptTerms');
    var modal = document.getElementById('termsModal');

    if (acceptTerms.checked) {
        modal.style.display = 'none';
    } else {
        alert("이용약관에 동의해주세요.");
    }
}

// 이용약관 닫기
function closeModal() {
    var modal = document.getElementById('termsModal');

    // 모달이 닫힐 때는 체크 여부가 변경되지 않도록 수정
    modal.style.display = 'none';
}