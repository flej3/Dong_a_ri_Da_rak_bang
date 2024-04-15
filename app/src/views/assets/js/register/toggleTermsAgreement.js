document.addEventListener('DOMContentLoaded', function() {
});

// 이용약관 보기 링크에 대한 클릭 이벤트 핸들러 등록
document.getElementById('viewTermsLink').addEventListener('click', function(event) {
    event.preventDefault();
    openTermsModal();
});

// 모달 열기 함수
function openTermsModal() {
    const modal = document.getElementById('termsModal');
    modal.style.display = 'block';
}

// 모달 닫기 함수
function closeModal() {
    const modal = document.getElementById('termsModal');
    modal.style.display = 'none';
}

// 동의 버튼 클릭 시 이벤트 핸들러
document.getElementById('confirmAgreement').addEventListener('click', function(event) {
    event.preventDefault();
    const acceptTerms = document.getElementById('acceptTerms');
    if (acceptTerms.checked) {
        closeModal();
    }else{
        acceptTerms.checked = true;
        closeModal();
    }
});

// 모달 닫기 버튼 클릭 시 이벤트 핸들러
document.getElementById('closeModalButton').addEventListener('click', function(event) {
    event.preventDefault();
    closeModal();
});