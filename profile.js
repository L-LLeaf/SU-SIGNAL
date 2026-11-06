(() => {
  const KEY = "su-signal-profile-v1";
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const defaults = { playerName:"LIGHT", suName:"苏新皓", playerAvatar:"./assets/player-default.webp", suAvatar:"./assets/su-default.webp" };
  let root = null, profile = null;
  function load() {
    try { profile = {...defaults, ...(JSON.parse(localStorage.getItem(KEY) || "{}"))}; }
    catch { profile = {...defaults}; }
    profile.suName = "苏新皓";
    if (!profile.playerAvatar) profile.playerAvatar = defaults.playerAvatar;
    if (!profile.suAvatar) profile.suAvatar = defaults.suAvatar;
  }
  function save() {
    profile.playerName = ($("#profile-player-name", root)?.value || "").trim().slice(0,20) || "LIGHT";
    profile.suName = "苏新皓";
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      renderPreviews();
      const sync = window.SUSignalCards?.syncNickname?.(profile.playerName);
      if (sync && typeof sync.then === "function") {
        sync.then(result => showStatus("资料已保存 · 已同步昵称字卡")).catch(() => showStatus("资料已保存，但昵称字卡同步失败，请重新保存"));
      } else {
        showStatus("资料已保存");
      }
    } catch {
      showStatus("保存失败：图片可能过大，请换一张图片再试");
    }
  }
  function avatarMarkup(value, fallback, cls="profile-avatar") {
    const defaultSrc = fallback === "L" ? "./assets/player-default.webp" : "./assets/su-default.webp";
    const src = value || defaultSrc;
    return '<div class="'+cls+'"><img src="'+escapeHTML(src)+'" alt="头像预览" onerror="this.remove();this.parentNode.textContent=\''+fallback+'\'"></div>';
  }
  function renderPreviews() {
    if (!root) return;
    const player = $("#profile-player-preview", root), su = $("#profile-su-preview", root);
    if (player) player.innerHTML = avatarMarkup(profile.playerAvatar, "L");
    if (su) su.innerHTML = avatarMarkup(profile.suAvatar, "SU");
  }
  function showStatus(message) {
    const el = $("#profile-status", root);
    if (el) { el.textContent = message; clearTimeout(showStatus.timer); showStatus.timer = setTimeout(()=>{if(el.isConnected)el.textContent="";},2600); }
  }
  function render() {
    root.innerHTML = `
      <header class="app-view-header">
        <button class="back-button" type="button" data-profile-action="back">← HOME</button>
        <span class="app-kicker">SU / SIGNAL — PROFILE</span>
      </header>
      <section class="profile-heading">
        <p class="eyebrow">IDENTITY SETTINGS / 03</p>
        <h2>PROFILE<br><em>个人资料</em></h2>
        <p>设置这条连接中的双方头像与玩家昵称。修改会同步显示在 CHAT 中。</p>
      </section>
      <section class="profile-list">
        <article class="profile-card">
          <div class="profile-card-top"><span>01 / PLAYER</span><span>可自定义</span></div>
          <div class="profile-person">
            <div id="profile-player-preview">${avatarMarkup(profile.playerAvatar,"L")}</div>
            <div class="profile-person-meta"><strong>玩家资料</strong><small>YOUR PROFILE</small></div>
          </div>
          <label class="profile-field-label" for="profile-player-name">显示昵称</label>
          <input id="profile-player-name" class="profile-name-input" type="text" maxlength="20" autocomplete="nickname" value="${escapeHTML(profile.playerName)}" placeholder="输入你的昵称">
          <label class="profile-upload" for="profile-player-file"><span>更换玩家头像</span><span>UPLOAD ↗</span></label>
          <input class="profile-file-input" id="profile-player-file" type="file" accept="image/*">
          <button class="profile-reset" type="button" data-profile-action="reset-player">恢复默认头像</button>
        </article>
        <article class="profile-card">
          <div class="profile-card-top"><span>02 / SU</span><span>姓名固定</span></div>
          <div class="profile-person">
            <div id="profile-su-preview">${avatarMarkup(profile.suAvatar,"SU")}</div>
            <div class="profile-person-meta"><strong>苏新皓</strong><small>SU XINHAO</small></div>
          </div>
          <div class="profile-fixed-name"><span>显示名称</span><strong>苏新皓</strong><small>姓名不可修改</small></div>
          <label class="profile-upload" for="profile-su-file"><span>更换苏新皓头像</span><span>UPLOAD ↗</span></label>
          <input class="profile-file-input" id="profile-su-file" type="file" accept="image/*">
          <button class="profile-reset" type="button" data-profile-action="reset-su">恢复默认头像</button>
        </article>
      </section>
      <div class="profile-save-row"><span id="profile-status" role="status" aria-live="polite"></span><button type="button" data-profile-action="save">保存资料 ↗</button></div>
      <p class="profile-note">头像图片会压缩后保存在当前设备，不会上传到服务器。建议使用清晰的正方形图片。</p>`;
    renderPreviews();
  }
  function readImage(file, target) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { showStatus("请选择图片文件"); return; }
    if (file.size > 15 * 1024 * 1024) { showStatus("图片超过 15MB，请先压缩后上传"); return; }
    const reader = new FileReader();
    reader.onerror = () => showStatus("图片读取失败，请重试");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => showStatus("无法识别这张图片格式");
      image.onload = () => {
        const side = 512, canvas = document.createElement("canvas");
        canvas.width = side; canvas.height = side;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(side/image.width, side/image.height);
        const width = image.width*scale, height = image.height*scale;
        ctx.drawImage(image,(side-width)/2,(side-height)/2,width,height);
        try {
          profile[target] = canvas.toDataURL("image/jpeg",0.84);
          renderPreviews();
          showStatus("头像已更换，记得保存资料");
        } catch { showStatus("图片处理失败，请换一张图片"); }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  function init(el) {
    root = el; load(); render();
    if (root.dataset.profileBound) return;
    root.dataset.profileBound = "1";
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-profile-action]");
      if (!button) return;
      const action = button.dataset.profileAction;
      if (action === "back") { window.SUSignalCloseApp?.(); return; }
      if (action === "save") { save(); return; }
      if (action === "reset-player") { profile.playerAvatar=defaults.playerAvatar; renderPreviews(); showStatus("玩家头像已恢复默认，记得保存"); return; }
      if (action === "reset-su") { profile.suAvatar=defaults.suAvatar; renderPreviews(); showStatus("苏新皓头像已恢复默认，记得保存"); return; }
    });
    root.addEventListener("change", event => {
      if (event.target.id === "profile-player-file") readImage(event.target.files?.[0],"playerAvatar");
      if (event.target.id === "profile-su-file") readImage(event.target.files?.[0],"suAvatar");
      if (event.target.matches(".profile-file-input")) event.target.value="";
    });
  }
  window.SUSignalProfile = {init, getProfile:()=>({...profile})};
})();