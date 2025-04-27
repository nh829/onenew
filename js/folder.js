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

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
}

// 点击切换主题
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// 递归渲染多级目录树，支持一级、二级目录折叠/展开
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/resources.json')
        .then(res => res.json())
        .then(data => {
            renderDirectoryTree(data, document.querySelector('.directory-tree'));
        });
});

function renderDirectoryTree(data, container, level = 1) {
    if (!data || data.length === 0) return;
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = (level - 1) * 16 + 'px';

    data.forEach(item => {
        const li = document.createElement('li');
        li.style.margin = '4px 0';

        // 是否有子目录
        const hasChildren = item.children && item.children.length > 0;
        // 是否有资源内容
        const hasContent = item.content && item.content.length > 0;

        // 展开/收缩图标
        let icon = '';
        if (level <= 2 && (hasChildren || hasContent)) {
            icon = document.createElement('span');
            icon.textContent = '▶'; // 收缩时小三角
            icon.style.cursor = 'pointer';
            icon.style.display = 'inline-block';
            icon.style.width = '1em';
            icon.style.transition = 'transform 0.2s';
            icon.style.marginRight = '4px';
        }

        // 目录标题
        const titleSpan = document.createElement('span');
        titleSpan.textContent = item.title;
        titleSpan.style.fontWeight = level === 1 ? 'bold' : 'normal';
        titleSpan.style.cursor = (level <= 2 && (hasChildren || hasContent)) ? 'pointer' : 'default';

        // 容器：用于包裹标题和图标
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        if (icon) header.appendChild(icon);
        header.appendChild(titleSpan);
        li.appendChild(header);

        // 子内容容器
        const childContainer = document.createElement('div');
        childContainer.style.display = 'none';

        // 渲染资源链接（三级内容）
        if (hasContent) {
            const resourceUl = document.createElement('ul');
            resourceUl.style.listStyle = 'circle';
            resourceUl.style.marginLeft = '16px';
            item.content.forEach(link => {
                const linkLi = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.title;
                a.target = '_blank';
                linkLi.appendChild(a);
                resourceUl.appendChild(linkLi);
            });
            childContainer.appendChild(resourceUl);
        }

        // 递归渲染子目录
        if (hasChildren) {
            renderDirectoryTree(item.children, childContainer, level + 1);
        }

        // 一级、二级目录可折叠
        if (level <= 2 && (hasChildren || hasContent)) {
            // 默认收缩（可改为 childContainer.style.display = 'block' 默认展开）
            header.addEventListener('click', function (e) {
                e.stopPropagation();
                if (childContainer.style.display === 'none') {
                    childContainer.style.display = 'block';
                    if (icon) icon.style.transform = 'rotate(90deg)';
                } else {
                    childContainer.style.display = 'none';
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
        } else {
            // 三级内容不折叠
            childContainer.style.display = 'block';
        }

        li.appendChild(childContainer);
        ul.appendChild(li);
    });

    container.appendChild(ul);
} 