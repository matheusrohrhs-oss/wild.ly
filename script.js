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
  champion: "Xayah",
  skinNum: 0
};

const wildRiftChampionsList = [
  "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa", "Amumu", "Annie", "Ashe", "Aurelion Sol", 
  "Aurora", "Bard", "Blitzcrank", "Braum", "Caitlyn", "Camille", "Cho'Gath", "Corki", "Darius", 
  "Diana", "Dr. Mundo", "Draven", "Ekko", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", 
  "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Irelia", "Janna", "Jarvan IV", 
  "Jax", "Jayce", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Karma", "Kassadin", "Katarina", "Kayle", "Kayn", 
  "Kennen", "Kha'Zix", "Kindred", "Kog'Maw", "K'Sante", "Lee Sin", "Leona", "Lillia", "Lucian", "Lulu", 
  "Lux", "Malphite", "Maokai", "Master Yi", "Mel", "Miss Fortune", "Mordekaiser", "Morgana", "Nami", 
  "Nasus", "Nautilus", "Nidalee", "Nilah", "Nocturne", "Nunu & Willump", "Olaf", "Orianna", "Ornn", 
  "Pantheon", "Pyke", "Rakan", "Rammus", "Renekton", "Rengar", "Rell", "Riven", "Rumble", "Ryze", 
  "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shen", "Shyvana", "Singed", "Sion", "Sivir", 
  "Smolder", "Sona", "Soraka", "Swain", "Syndra", "Talon", "Taliyah", "Teemo", "Thresh", "Tristana", 
  "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz", 
  "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xin Zhao", 
  "Yasuo", "Yone", "Yorick", "Yunara", "Yuumi", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"
];

let allChampionsData = [];

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
    score: 5
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
    score: 12
  }
];

let mockPosts = [];

document.addEventListener('DOMContentLoaded', async () => {
  loadProfileFromStorage();
  loadPostsFromStorage();
  await fetchLatestVersionAndChampions();
  setupSidebarNavigation();
  setupFilterButtons();
  setupGlobalSearchListeners();
  switchGame(currentGame);
});

function loadPostsFromStorage() {
  const savedPosts = localStorage.getItem('wildly_posts_v2');
  if (savedPosts) {
    try {
      mockPosts = JSON.parse(savedPosts);
    } catch(e) {
      mockPosts = [...defaultPosts];
    }
  } else {
    mockPosts = [...defaultPosts];
    savePostsToStorage();
  }
}

function savePostsToStorage() {
  localStorage.setItem('wildly_posts_v2', JSON.stringify(mockPosts));
}

async function fetchLatestVersionAndChampions() {
  try {
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionRes.json();
    currentVersion = versions[0];

    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/pt_BR/champion.json`);
    const data = await response.json();
    
    allChampionsData = Object.keys(data.data).map(key => ({
      id: key,
      name: data.data[key].name,
      icon: `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${key}.png`
    }));
  } catch (error) {
    console.error('Erro ao buscar campeões:', error);
  }
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #a0a0a0;">
        <p>Nenhuma publicação encontrada para os filtros selecionados.</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredPosts.map(post => `
    <div class="forum-card" data-id="${post.id}">
      <div class="card-top-info">
        <span class="card-topic-title">${(post.category || 'BUILDS').toUpperCase()} <span class="game-badge ${post.game}">${post.game.toUpperCase()}</span></span>
        <span class="card-author-info">Autor: <strong>${post.author}</strong> | Campeão: <strong>${post.champion}</strong></span>
      </div>

      <div class="card-body-content">
        <img src="${post.championIcon}" alt="${post.champion}" class="card-champion-avatar" />
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
          <button class="btn-action-icon active-upvote" onclick="handleVote(this, 'up')">&#9650; Like</button>
          <span class="vote-score positive">${post.score}</span>
          <button class="btn-action-icon" onclick="handleVote(this, 'down')">&#9660; Deslike</button>
        </div>
        <div>
          <button class="btn-action-icon" onclick="deletePost(${post.id})">Excluir</button>
        </div>
      </div>
    </div>
  `).join('');
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

function handleVote(button, direction) {
  const card = button.closest('.forum-card');
  const postId = parseInt(card.dataset.id, 10);
  const post = mockPosts.find(p => p.id === postId);

  if (!post) return;

  if (direction === 'up') {
    post.score += 1;
  } else {
    post.score -= 1;
  }

  savePostsToStorage();
  renderPosts();
}

function loadProfileFromStorage() {
  const saved = localStorage.getItem('wildly_user_profile');
  if (saved) {
    try {
      userProfile = JSON.parse(saved);
    } catch(e) {}
  }
}