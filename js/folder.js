document.addEventListener('DOMContentLoaded', () => {
    fetch('data/resources.json')
        .then(res => res.json())
        .then(data => {
            renderDirectoryTree(data, document.querySelector('.directory-tree'));
        });
});

// 递归渲染目录树，支持折叠/展开
function renderDirectoryTree(data, container, level = 1) {
    if (!data || data.length === 0) return;
    const ul = document.createElement('ul');
    data.forEach(item => {
        const li = document.createElement('li');
        const hasChildren = item.children && item.children.length > 0;
        const hasContent = item.content && item.content.length > 0;

        let icon = null;
        if (level <= 2 && (hasChildren || hasContent)) {
            icon = document.createElement('span');
            icon.className = 'triangle collapsed';
            icon.textContent = '▶';
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = item.title;
        titleSpan.style.fontWeight = level === 1 ? 'bold' : 'normal';
        titleSpan.style.cursor = (level <= 2 && (hasChildren || hasContent)) ? 'pointer' : 'default';

        const header = document.createElement('div');
        if (icon) header.appendChild(icon);
        header.appendChild(titleSpan);
        li.appendChild(header);

        const childContainer = document.createElement('div');
        childContainer.style.display = 'none';

        if (hasContent) {
            const resourceUl = document.createElement('ul');
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

        if (hasChildren) {
            renderDirectoryTree(item.children, childContainer, level + 1);
        }

        if (level <= 2 && (hasChildren || hasContent)) {
            header.addEventListener('click', function (e) {
                e.stopPropagation();
                if (childContainer.style.display === 'none') {
                    childContainer.style.display = 'block';
                    if (icon) icon.className = 'triangle expanded';
                } else {
                    childContainer.style.display = 'none';
                    if (icon) icon.className = 'triangle collapsed';
                }
            });
        } else {
            childContainer.style.display = 'block';
        }

        li.appendChild(childContainer);
        ul.appendChild(li);
    });
    container.appendChild(ul);
}
