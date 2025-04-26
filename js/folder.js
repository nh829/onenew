// 文件夹功能
// 该版本直接递归渲染树状结构的数据
class FolderManager {
    constructor() {
        this.folderNav = document.getElementById('folder-nav');
        this.content = document.getElementById('content');
        this.folders = [];
    }

    // 初始化文件夹结构
    init(data) {
        // 直接使用树状结构
        this.folders = data;
        this.renderFolderNav();
        this.renderContent();
    }

    // 渲染文件夹导航
    renderFolderNav() {
        this.folderNav.innerHTML = '';
        this.folders.forEach(folder => {
            this.renderFolder(folder, this.folderNav);
        });
    }

    // 渲染单个文件夹（递归）
    renderFolder(folder, parentElement) {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.dataset.level = folder.tag || 'h1';

        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <i class="fas fa-folder"></i>
            <span>${folder.title}</span>
        `;

        const content = document.createElement('div');
        content.className = 'folder-content';

        folderElement.appendChild(header);
        folderElement.appendChild(content);

        // 点击展开/折叠
        header.addEventListener('click', () => {
            folderElement.classList.toggle('active');
            const icon = header.querySelector('i');
            icon.classList.toggle('fa-folder');
            icon.classList.toggle('fa-folder-open');
        });

        // 递归渲染子文件夹
        if (folder.children && folder.children.length > 0) {
            folder.children.forEach(child => {
                this.renderFolder(child, content);
            });
        }

        parentElement.appendChild(folderElement);
    }

    // 渲染内容区域
    renderContent() {
        this.content.innerHTML = '';
        this.folders.forEach(folder => {
            this.renderFolderContent(folder, this.content, 1);
        });
    }

    // 渲染文件夹内容（递归，带层级缩进）
    renderFolderContent(folder, parentElement, level = 1) {
        const section = document.createElement('section');
        section.className = `content-section level-${level}`;
        section.style.marginLeft = `${(level - 1) * 24}px`;
        section.style.marginBottom = '16px';

        // 选择合适的标题标签
        const headingTag = `h${Math.min(level, 6)}`;
        const heading = document.createElement(headingTag);
        heading.textContent = folder.title;
        section.appendChild(heading);

        // 渲染链接内容
        if (folder.content && folder.content.length > 0) {
            folder.content.forEach(link => {
                const linkElement = document.createElement('div');
                linkElement.className = 'link-item';
                linkElement.innerHTML = `
                    <span class="link-status ${link.accessible ? 'accessible' : 'inaccessible'}">
                        ${link.accessible ? '✅' : '❌'}
                    </span>
                    <a href="${link.url}" target="_blank">${link.title}</a>
                `;
                section.appendChild(linkElement);
            });
        }

        // 递归渲染子文件夹内容
        if (folder.children && folder.children.length > 0) {
            folder.children.forEach(child => {
                this.renderFolderContent(child, section, level + 1);
            });
        }

        parentElement.appendChild(section);
    }
}

// 创建文件夹管理器实例
const folderManager = new FolderManager(); 
