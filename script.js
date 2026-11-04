function copyToClipboard(elementId, button) {
    const input = document.getElementById(elementId);
    input.select();
    input.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(input.value).then(() => {
        input.classList.add('copied');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i>';
        button.style.backgroundColor = '#23a55a';
        
        setTimeout(() => {
            input.classList.remove('copied');
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
        }, 1500);
    }).catch(err => console.error('Gabim gjatë kopjimit: ', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.copy-input');
    inputs.forEach(input => {
        input.addEventListener('click', () => {
            input.select();
            input.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(input.value).then(() => {
                input.classList.add('copied');
                setTimeout(() => input.classList.remove('copied'), 1000);
            });
        });
    });
});