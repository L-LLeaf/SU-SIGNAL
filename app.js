(() => {
  const $ = (selector) => document.querySelector(selector);
  const lockScreen = $("#lock-screen");
  const mainScreen = $("#main-screen");
  const appView = $("#app-view");
  const unlockForm = $("#unlock-form");
  const passwordInput = $("#password");
  const error = $("#unlock-error");
  const appNames = {
    chat: ["CHAT", "聊天", "一条只属于 SU 与 LIGHT 的私人对话通道。"],
    cards: ["CARDS", "字卡库", "管理内置字卡与玩家自己的自定义字卡。"],
    profile: ["PROFILE", "个人资料", "分别设置玩家与苏新皓的头像和显示信息。"],
    engine: ["ENGINE", "回复引擎", "调整随机回复、连接动画与消息生成规则。"],
    style: ["STYLE", "外观设置", "自定义主题、字体、聊天气泡与聊天背景。"],
    notice: ["NOTICE", "通知", "管理主动消息的浏览器通知与显示内容。"],
    data: ["DATA", "数据管理", "备份、恢复与管理保存在本设备中的数据。"],
    choice: ["CHOICE", "选择", "把难以决定的小事交给转盘。"]
  };
  const date = new Intl.DateTimeFormat("zh-CN", { year:"numeric", month:"long", day:"numeric" }).format(new Date());
  $("#today-date").textContent = date;

  unlockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (passwordInput.value === "苏新皓C位") {
      error.textContent = "";
      lockScreen.classList.add("hidden");
      mainScreen.classList.remove("hidden");
      sessionStorage.setItem("su-signal-unlocked", "1");
    } else {
      error.textContent = "访问密码不正确，请再试一次。";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  function openApp(key) {
    const item = appNames[key];
    if (!item) return;
    mainScreen.classList.add("hidden");
    appView.classList.remove("hidden");
    appView.innerHTML = `
      <header class="app-view-header">
        <button class="back-button" type="button" id="back-home">← HOME</button>
        <span class="app-kicker">SU / SIGNAL — ${key.toUpperCase()}</span>
      </header>
      <p class="eyebrow" style="margin-top:42px">PRIVATE COMMUNICATION SYSTEM / APP</p>
      <h2>${item[0]}<br><em>${item[1]}</em></h2>
      <p class="app-description">${item[2]}</p>
      <div class="coming-panel"><strong>MODULE IN PROGRESS</strong><span>BUILD 01 / FOUNDATION</span></div>`;
    $("#back-home").addEventListener("click", closeApp);
  }
  function closeApp() {
    appView.classList.add("hidden");
    appView.innerHTML = "";
    mainScreen.classList.remove("hidden");
  }
  document.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => openApp(button.dataset.app));
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();