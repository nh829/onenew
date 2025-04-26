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