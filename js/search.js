// 搜索功能
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.currentIndex = -1;
        this.results = [];
    }

    // 初始化搜索功能
    init(data) {
        this.data = data;
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideResults();
            }
        });
    }

    // 处理搜索
    handleSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        if (query.length === 0) {
            this.hideResults();
            return;
        }

        this.results = this.searchData(query);
        this.renderResults();
    }

    // 搜索数据
    searchData(query) {
        const results = [];
        
        const searchInFolder = (folder) => {
            // 搜索文件夹标题
            if (folder.title.toLowerCase().includes(query)) {
                results.push({
                    type: 'folder',
                    title: folder.title,
                    element: this.findFolderElement(folder.title)
                });
            }

            // 搜索链接内容
            folder.content.forEach(link => {
                if (link.title.toLowerCase().includes(query) || 
                    link.url.toLowerCase().includes(query)) {
                    results.push({
                        type: 'link',
                        title: link.title,
                        url: link.url,
                        element: this.findLinkElement(link.url)
                    });
                }
            });

            // 递归搜索子文件夹
            folder.children.forEach(child => searchInFolder(child));
        };

        this.data.forEach(folder => searchInFolder(folder));
        return results;
    }

    // 渲染搜索结果
    renderResults() {
        this.searchResults.innerHTML = '';
        
        if (this.results.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">没有找到匹配的结果</div>';
        } else {
            this.results.forEach((result, index) => {
                const resultElement = document.createElement('div');
                resultElement.className = `search-result ${index === this.currentIndex ? 'active' : ''}`;
                
                if (result.type === 'folder') {
                    resultElement.innerHTML = `
                        <i class="fas fa-folder"></i>
                        <span>${this.highlightText(result.title)}</span>
                    `;
                } else {
                    resultElement.innerHTML = `
                        <i class="fas fa-link"></i>
                        <span>${this.highlightText(result.title)}</span>
                    `;
                }

                resultElement.addEventListener('click', () => this.handleResultClick(result));
                this.searchResults.appendChild(resultElement);
            });
        }

        this.searchResults.style.display = 'block';
    }

    // 高亮显示匹配文本
    highlightText(text) {
        const query = this.searchInput.value.trim().toLowerCase();
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // 处理键盘导航
    handleKeyNavigation(e) {
        if (this.results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults(-1);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentIndex >= 0) {
                    this.handleResultClick(this.results[this.currentIndex]);
                }
                break;
            case 'Escape':
                this.hideResults();
                break;
        }
    }

    // 导航搜索结果
    navigateResults(direction) {
        this.currentIndex = Math.max(-1, 
            Math.min(this.results.length - 1, 
            this.currentIndex + direction));
        
        this.renderResults();
        
        if (this.currentIndex >= 0) {
            const activeElement = this.searchResults.children[this.currentIndex];
            activeElement.scrollIntoView({ block: 'nearest' });
        }
    }

    // 处理结果点击
    handleResultClick(result) {
        if (result.type === 'folder') {
            // 展开文件夹并滚动到位置
            const folderElement = result.element;
            folderElement.classList.add('active');
            folderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // 打开链接
            window.open(result.url, '_blank');
        }
        
        this.hideResults();
    }

    // 隐藏搜索结果
    hideResults() {
        this.searchResults.style.display = 'none';
        this.currentIndex = -1;
    }

    // 查找文件夹元素
    findFolderElement(title) {
        const headers = document.querySelectorAll('.folder-header');
        for (const header of headers) {
            if (header.textContent.trim() === title) {
                return header.closest('.folder');
            }
        }
        return null;
    }

    // 查找链接元素
    findLinkElement(url) {
        const links = document.querySelectorAll('.link-item a');
        for (const link of links) {
            if (link.href === url) {
                return link.closest('.link-item');
            }
        }
        return null;
    }
}

// 创建搜索管理器实例
const searchManager = new SearchManager(); 