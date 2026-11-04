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

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            navToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open navigation menu');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }
});