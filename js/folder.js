// 文件夹功能（新版：左侧树状目录+右侧单节点内容区）
class FolderManager {
    constructor() {
        this.folderNav = document.getElementById('folder-nav');
        this.content = document.getElementById('content');
        this.folders = [];
        this.activeFolder = null; // 当前选中的文件夹节点
    }

    // 初始化文件夹结构
    init(data) {
        this.folders = data;
        this.renderFolderNav();
        // 默认选中第一个文件夹
        const firstFolder = this.findFirstFolder(this.folders);
        if (firstFolder) {
            this.setActiveFolder(firstFolder);
        }
    }

    // 递归查找第一个文件夹节点
    findFirstFolder(folders) {
        if (!folders || folders.length === 0) return null;
        return folders[0];
    }

    // 设置当前激活的文件夹并渲染内容
    setActiveFolder(folder) {
        this.activeFolder = folder;
        this.renderFolderNav(); // 重新渲染高亮
        this.renderContent(folder);
    }

    // 渲染左侧树状目录
    renderFolderNav() {
        this.folderNav.innerHTML = '';
        this.folders.forEach(folder => {
            this.renderFolderNode(folder, this.folderNav, 1);
        });
    }

    // 递归渲染单个文件夹节点
    renderFolderNode(folder, parentElement, level) {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.style.marginLeft = `${(level - 1) * 16}px`;
        if (this.activeFolder === folder) {
            folderElement.classList.add('active-folder');
        }

        // 文件夹头部
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <i class="fas fa-folder${folderElement.classList.contains('active-folder') ? '-open' : ''}"></i>
            <span>${folder.title}</span>
        `;
        header.style.cursor = 'pointer';
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setActiveFolder(folder);
        });
        folderElement.appendChild(header);

        // 子文件夹和链接
        if ((folder.children && folder.children.length > 0) || (folder.content && folder.content.length > 0)) {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'folder-content';
            // 子文件夹
            if (folder.children && folder.children.length > 0) {
                folder.children.forEach(child => {
                    this.renderFolderNode(child, contentDiv, level + 1);
                });
            }
            // 链接
            if (folder.content && folder.content.length > 0) {
                folder.content.forEach(link => {
                    const linkDiv = document.createElement('div');
                    linkDiv.className = 'link-item';
                    linkDiv.style.marginLeft = `${8}px`;
                    linkDiv.innerHTML = `
                        <span class="link-status ${link.accessible ? 'accessible' : 'inaccessible'}">
                            ${link.accessible ? '✅' : '❌'}
                        </span>
                        <a href="${link.url}" target="_blank">${link.title}</a>
                    `;
                    // 链接点击直接跳转，无需事件
                    contentDiv.appendChild(linkDiv);
                });
            }
            folderElement.appendChild(contentDiv);
        }
        parentElement.appendChild(folderElement);
    }

    // 渲染右侧内容区：只显示当前选中文件夹下的内容
    renderContent(folder) {
        this.content.innerHTML = '';
        if (!folder) return;
        // 标题
        const heading = document.createElement('h2');
        heading.textContent = folder.title;
        this.content.appendChild(heading);
        // 链接
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
                this.content.appendChild(linkElement);
            });
        }
        // 子文件夹（递归）
        if (folder.children && folder.children.length > 0) {
            folder.children.forEach(child => {
                this.renderContent(child);
            });
        }
    }
}

// 创建文件夹管理器实例
const folderManager = new FolderManager(); 
