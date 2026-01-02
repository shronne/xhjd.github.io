async function getData() {
  // 1. Try data.json
  try {
    const response = await fetch('data.json');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch(e) {}

  // 2. LocalStorage
  const s = localStorage.getItem('portfolioData');
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

async function byId(id) {
  const d = await getData();
  if (!Array.isArray(d)) return null;
  return d.find(x => String(x.id) === String(id)) || null;
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text || '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const p = id ? await byId(id) : null;
  if (!p) return;
  setText('#project-title', p.title);
  document.title = `${p.title} - 平面设计师作品集`;
  
  // 处理简介
  const introEl = document.getElementById('project-intro');
  if (introEl) {
      const parts = [];
      
      // Check for new dynamic intro array
      if (p.intro && Array.isArray(p.intro)) {
          p.intro.forEach(item => {
              if (item.value && item.value.trim() !== '') {
                  parts.push(`${item.label}：${item.value}`);
              }
          });
      } else {
          // Fallback to legacy fields
          const labels = {
              year: p.label_year || '年份',
              client: p.label_client || '委托方',
              publisher: p.label_publisher || '出版社',
              introtype: p.label_introtype || '类型'
          };

          if (p.year) parts.push(`${labels.year}：${p.year}`);
          if (p.client) parts.push(`${labels.client}：${p.client}`);
          if (p.publisher) parts.push(`${labels.publisher}：${p.publisher}`);
          if (p.introtype) parts.push(`${labels.introtype}：${p.introtype}`);
      }
      
      if (parts.length > 0) {
          introEl.textContent = parts.join(' ｜ ');
          introEl.style.display = 'block';
      } else {
          introEl.style.display = 'none';
      }
  }

  // Render rich text detail content
  const contentEl = document.getElementById('project-detail-text');
  if (contentEl) {
      contentEl.innerHTML = p.detail || '';
  }
})
