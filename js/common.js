document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // 스크롤 방향 감지 (내려갈 때 사라짐, 올라올 때 나타남)
        if (currentScroll > lastScroll && currentScroll > 50) {
            // Downscroll
            header.classList.add('hide');
        } else {
            // Upscroll
            header.classList.remove('hide');
        }

        // 스크롤이 맨 위에 도달했을 때 헤더 무조건 노출
        if (currentScroll <= 0) {
            header.classList.remove('hide');
        }

        lastScroll = currentScroll;
    });
});//dom end