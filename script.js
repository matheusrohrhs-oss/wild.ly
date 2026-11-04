let currentGame = "wr";
let currentVersion = "14.1.1";
let currentRoleFilter = "Todos";
let currentSectionFilter = "inicio";
let currentSearchQuery = "";

let userProfile = {
  nick: "REMOVAM A ASHE",
  game: "wr",
  currentRank: "Esmeralda",
  peakRank: "Grão-Mestre",
  avatarUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pyke.png"
};

const defaultPosts = [
  {
    id: 1,
    game: "wr",
    role: "Suporte",
    category: "builds",
    author: "REMOVAM A ASHE",
    champion: "Pyke",
    championIcon: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pyke.png",
    title: "Build Wild Rift: Escudo Relíquia, Botas Jonianas, Lâmina de Youmuu e Draktharr",
    items: ["Lâmina de Youmuu", "Crepúsculo de Draktharr", "Presa da Serpente", "Anjo Guardião"],
    score: 0,
    userVote: null,
    comments: []
  },
  {
    id: 2,
    game: "pc",
    role: "Mid",
    category: "builds",
    author: "FakerFan",
    champion: "Ahri",
    championIcon: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png",
    title: "Build LoL PC: Itemização de Ahri Mid na Season 14",
    items: ["Ápice da Tempestade", "Sapatos da Feitiçaria", "Luden", "Cajado do Vazio"],
    score: 0,
    userVote: null,
    comments: []
  }
];

let mockPosts = [];

document.addEventListener('DOMContentLoaded', async () => {
  loadProfileFromStorage();
  loadPostsFromStorage();
  updateProfileHeaderUI();
  setupSidebarNavigation();
  setupFilterButtons();
  setupGlobalSearchListeners();
  switchGame(currentGame);
});

function loadProfileFromStorage() {
  const saved = localStorage.getItem('wildly_user_profile');
  if (saved) {
    try {
      userProfile = JSON.parse(saved);
    } catch(e) {}
  }
}

function saveProfileToStorage() {
  localStorage.setItem('wildly_user_profile', JSON.stringify(userProfile));
}

function updateProfileHeaderUI() {
  const nickEl = document.getElementById('displayHeaderNick');
  const rankEl = document.getElementById('displayHeaderRank');
  const avatarEl = document.getElementById('headerAvatar');

  if (nickEl) nickEl.textContent = userProfile.nick;
  if (rankEl) rankEl.textContent = `${userProfile.currentRank} | Peak: ${userProfile.peakRank}`;
  if (avatarEl) {
    avatarEl.style.backgroundImage = `url('${userProfile.avatarUrl}')`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
  }
}

function openViewProfileModal() {
  const modal = document.getElementById('viewProfileModal');
  if (!modal) return;

  document.getElementById('viewNick').textContent = userProfile.nick || 'Sem Nickname';
  document.getElementById('viewGameBadge').textContent = userProfile.game === 'wr' ? '📱 Wild Rift' : '💻 LoL PC';
  document.getElementById('viewCurrentRank').textContent = userProfile.currentRank || 'N/A';
  document.getElementById('viewPeakRank').textContent = userProfile.peakRank || 'N/A';
  
  const avatarDiv = document.getElementById('viewAvatar');
  if (avatarDiv) {
    avatarDiv.style.backgroundImage = `url('${userProfile.avatarUrl}')`;
  }

  modal.classList.add('active');
}

function closeViewProfileModal() {
  const modal = document.getElementById('viewProfileModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function openProfileModal() {
  closeViewProfileModal();

  const modal = document.getElementById('profileModal');
  if (!modal) return;

  const titleEl = document.getElementById('profileModalTitle');
  if (titleEl) titleEl.textContent = 'Editar Perfil';

  document.getElementById('profileNick').value = userProfile.nick || '';
  document.getElementById('profileGame').value = userProfile.game || 'wr';
  document.getElementById('profileCurrentRank').value = userProfile.currentRank || '';
  document.getElementById('profilePeakRank').value = userProfile.peakRank || '';
  document.getElementById('profileAvatarUrl').value = (userProfile.avatarUrl && !userProfile.avatarUrl.startsWith('data:')) ? userProfile.avatarUrl : '';

  const preview = document.getElementById('avatarPreview');
  if (preview && userProfile.avatarUrl) {
    preview.src = userProfile.avatarUrl;
    preview.style.display = 'inline-block';
  }

  modal.classList.add('active');
}

function openCreateProfileModal() {
  closeViewProfileModal();

  const modal = document.getElementById('profileModal');
  if (!modal) return;

  const titleEl = document.getElementById('profileModalTitle');
  if (titleEl) titleEl.textContent = 'Criar Novo Perfil';

  document.getElementById('profileNick').value = '';
  document.getElementById('profileGame').value = currentGame;
  document.getElementById('profileCurrentRank').value = '';
  document.getElementById('profilePeakRank').value = '';
  document.getElementById('profileAvatarUrl').value = '';

  const preview = document.getElementById('avatarPreview');
  if (preview) {
    preview.style.display = 'none';
  }

  delete userProfile.tempAvatar;
  modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Image = e.target.result;
      document.getElementById('profileAvatarUrl').value = '';
      const preview = document.getElementById('avatarPreview');
      if (preview) {
        preview.src = base64Image;
        preview.style.display = 'inline-block';
      }
      userProfile.tempAvatar = base64Image;
    };
    reader.readAsDataURL(file);
  }
}

function saveProfile(event) {
  event.preventDefault();

  userProfile.nick = document.getElementById('profileNick').value;
  userProfile.game = document.getElementById('profileGame').value;
  userProfile.currentRank = document.getElementById('profileCurrentRank').value;
  userProfile.peakRank = document.getElementById('profilePeakRank').value;

  const urlInput = document.getElementById('profileAvatarUrl').value.trim();

  if (userProfile.tempAvatar) {
    userProfile.avatarUrl = userProfile.tempAvatar;
    delete userProfile.tempAvatar;
  } else if (urlInput) {
    userProfile.avatarUrl = urlInput;
  } else if (!userProfile.avatarUrl) {
    userProfile.avatarUrl = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pyke.png";
  }

  saveProfileToStorage();
  updateProfileHeaderUI();
  closeProfileModal();
}

function openCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function savePost(event) {
  event.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const champion = document.getElementById('postChampion').value.trim();
  const role = document.getElementById('postRole').value;
  const category = document.getElementById('postCategory').value;
  const itemsRaw = document.getElementById('postItems').value.trim();

  const items = itemsRaw ? itemsRaw.split(',').map(i => i.trim()).filter(Boolean) : [];
  const championFormatted = champion.charAt(0).toUpperCase() + champion.slice(1);
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championFormatted}.png`;

  const newPost = {
    id: Date.now(),
    game: currentGame,
    role: role,
    category: category,
    author: userProfile.nick || "Invocador Anônimo",
    champion: championFormatted,
    championIcon: iconUrl,
    title: title,
    items: items.length > 0 ? items : ["Item Padrão"],
    score: 0,
    userVote: null,
    comments: []
  };

  mockPosts.unshift(newPost);
  savePostsToStorage();
  renderPosts();
  closeCreatePostModal();

  document.getElementById('postTitle').value = '';
  document.getElementById('postChampion').value = '';
  document.getElementById('postItems').value = '';
}

function loadPostsFromStorage() {
  const savedPosts = localStorage.getItem('wildly_posts_v6');
  if (savedPosts) {
    try {
      mockPosts = JSON.parse(savedPosts);
      mockPosts.forEach(p => {
        if (p.userVote === undefined) p.userVote = null;
        if (!p.comments) p.comments = [];
        p.comments.forEach(c => {
          if (c.score === undefined) c.score = 0;
          if (c.userVote === undefined) c.userVote = null;
          if (!c.replies) c.replies = [];
        });
      });
    } catch(e) {
      mockPosts = [...defaultPosts];
    }
  } else {
    mockPosts = [...defaultPosts];
    savePostsToStorage();
  }
}

function savePostsToStorage() {
  localStorage.setItem('wildly_posts_v6', JSON.stringify(mockPosts));
}

function switchGame(gameMode) {
  currentGame = gameMode;

  const tabWR = document.getElementById('tabWR');
  const tabPC = document.getElementById('tabPC');
  if (tabWR) tabWR.classList.toggle('active', gameMode === 'wr');
  if (tabPC) tabPC.classList.toggle('active', gameMode === 'pc');

  updateSectionTitle();
  renderPosts();
}

function updateSectionTitle() {
  const label = document.getElementById('currentSectionLabel');
  if (label) {
    const gameName = currentGame === 'wr' ? 'WILD RIFT' : 'LOL PC';
    const sectionDisplay = currentSectionFilter.toUpperCase();
    label.textContent = `${sectionDisplay} - ${gameName}`;
  }
}

function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-menu li');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const text = item.textContent.toLowerCase();

      if (text.includes('in') && text.includes('cio')) {
        currentSectionFilter = "inicio";
      } else if (text.includes('build')) {
        currentSectionFilter = "builds";
      } else if (text.includes('tier')) {
        currentSectionFilter = "tierlist";
      } else if (text.includes('comun')) {
        currentSectionFilter = "comunidade";
      } else {
        currentSectionFilter = "inicio";
      }

      updateSectionTitle();
      renderPosts();
    });
  });
}

function setupGlobalSearchListeners() {
  document.addEventListener('input', (e) => {
    if (e.target && (e.target.matches('input[type="text"]') || e.target.matches('input[type="search"]') || e.target.tagName === 'INPUT')) {
      const isSearchField = e.target.closest('.search-bar') || e.target.id === 'searchInput' || e.target.placeholder.toLowerCase().includes('pesquisar') || e.target.placeholder.toLowerCase().includes('buscar');
      
      if (isSearchField) {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderPosts();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      const parentSearch = btn.closest('.search-bar') || btn.parentElement.querySelector('input');
      if (parentSearch) {
        const input = parentSearch.tagName === 'INPUT' ? parentSearch : parentSearch.querySelector('input');
        if (input) {
          currentSearchQuery = input.value.trim().toLowerCase();
          renderPosts();
        }
      }
    }
  });
}

function renderPosts() {
  const container = document.getElementById('cardsGrid');
  if (!container) return;

  const filteredPosts = mockPosts.filter(post => {
    const matchesGame = post.game === currentGame;
    const matchesRole = currentRoleFilter === "Todos" || post.role === currentRoleFilter;
    
    const postCategory = (post.category || "builds").toLowerCase();
    const matchesSection = (currentSectionFilter === "inicio") || (postCategory === currentSectionFilter);

    const q = currentSearchQuery;
    const matchesSearch = !q || 
      post.title.toLowerCase().includes(q) ||
      post.champion.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q) ||
      (post.items && post.items.some(item => item.toLowerCase().includes(q)));

    return matchesGame && matchesRole && matchesSection && matchesSearch;
  });

  if (filteredPosts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #a0abb6;">
        <p>Nenhuma publicação encontrada para os filtros selecionados.</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredPosts.map(post => {
    const commentsList = post.comments || [];
    const likeClass = post.userVote === 'up' ? 'active-like' : '';
    const dislikeClass = post.userVote === 'down' ? 'active-dislike' : '';

    return `
      <div class="forum-card" data-id="${post.id}">
        <div class="card-top-info">
          <span class="card-topic-title">${(post.category || 'BUILDS').toUpperCase()} <span class="game-badge ${post.game}">${post.game.toUpperCase()}</span></span>
          <span class="card-author-info">Autor: <strong>${post.author}</strong> | Campeão: <strong>${post.champion}</strong></span>
        </div>

        <div class="card-body-content">
          <img src="${post.championIcon}" alt="${post.champion}" class="card-champion-avatar" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pyke.png'" />
          <h3 class="card-main-title">${post.title}</h3>
        </div>

        <div class="items-inventory-box">
          <span class="items-inventory-title">Itens / Detalhes</span>
          <div class="items-list-wrapper">
            ${(post.items || []).map(item => `<span class="item-chip">${item}</span>`).join('')}
          </div>
        </div>

        <div class="card-actions-bar">
          <div class="vote-group">
            <button class="btn-action-icon ${likeClass}" onclick="handleVote(${post.id}, 'up')">&#9650; Like</button>
            <span class="vote-score">${post.score}</span>
            <button class="btn-action-icon ${dislikeClass}" onclick="handleVote(${post.id}, 'down')">&#9660; Deslike</button>
          </div>
          <div class="card-extra-actions">
            <button class="btn-action-icon" onclick="toggleComments(${post.id})">💬 Comentários (${commentsList.length})</button>
            <button class="btn-action-icon" onclick="deletePost(${post.id})">🗑️ Excluir</button>
          </div>
        </div>

        <div id="comments-box-${post.id}" class="comments-section">
          <div class="comments-list">
            ${commentsList.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Nenhum comentário ainda. Seja o primeiro!</p>' : ''}
            ${commentsList.map(c => renderCommentItem(post.id, c)).join('')}
          </div>
          <div class="add-comment-box">
            <input type="text" id="comment-input-${post.id}" placeholder="Escreva um comentário..." onkeypress="if(event.key==='Enter') addComment(${post.id})" />
            <button class="btn-send-comment" onclick="addComment(${post.id})">Enviar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCommentItem(postId, comment) {
  const replies = comment.replies || [];
  const cLikeClass = comment.userVote === 'up' ? 'active-like' : '';
  const cDislikeClass = comment.userVote === 'down' ? 'active-dislike' : '';

  return `
    <div class="comment-item">
      <div class="comment-header">
        <span class="comment-author">${comment.author}</span>
      </div>
      <div class="comment-text">${comment.text}</div>
      <div class="comment-actions">
        <button class="btn-comment-vote ${cLikeClass}" onclick="handleCommentVote(${postId}, ${comment.id}, 'up')">&#9650;</button>
        <span style="font-weight:bold; color:var(--accent-cyan);">${comment.score || 0}</span>
        <button class="btn-comment-vote ${cDislikeClass}" onclick="handleCommentVote(${postId}, ${comment.id}, 'down')">&#9660;</button>
        <button class="btn-reply" onclick="toggleReplyBox(${postId}, ${comment.id})">↩ Responder</button>
      </div>

      <div id="reply-box-${postId}-${comment.id}" class="reply-input-box">
        <input type="text" id="reply-input-${postId}-${comment.id}" placeholder="Escreva uma resposta..." onkeypress="if(event.key==='Enter') addReply(${postId}, ${comment.id})" />
        <button class="btn-send-comment" onclick="addReply(${postId}, ${comment.id})">Enviar</button>
      </div>

      ${replies.length > 0 ? `
        <div class="replies-list">
          ${replies.map(r => `
            <div class="reply-item">
              <div class="comment-author">${r.author}</div>
              <div class="comment-text">${r.text}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function handleVote(postId, direction) {
  const post = mockPosts.find(p => p.id === postId);
  if (!post) return;

  if (post.userVote === direction) {
    if (direction === 'up') post.score -= 1;
    else post.score += 1;
    post.userVote = null;
  } else {
    if (post.userVote === 'up') post.score -= 1;
    if (post.userVote === 'down') post.score += 1;

    if (direction === 'up') post.score += 1;
    else post.score -= 1;

    post.userVote = direction;
  }

  savePostsToStorage();
  renderPosts();
}

function handleCommentVote(postId, commentId, direction) {
  const post = mockPosts.find(p => p.id === postId);
  if (!post || !post.comments) return;

  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return;

  if (comment.score === undefined) comment.score = 0;

  if (comment.userVote === direction) {
    if (direction === 'up') comment.score -= 1;
    else comment.score += 1;
    comment.userVote = null;
  } else {
    if (comment.userVote === 'up') comment.score -= 1;
    if (comment.userVote === 'down') comment.score += 1;

    if (direction === 'up') comment.score += 1;
    else comment.score -= 1;

    comment.userVote = direction;
  }

  savePostsToStorage();
  renderPosts();

  setTimeout(() => {
    const commentsBox = document.getElementById(`comments-box-${postId}`);
    if (commentsBox) commentsBox.classList.add('active');
  }, 50);
}

function toggleComments(postId) {
  const commentsBox = document.getElementById(`comments-box-${postId}`);
  if (commentsBox) {
    commentsBox.classList.toggle('active');
  }
}

function toggleReplyBox(postId, commentId) {
  const box = document.getElementById(`reply-box-${postId}-${commentId}`);
  if (box) {
    box.classList.toggle('active');
  }
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const post = mockPosts.find(p => p.id === postId);
  if (!post) return;

  if (!post.comments) post.comments = [];

  post.comments.push({
    id: Date.now(),
    author: userProfile.nick || "Invocador Anônimo",
    text: text,
    score: 0,
    userVote: null,
    replies: []
  });

  savePostsToStorage();
  renderPosts();

  setTimeout(() => {
    const commentsBox = document.getElementById(`comments-box-${postId}`);
    if (commentsBox) commentsBox.classList.add('active');
  }, 50);
}

function addReply(postId, commentId) {
  const input = document.getElementById(`reply-input-${postId}-${commentId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const post = mockPosts.find(p => p.id === postId);
  if (!post || !post.comments) return;

  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return;

  if (!comment.replies) comment.replies = [];

  comment.replies.push({
    author: userProfile.nick || "Invocador Anônimo",
    text: text
  });

  savePostsToStorage();
  renderPosts();

  setTimeout(() => {
    const commentsBox = document.getElementById(`comments-box-${postId}`);
    if (commentsBox) commentsBox.classList.add('active');
  }, 50);
}

function deletePost(id) {
  mockPosts = mockPosts.filter(p => p.id !== id);
  savePostsToStorage();
  renderPosts();
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentRoleFilter = btn.textContent.trim();
      renderPosts();
    });
  });
}

function toggleContactMenu() {
  const menu = document.getElementById('contactMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

document.addEventListener('click', (e) => {
  const container = document.querySelector('.floating-contact-container');
  const menu = document.getElementById('contactMenu');
  if (container && menu && !container.contains(e.target)) {
    menu.classList.remove('active');
  }
});