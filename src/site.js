function initSiteChrome() {
    var navCheck = document.getElementById('nav-check');
    if (navCheck) {
        document.querySelectorAll('.nav-mobile a').forEach(function (a) {
            a.addEventListener('click', function () {
                navCheck.checked = false;
            });
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            this.style.display = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', initSiteChrome);
