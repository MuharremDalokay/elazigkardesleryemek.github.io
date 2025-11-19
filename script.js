document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('menu-toggle').addEventListener('click', function () {
    const nav = document.getElementById('main-nav');
    const icon = this.querySelector('i');
    nav.classList.toggle('active');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

const monthMapTR = {
    'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
    'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
};
const monthNamesTR = [
    'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
    'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'
];

async function loadDailyMenu() {
    const menuList = document.getElementById('daily-menu');
    const dateDisplay = document.getElementById('current-date');
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('tr-TR', options);

    const currentMonthIndex = today.getMonth();
    const monthSlug = monthNamesTR[currentMonthIndex];
    const menuFileName = `./${monthSlug}_yemek_listesi.json`;

    const pdfButton = document.getElementById('monthly-menu-pdf');
    if (pdfButton) {
        const trMonthName = today.toLocaleDateString('tr-TR', { month: 'long' });
        pdfButton.href = `./${monthSlug}_yemek_listesi.pdf`;
        pdfButton.innerHTML = `<i class="fas fa-file-pdf"></i> ${trMonthName.charAt(0).toUpperCase() + trMonthName.slice(1)} Ayı Yemek Listesi`;
    }

    try {
        const response = await fetch(menuFileName);
        if (!response.ok) throw new Error('Menü JSON dosyası bulunamadı/yüklenemedi.');
        const menuData = await response.json();

        const todayMenu = menuData.find(item => {
            const dateParts = item.tarih.split(' ');
            const day = parseInt(dateParts[0]);
            const month = monthMapTR[dateParts[1]];
            if (month === undefined) return false;

            const itemDate = new Date(today.getFullYear(), month, day);
            return itemDate.toDateString() === todayDate.toDateString();
        });

        if (todayMenu && todayMenu.yemekler.length > 0) {
            menuList.innerHTML = '';
            todayMenu.yemekler.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                menuList.appendChild(li);
            });
        } else {
            menuList.innerHTML = `<li style="font-style: italic; color: var(--muted); list-style: none; padding-left: 0;">Bugün menümüz yoktur.</li>`;
        }
    } catch (error) {
        console.error('Menü yüklenirken hata:', error);
        menuList.innerHTML = `<li style="font-style: italic; color: var(--muted); list-style: none; padding-left: 0;">Bugün menümüz yoktur.</li>`;
    }
}

function setupGallery() {
    const carousel = document.getElementById('photo-carousel');
    const prevBtn = document.getElementById('prev-btn-abs');
    const nextBtn = document.getElementById('next-btn-abs');
    const imageBaseDir = 'resimler/';
    const maxImagesToTry = 50;
    let imageCount = 0;
    let currentScrollIndex = 0;

    function loadImages() {
        const checkImage = (index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = `${imageBaseDir}resim-${index}.jpg`;
            });
        };

        (async () => {
            let imagesLoaded = [];
            for (let i = 1; i <= maxImagesToTry; i++) {
                if (await checkImage(i)) {
                    imageCount++;
                    imagesLoaded.push(i);
                } else {
                    break;
                }
            }

            carousel.innerHTML = '';
            if (imageCount > 0) {
                imagesLoaded.forEach(i => {
                    const imgElement = document.createElement('img');
                    imgElement.src = `${imageBaseDir}resim-${i}.jpg`;
                    imgElement.alt = `İşletme görseli ${i}`;
                    carousel.appendChild(imgElement);
                });

                prevBtn.addEventListener('click', () => scrollCarousel(-1));
                nextBtn.addEventListener('click', () => scrollCarousel(1));

                updateCarouselPosition();

            } else {
                carousel.innerHTML = `<p style="text-align: center; width: 100%; color: var(--muted); padding: 50px 0;">Galeride henüz fotoğraf bulunmamaktadır.</p>`;
                prevBtn.disabled = true;
                nextBtn.disabled = true;
            }
        })();
    }

    function getItemsPerSlide() {
        return window.innerWidth <= 900 ? 1 : 2;
    }

    function scrollCarousel(direction) {
        const itemsPerSlide = getItemsPerSlide();
        const totalScrollableSteps = Math.ceil(imageCount / itemsPerSlide);

        currentScrollIndex += direction;

        if (currentScrollIndex >= totalScrollableSteps) {
            currentScrollIndex = 0;
        } else if (currentScrollIndex < 0) {
            currentScrollIndex = totalScrollableSteps - 1;
        }

        updateCarouselPosition();
    }

    function updateCarouselPosition() {
        if (imageCount === 0) return;

        const itemsPerSlide = getItemsPerSlide();
        const totalImageWidth = carousel.scrollWidth;

        let scrollPosition;

        if (itemsPerSlide === 1) {
            const itemWidth = totalImageWidth / imageCount;
            scrollPosition = currentScrollIndex * itemWidth;
        } else {
            const itemWidth = (totalImageWidth / imageCount);
            const slideSize = (itemWidth * 2) + 12;

            if (currentScrollIndex === Math.ceil(imageCount / itemsPerSlide) - 1 && imageCount % 2 !== 0) {
                scrollPosition = totalImageWidth - carousel.clientWidth;
            } else {
                scrollPosition = currentScrollIndex * slideSize;
            }
        }

        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    window.addEventListener('resize', () => {
        currentScrollIndex = 0;
        updateCarouselPosition();
    });

    loadImages();
}

document.addEventListener('DOMContentLoaded', () => {
    loadDailyMenu();
    setupGallery();
});