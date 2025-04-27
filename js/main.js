// 主程序
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 加载资源数据
        const response = await fetch('data/resources.json');
        const data = await response.json();

        // 初始化文件夹管理器
        folderManager.init(data);

        // 初始化搜索管理器
        searchManager.init(data);

        // 检查链接可访问性
        checkLinkAccessibility(data);

    } catch (error) {
        console.error('初始化失败:', error);
    }
});

// 检查链接可访问性
async function checkLinkAccessibility(data) {
    const lastCheck = localStorage.getItem('lastAccessibilityCheck');
    const now = new Date().getTime();
    
    // 如果距离上次检查超过一个月，重新检查
    if (!lastCheck || (now - parseInt(lastCheck)) > 30 * 24 * 60 * 60 * 1000) {
        console.log('开始检查链接可访问性...');
        
        const checkFolder = async (folder) => {
            // 检查文件夹中的链接
            for (const link of folder.content) {
                try {
                    const response = await fetch(link.url, { 
                        method: 'HEAD',
                        mode: 'no-cors'
                    });
                    link.accessible = true;
                } catch (error) {
                    link.accessible = false;
                }
            }

            // 递归检查子文件夹
            for (const child of folder.children) {
                await checkFolder(child);
            }
        };

        // 检查所有文件夹
        for (const folder of data) {
            await checkFolder(folder);
        }

        // 保存检查结果和检查时间
        localStorage.setItem('resources', JSON.stringify(data));
        localStorage.setItem('lastAccessibilityCheck', now.toString());

        // 重新渲染内容
        folderManager.init(data);
    } else {
        // 使用上次的检查结果
        const savedData = localStorage.getItem('resources');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            folderManager.init(parsedData);
            searchManager.init(parsedData);
        }
    }
}

// 主题切换功能
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// 资源管理功能
class ResourceManager {
    constructor() {
        this.resources = JSON.parse(localStorage.getItem('resources')) || [];
        this.currentDirectory = 'root';
        this.init();
    }

    init() {
        this.renderDirectoryTree();
        this.renderResources();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 添加资源按钮点击事件
        document.querySelector('.add-resource-btn').addEventListener('click', () => {
            this.showResourceModal();
        });

        // 搜索功能
        const searchInput = document.querySelector('.search-box input');
        searchInput.addEventListener('input', (e) => {
            this.searchResources(e.target.value);
        });

        // 模态框关闭事件
        document.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideResourceModal();
            }
        });
    }

    renderDirectoryTree() {
        const treeContainer = document.querySelector('.directory-tree');
        const directories = this.getUniqueDirectories();
        
        const treeHTML = this.generateTreeHTML(directories);
        treeContainer.innerHTML = treeHTML;

        // 添加目录点击事件
        treeContainer.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                this.currentDirectory = item.dataset.path;
                this.renderResources();
            });
        });
    }

    getUniqueDirectories() {
        const directories = new Set(['root']);
        this.resources.forEach(resource => {
            if (resource.directory) {
                directories.add(resource.directory);
            }
        });
        return Array.from(directories);
    }

    generateTreeHTML(directories) {
        return `
            <ul>
                ${directories.map(dir => `
                    <li data-path="${dir}">
                        <span class="folder-icon">📁</span>
                        ${dir}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderResources() {
        const container = document.querySelector('.resource-grid');
        const filteredResources = this.resources.filter(
            resource => resource.directory === this.currentDirectory
        );

        container.innerHTML = filteredResources.map(resource => `
            <div class="resource-card">
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <div class="tags">
                    ${resource.tags.map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                </div>
                <a href="${resource.url}" target="_blank">访问链接</a>
            </div>
        `).join('');
    }

    showResourceModal(resource = null) {
        const modal = document.querySelector('.modal');
        const form = document.querySelector('#resource-form');
        
        if (resource) {
            // 编辑模式
            form.title.value = resource.title;
            form.url.value = resource.url;
            form.description.value = resource.description;
            form.tags.value = resource.tags.join(', ');
        } else {
            // 添加模式
            form.reset();
        }

        modal.style.display = 'block';
    }

    hideResourceModal() {
        document.querySelector('.modal').style.display = 'none';
    }

    searchResources(query) {
        const filteredResources = this.resources.filter(resource => {
            const searchText = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        const container = document.querySelector('.resource-grid');
        container.innerHTML = filteredResources.map(resource => `
            <div class="resource-card">
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <div class="tags">
                    ${resource.tags.map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                </div>
                <a href="${resource.url}" target="_blank">访问链接</a>
            </div>
        `).join('');
    }

    saveResource(formData) {
        const resource = {
            id: Date.now(),
            title: formData.title,
            url: formData.url,
            description: formData.description,
            tags: formData.tags.split(',').map(tag => tag.trim()),
            directory: this.currentDirectory
        };

        this.resources.push(resource);
        localStorage.setItem('resources', JSON.stringify(this.resources));
        this.renderResources();
        this.hideResourceModal();
    }
}

// 初始化资源管理器
const resourceManager = new ResourceManager();

// 表单提交处理
document.querySelector('#resource-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    resourceManager.saveResource(formData);
}); 