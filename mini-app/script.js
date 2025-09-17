(function(){
  // Configuration
  let config = {
    apiKey: localStorage.getItem('gdrive_api_key') || '',
    folderId: localStorage.getItem('gdrive_folder_id') || '',
    rootFolderId: localStorage.getItem('gdrive_folder_id') || ''
  };

  let currentFolderId = config.folderId;
  let currentFiles = [];
  let filteredFiles = [];
  let currentView = 'list';

  // DOM Elements
  const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    listView: document.getElementById('listView'),
    gridView: document.getElementById('gridView'),
    refreshBtn: document.getElementById('refreshBtn'),
    currentPath: document.getElementById('currentPath'),
    fileExplorer: document.getElementById('fileExplorer'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    fileList: document.getElementById('fileList'),
    emptyState: document.getElementById('emptyState'),
    fileCount: document.getElementById('fileCount'),
    configModal: document.getElementById('configModal'),
    folderIdInput: document.getElementById('folderIdInput'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveConfig: document.getElementById('saveConfig'),
    closeModal: document.getElementById('closeModal'),
    year: document.getElementById('year')
  };

  // Initialize
  function init() {
    elements.year.textContent = new Date().getFullYear();
    
    // Check if configuration exists
    if (!config.apiKey || !config.folderId) {
      showConfigModal();
    } else {
      loadFiles();
    }

    // Event listeners
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.listView.addEventListener('click', () => setView('list'));
    elements.gridView.addEventListener('click', () => setView('grid'));
    elements.refreshBtn.addEventListener('click', loadFiles);
    elements.saveConfig.addEventListener('click', saveConfiguration);
    elements.closeModal.addEventListener('click', hideConfigModal);
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideConfigModal();
    });
  }

  // Google Drive API Functions
  function loadFiles(folderId = currentFolderId) {
    if (!config.apiKey || !folderId) {
      showConfigModal();
      return;
    }

    showLoading();
    
    const url = `https://www.googleapis.com/drive/v3/files?` +
      `q='${folderId}'+in+parents&` +
      `key=${config.apiKey}&` +
      `fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)&` +
      `orderBy=folder,name`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        currentFiles = data.files || [];
        filteredFiles = [...currentFiles];
        renderFiles();
        updateFileCount();
        hideLoading();
      })
      .catch(error => {
        console.error('Error loading files:', error);
        showError('Failed to load files. Please check your API key and folder ID.');
        hideLoading();
      });
  }

  // File Type Detection
  function getFileIcon(mimeType, name) {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁';
    
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      // Documents
      'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📄',
      // Images
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      // Videos
      'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬', 'mov': '🎬', 'webm': '🎬',
      // Audio
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵',
      // Archives
      'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦',
      // Code
      'js': '⚡', 'html': '🌐', 'css': '🎨', 'json': '🔧'
    };
    
    return icons[ext] || '📄';
  }

  // File Size Formatting
  function formatFileSize(bytes) {
    if (!bytes || bytes === '0') return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Date Formatting
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays/7)} weeks ago`;
    return date.toLocaleDateString();
  }

  // Render Functions
  function renderFiles() {
    const container = elements.fileList;
    container.innerHTML = '';

    if (filteredFiles.length === 0) {
      showEmptyState();
      return;
    }

    hideEmptyState();
    container.style.display = 'flex';

    filteredFiles.forEach(file => {
      const fileItem = createFileItem(file);
      container.appendChild(fileItem);
    });
  }

  function createFileItem(file) {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const item = document.createElement('div');
    item.className = `file-item ${isFolder ? 'folder' : 'file'}`;
    
    const sizeText = file.size ? formatFileSize(parseInt(file.size)) : '';
    const typeText = isFolder ? 'Folder' : 'File';
    const details = `${typeText}${sizeText ? ' • ' + sizeText : ''} • Modified ${formatDate(file.modifiedTime)}`;

    item.innerHTML = `
      <div class="file-icon">${getFileIcon(file.mimeType, file.name)}</div>
      <div class="file-info">
        <div class="file-name" title="${file.name}">${file.name}</div>
        <div class="file-details">${details}</div>
      </div>
      <div class="file-actions">
        ${isFolder ? 
          `<button class="btn-action" onclick="openFolder('${file.id}', '${file.name}')">Open</button>` :
          `<button class="btn-action" onclick="openFile('${file.webViewLink}')">View</button>`
        }
      </div>
    `;

    return item;
  }

  // Navigation Functions
  window.openFolder = function(folderId, folderName) {
    currentFolderId = folderId;
    elements.currentPath.textContent = `📁 ${folderName}`;
    loadFiles(folderId);
  };

  window.openFile = function(webViewLink) {
    if (webViewLink) {
      window.open(webViewLink, '_blank');
    }
  };

  // Search Functionality
  function handleSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();
    
    if (!query) {
      filteredFiles = [...currentFiles];
    } else {
      filteredFiles = currentFiles.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }
    
    renderFiles();
    updateFileCount();
  }

  // View Controls
  function setView(view) {
    currentView = view;
    elements.listView.classList.toggle('active', view === 'list');
    elements.gridView.classList.toggle('active', view === 'grid');
    elements.fileList.classList.toggle('grid-view', view === 'grid');
  }

  // UI State Functions
  function showLoading() {
    elements.loadingIndicator.style.display = 'flex';
    elements.fileList.style.display = 'none';
    elements.emptyState.style.display = 'none';
  }

  function hideLoading() {
    elements.loadingIndicator.style.display = 'none';
  }

  function showEmptyState() {
    elements.emptyState.style.display = 'flex';
    elements.fileList.style.display = 'none';
  }

  function hideEmptyState() {
    elements.emptyState.style.display = 'none';
  }

  function updateFileCount() {
    const count = filteredFiles.length;
    elements.fileCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  }

  function showError(message) {
    elements.emptyState.innerHTML = `
      <div class="empty-icon">⚠️</div>
      <h3>Error</h3>
      <p>${message}</p>
      <button class="btn-primary" onclick="location.reload()">Retry</button>
    `;
    elements.emptyState.style.display = 'flex';
  }

  // Configuration Modal
  function showConfigModal() {
    elements.configModal.style.display = 'flex';
    elements.folderIdInput.value = config.folderId;
    elements.apiKeyInput.value = config.apiKey;
  }

  function hideConfigModal() {
    elements.configModal.style.display = 'none';
  }

  function saveConfiguration() {
    const newFolderId = elements.folderIdInput.value.trim();
    const newApiKey = elements.apiKeyInput.value.trim();

    if (!newFolderId || !newApiKey) {
      alert('Please enter both Folder ID and API Key');
      return;
    }

    config.folderId = newFolderId;
    config.apiKey = newApiKey;
    config.rootFolderId = newFolderId;
    currentFolderId = newFolderId;

    localStorage.setItem('gdrive_folder_id', newFolderId);
    localStorage.setItem('gdrive_api_key', newApiKey);

    hideConfigModal();
    elements.currentPath.textContent = '📁 Root';
    loadFiles();
  }

  // Demo Mode (if no API configured)
  function loadDemoFiles() {
    const demoFiles = [
      { id: '1', name: 'Documents', mimeType: 'application/vnd.google-apps.folder', modifiedTime: '2024-01-15T10:00:00Z' },
      { id: '2', name: 'Photos', mimeType: 'application/vnd.google-apps.folder', modifiedTime: '2024-01-14T15:30:00Z' },
      { id: '3', name: 'Resume.pdf', mimeType: 'application/pdf', size: '245760', modifiedTime: '2024-01-10T09:15:00Z', webViewLink: '#' },
      { id: '4', name: 'vacation.jpg', mimeType: 'image/jpeg', size: '2048000', modifiedTime: '2024-01-08T14:20:00Z', webViewLink: '#' },
      { id: '5', name: 'presentation.mp4', mimeType: 'video/mp4', size: '15728640', modifiedTime: '2024-01-05T11:45:00Z', webViewLink: '#' }
    ];

    currentFiles = demoFiles;
    filteredFiles = [...currentFiles];
    renderFiles();
    updateFileCount();
    hideLoading();
  }

  // Initialize app
  init();

  // Add demo mode for testing without API
  window.loadDemo = function() {
    hideConfigModal();
    loadDemoFiles();
  };

})();
