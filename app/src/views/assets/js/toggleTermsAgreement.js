// 이용약관 표시/숨기기 함수 수정
function toggleTermsModal() {
    var modal = document.getElementById('termsModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }
}

// 이용약관 텍스트 클릭 이벤트 핸들러 추가
document.getElementById('termsCheckboxWrapper').addEventListener('click', function() {
    toggleTermsModal();
});

// 동의합니다 체크박스 클릭 이벤트 핸들러 추가
document.getElementById('agreementCheckbox').addEventListener('click', function() {
    var acceptTerms = document.getElementById('acceptTerms');
    acceptTerms.checked = this.checked;
});

// 확인 버튼 클릭 시 이용약관 닫기 및 이용약관 동의 여부 확인
function confirmAgreement() {
    var acceptTerms = document.getElementById('acceptTerms');
    var modal = document.getElementById('termsModal');

    if (acceptTerms.checked) {
        var agreementCheckbox = document.getElementById('agreementCheckbox');
        agreementCheckbox.checked = true;
        modal.style.display = 'none';
    } else {
        alert("이용약관에 동의해주세요.");
    }
}

// 이용약관 동의 여부 확인 후 확인 버튼 활성화/비활성화 및 이용약관(보기) 체크 동기화
function checkAgreement() {
    var acceptTerms = document.getElementById('acceptTerms');
    var confirmButton = document.getElementById('confirmButton');
    var agreementCheckbox = document.getElementById('agreementCheckbox');

    confirmButton.disabled = !acceptTerms.checked;
    agreementCheckbox.checked = acceptTerms.checked;
}

// 이용약관 닫기
function closeModal() {
    var modal = document.getElementById('termsModal');
    modal.style.display = 'none';
}