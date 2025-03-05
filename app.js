const API_KEY = 'sk-fegrphpfouumnomwsqolzpsezlicvogqaautkvsjjwqhfrlf';
let selectedStyles = new Set();

// 风格按钮点击事件
document.querySelector('.style-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('style-btn')) {
        const btn = e.target;
        btn.classList.toggle('selected');
        if (btn.classList.contains('selected')) {
            if (selectedStyles.size >= 3) {
                alert('最多选择3种风格');
                btn.classList.remove('selected');
                return;
            }
            selectedStyles.add(btn.dataset.style);
        } else {
            selectedStyles.delete(btn.dataset.style);
        }
    }
});

async function generateReply() {
    const input = document.getElementById('chat-input').value.trim();
    if (!input) {
        alert('请输入对话内容');
        return;
    }
    if (selectedStyles.size === 0) {
        alert('请选择至少1种风格');
        return;
    }

    const btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.innerHTML = '生成中<span class="loading-dots"></span>';

    try {
        const responses = await Promise.all(
            Array.from(selectedStyles).map(style => 
                fetch('https://api.siliconflow.cn/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "deepseek-ai/DeepSeek-V2.5",
                        messages: [{
                            role: "user",
                            content: `请用${style}风格回复以下内容：${input}`
                        }],
                        temperature: 0.7
                    })
                }).then(res => res.json())
            )
        );

        showResults(responses.map((res, i) => ({
            style: Array.from(selectedStyles)[i],
            content: res.choices[0].message.content
        })));
    } catch (error) {
        alert('生成失败，请重试');
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '生成回复';
    }
}

function showResults(results) {
    const container = document.getElementById('result-container');
    container.innerHTML = results.map(result => `
        <div class="result-item">
            <div class="result-style">${result.style}：</div>
            <div class="result-content">${result.content}</div>
            <button class="copy-btn" onclick="copyText(this)">复制</button>
        </div>
    `).join('');
}

function copyText(btn) {
    const text = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '已复制';
        setTimeout(() => btn.textContent = '复制', 2000);
    });
}