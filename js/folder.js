// 文件夹功能
class FolderManager {
    constructor() {
        this.folderNav = document.getElementById('folder-nav');
        this.content = document.getElementById('content');
        this.folders = [];
    }

    // 初始化文件夹结构
    init(data) {
        this.folders = this.parseHeadings(data);
        this.renderFolderNav();
        this.renderContent();
    }

    // 解析标题层级
    parseHeadings(data) {
        const folders = [];
        let currentLevel = 0;
        let currentFolder = null;
        let folderStack = [];

        data.forEach(item => {
            const level = this.getHeadingLevel(item.tag);
            const folder = {
                title: item.title,
                level: level,
                content: item.content || [],
                children: []
            };

            if (level > currentLevel) {
                // 进入子文件夹
                if (currentFolder) {
                    folderStack.push(currentFolder);
                }
                currentFolder = folder;
                currentLevel = level;
            } else if (level < currentLevel) {
                // 返回上级文件夹
                while (level < currentLevel && folderStack.length > 0) {
                    const parent = folderStack.pop();
                    parent.children.push(currentFolder);
                    currentFolder = parent;
                    currentLevel--;
                }
            }

            if (currentFolder) {
                currentFolder.children.push(folder);
            } else {
                folders.push(folder);
            }
        });

        return folders;
    }

    // 获取标题层级
    getHeadingLevel(tag) {
        return parseInt(tag.replace('h', ''));
    }

    // 渲染文件夹导航
    renderFolderNav() {
        this.folderNav.innerHTML = '';
        this.folders.forEach(folder => {
            this.renderFolder(folder, this.folderNav);
        });
    }

    // 渲染单个文件夹
    renderFolder(folder, parentElement) {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.dataset.level = folder.level;

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

        // 添加点击事件
        header.addEventListener('click', () => {
            folderElement.classList.toggle('active');
            const icon = header.querySelector('i');
            icon.classList.toggle('fa-folder');
            icon.classList.toggle('fa-folder-open');
        });

        // 递归渲染子文件夹
        folder.children.forEach(child => {
            this.renderFolder(child, content);
        });

        parentElement.appendChild(folderElement);
    }

    // 渲染内容区域
    renderContent() {
        this.content.innerHTML = '';
        this.folders.forEach(folder => {
            this.renderFolderContent(folder, this.content);
        });
    }

    // 渲染文件夹内容
    renderFolderContent(folder, parentElement) {
        const section = document.createElement('section');
        section.className = `content-section level-${folder.level}`;
        
        const heading = document.createElement(folder.tag || 'h1');
        heading.textContent = folder.title;
        section.appendChild(heading);

        // 渲染链接内容
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

        // 递归渲染子文件夹内容
        folder.children.forEach(child => {
            this.renderFolderContent(child, section);
        });

        parentElement.appendChild(section);
    }
}

// 创建文件夹管理器实例
const folderManager = new FolderManager(); 