document.addEventListener('DOMContentLoaded', () => {
  const nameItems = document.querySelectorAll('.more .name');
  const bestSection = document.querySelector('.best');
  const bestTitle = document.querySelector('.best .title_all');
  const bestViewport = document.querySelector('.best_viewport');
  const bestTrack = document.querySelector('.best_all');

  // 1. Accordion logic: Toggle expansion when clicking the label bar
  nameItems.forEach(item => {
    const label = item.querySelector('.txt');
    
    label.addEventListener('click', () => {
      // 이미 열려 있는 항목을 클릭하면 아무동작도 하지 않음 (닫기 방지)
      if (item.classList.contains('active')) return;
      
      // 모든 항목에서 active 제거 후 클릭한 항목만 활성화
      nameItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });

    // 2. Slider logic: Each expanded item can have multiple slide items
    const slides = item.querySelectorAll('.slide_item');
    if (slides.length > 0) {
      const slideWrap = item.querySelector('.slide_wrap');
      const prevBtn = item.querySelector('.icon_all.left');
      const nextBtn = item.querySelector('.icon_all.right');
      const bullets = item.querySelectorAll('.bullet');
      let currentIdx = 0;

      const updateSlide = (index) => {
        // 수평 이동 처리 (1332px 간격)
        slideWrap.style.transform = `translateX(-${index * 1332}px)`;

        // 마커 업데이트 (불렛 & 슬라이드 클래스)
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        bullets.forEach((b, i) => b.classList.toggle('active', i === index));
        currentIdx = index;
      };

      // Previous button click
      prevBtn?.addEventListener('click', () => {
        let idx = currentIdx - 1;
        if (idx < 0) idx = slides.length - 1;
        updateSlide(idx);
      });

      // Next button click
      nextBtn?.addEventListener('click', () => {
        let idx = currentIdx + 1;
        if (idx >= slides.length) idx = 0;
        updateSlide(idx);
      });

      // Bullet navigation click
      bullets.forEach((bullet, i) => {
        bullet.addEventListener('click', (e) => {
          e.preventDefault();
          updateSlide(i);
        });
      });
    }
  });

  if (bestSection && bestViewport && bestTrack) {
    const totalWidth = () => Math.max(bestTrack.scrollWidth - bestViewport.clientWidth, 0);

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const titleOffset = () => (bestTitle ? bestTitle.offsetHeight + 200 : 300);

      gsap.to(bestTrack, {
        x: () => -totalWidth(),
        ease: 'none',
        scrollTrigger: {
          trigger: bestSection,
          start: () => `top top-=${titleOffset()}`,
          end: () => `+=${totalWidth()}`,
          scrub: true,
          anticipatePin: 1,
          toggleActions: 'play none none reset',
          pin: true,
          invalidateOnRefresh: true
        }
      });

      window.addEventListener('resize', () => ScrollTrigger.refresh());
    }
  }
}); //dom end
