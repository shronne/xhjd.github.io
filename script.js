document.addEventListener('DOMContentLoaded', () => {
    const defaultProjects = [
        {
            id: 1,
            category: 'books',
            title: '《失落的城市》',
            desc: '图书设计 / 书籍装帧',
            type: '3d',
            style: '--book-width: 160px; --book-ratio: 1.45; --book-thick: 20px; --cover-color: #e0e0e0; --spine-color: #999;'
        },
        {
            id: 2,
            category: 'books',
            title: '《设计百科全书》',
            desc: '精装厚本 / 暗色系',
            type: '3d',
            style: '--book-width: 180px; --book-ratio: 1.3; --book-thick: 50px; --cover-color: #3d3d3d; --spine-color: #222; --cover-img: none; --spine-img: none;'
        },
        {
            id: 3,
            category: 'books',
            title: '《PINK》画集',
            desc: '正方形画册 / 艺术类',
            type: '3d',
            style: '--book-width: 170px; --book-ratio: 1; --book-thick: 15px; --cover-color: #d4a5a5; --spine-color: #b07d7d;'
        },
        {
            id: 4,
            category: 'books',
            title: '《地平线》',
            desc: '横版摄影集 / 宽幅',
            type: '3d',
            style: '--book-width: 200px; --book-ratio: 0.7; --book-thick: 12px; --cover-color: #8fa; --spine-color: #6c8;'
        },
        {
            id: 5,
            category: 'packaging',
            title: '有机茶叶包装',
            desc: '包装设计 / 礼盒',
            type: 'flat',
            color: '#cccccc'
        },
        {
            id: 6,
            category: 'packaging',
            title: '极简护肤品系列',
            desc: '包装设计 / 瓶贴',
            type: 'flat',
            color: '#c2c2c2'
        },
        {
            id: 7,
            category: 'cultural',
            title: '博物馆周边胶带',
            desc: '文创 / 纸胶带',
            type: 'flat',
            color: '#b8b8b8'
        },
        {
            id: 8,
            category: 'cultural',
            title: '城市印象帆布袋',
            desc: '文创 / 布艺',
            type: 'flat',
            color: '#adadad'
        },
        {
            id: 9,
            category: 'others',
            title: '年度艺术展海报',
            desc: '其他 / 海报设计',
            type: 'flat',
            color: '#a3a3a3'
        },
        {
            id: 10,
            category: 'others',
            title: '个人摄影集',
            desc: '其他 / 摄影',
            type: 'flat',
            color: '#999999'
        }
    ];

    async function getProjects() {
        // 1. Try to fetch data.json (for deployed site)
        try {
            const response = await fetch('data.json');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) return data;
            }
        } catch (e) {
            // data.json not found or invalid, ignore
        }

        const s = localStorage.getItem('portfolioData');
        if (!s) return defaultProjects;
        try {
            const d = JSON.parse(s);
            if (Array.isArray(d)) return d.length ? d : defaultProjects;
            return defaultProjects;
        } catch {
            return defaultProjects;
        }
    }

    const projectsGrid = document.getElementById('projects-grid');
    const aboutSection = document.getElementById('about-section');
    const navLinks = document.querySelectorAll('nav a, .logo a');

    let projectItems = [];

    // Initial Render
    getProjects().then(projects => {
        renderProjects(projects);
        projectItems = document.querySelectorAll('.project-item');

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const viewParam = urlParams.get('view');

        if (viewParam === 'about') {
            showAbout();
        } else if (categoryParam) {
            filterProjects(categoryParam);
        } else {
            filterProjects('all');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const filter = link.getAttribute('data-filter');
            if (filter) {
                e.preventDefault();
                
                let newUrl = window.location.pathname;
                if (filter === 'about') {
                    newUrl += '?view=about';
                    showAbout();
                } else if (filter === 'all') {
                    // No query params for 'all' (home)
                    filterProjects('all');
                } else {
                    newUrl += `?category=${filter}`;
                    filterProjects(filter);
                }
                
                // Update URL history
                const currentSearch = window.location.search;
                const newSearch = newUrl.includes('?') ? newUrl.substring(newUrl.indexOf('?')) : '';
                
                if (currentSearch !== newSearch) {
                    window.history.pushState(null, '', newUrl);
                }
            }
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const viewParam = urlParams.get('view');

        if (viewParam === 'about') {
            showAbout();
        } else if (categoryParam) {
            filterProjects(categoryParam);
        } else {
            filterProjects('all');
        }
    });

    if (projectsGrid) {
        projectsGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.project-item');
            if (item) {
                const projectId = item.getAttribute('data-id');
                window.open(`project-detail.html?id=${projectId}`, '_blank');
            }
        });
    }

    function renderProjects(data) {
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = data.map(project => {
            let thumbnailHtml = '';
            
            if (project.type === '3d') {
                // Check if we have cover image (user uploaded) to use dynamic sizing
                if (project.coverImg && project.coverImg !== 'none') {
                    // New Dynamic Structure using <img> tags
                    thumbnailHtml = `
                    <div class="thumbnail book-scene">
                        <div class="book-3d dynamic-size">
                            <div class="book-spine">
                                <img src="${project.spineImg || ''}" alt="spine">
                            </div>
                            <div class="book-cover">
                                <img src="${project.coverImg}" alt="cover">
                            </div>
                        </div>
                    </div>`;
                } else {
                    // Old CSS Variable Structure (Fallback for demo data without images)
                    const vars = [];
                    if (project.style) {
                        vars.push(project.style);
                    } else {
                        // ... legacy vars ...
                        if (project.coverImg) vars.push(`--cover-img: url(${project.coverImg})`);
                        if (project.spineImg) vars.push(`--spine-img: url(${project.spineImg})`);
                        if (project.coverColor) vars.push(`--cover-color: ${project.coverColor}`);
                        if (project.spineColor) vars.push(`--spine-color: ${project.spineColor}`);
                        if (project.width) vars.push(`--book-width: ${project.width}px`);
                        if (project.ratio) vars.push(`--book-ratio: ${project.ratio}`);
                        if (project.thick) vars.push(`--book-thick: ${project.thick}px`);
                    }
                    const styleStr = vars.join('; ');
                    thumbnailHtml = `
                        <div class="thumbnail book-scene" style="${styleStr}">
                            <div class="book-3d">
                                <div class="book-face book-spine"></div>
                                <div class="book-face book-cover"></div>
                                <div class="book-top"></div>
                            </div>
                        </div>`;
                }
            } else {
                // Flat image support
                if (project.coverImg && project.coverImg !== 'none') {
                    thumbnailHtml = `
                        <div class="thumbnail flat" role="img" aria-label="${project.title}">
                            <img src="${project.coverImg}" alt="${project.title}">
                        </div>`;
                } else {
                    thumbnailHtml = `
                        <div class="thumbnail" style="background-color: ${project.color};" role="img" aria-label="${project.title}"></div>`;
                }
            }

            // Generate subtitle from intro values
            let subtitle = '';
            
            // Check for new dynamic intro array
            if (project.intro && Array.isArray(project.intro)) {
                const parts = [];
                project.intro.forEach(item => {
                    if (item.value && item.value.trim() !== '') {
                        parts.push(item.value);
                    }
                });
                subtitle = parts.join(' ｜ ');
            } else {
                // Legacy Fallback
                const parts = [];
                // Only values, not labels
                if (project.year) parts.push(project.year);
                if (project.introtype) parts.push(project.introtype);
                if (project.client) parts.push(project.client);
                if (project.publisher) parts.push(project.publisher);
                
                // If legacy fields are missing but desc exists (very old data), maybe use desc?
                // But user asked to replace description with intro. 
                // So if no intro data, it might be empty.
                if (parts.length === 0 && project.desc) {
                    // Temporarily keep desc if absolutely no intro data exists, to avoid blank layout?
                    // User said: "去掉'描述'部分。略缩图下面的信息变为”简介信息“里的内容"
                    // If intro is empty, "如果没有则不显示".
                    // So we leave it empty.
                } else {
                    subtitle = parts.join(' ｜ ');
                }
            }

            return `
                <div class="project-item" data-category="${project.category}" data-id="${project.id}">
                    ${thumbnailHtml}
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        ${subtitle ? `<p>${subtitle}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function filterProjects(category) {
        projectItems = document.querySelectorAll('.project-item');

        if (projectsGrid) projectsGrid.classList.remove('hidden');
        if (aboutSection) aboutSection.classList.add('hidden');

        projectItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        updateActiveNav(category);
    }

    function showAbout() {
        if (projectsGrid) projectsGrid.classList.add('hidden');
        if (aboutSection) aboutSection.classList.remove('hidden');
        updateActiveNav('about');
    }

    function updateActiveNav(activeCategory) {
        navLinks.forEach(link => {
            const filter = link.getAttribute('data-filter');
            if (filter === activeCategory) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});
