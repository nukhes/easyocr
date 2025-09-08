document.querySelectorAll('textarea').forEach(textarea => {
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(textarea.value)
            .then(() => alert('Copied!'))
            .catch(err => alert('Failed to copy: ' + err));
    });
    textarea.insertAdjacentElement('afterend', btn);
});