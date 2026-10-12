(function () {
  const $ = (s) => document.querySelector(s);
  const R = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

  const DEFAULT_MENU = [
    {
      id: 0,
      c: "Milk Tea",
      n: "Classic Milk Tea",
      p: 22000,
      d: "Teh hitam creamy dengan susu murni",
      k: "#e6cba8",
    },
    {
      id: 1,
      c: "Milk Tea",
      n: "Brown Sugar Milk Tea",
      p: 26000,
      d: "Teh susu gula aren karamel gurih",
      k: "#d9b48c",
    },
    {
      id: 2,
      c: "Milk Tea",
      n: "Taro Milk Tea",
      p: 25000,
      d: "Rasa taro manis dan lembut",
      k: "#c9a8e6",
    },
    {
      id: 3,
      c: "Matcha",
      n: "Matcha Latte",
      p: 28000,
      d: "Matcha Jepang asli dengan susu segar",
      k: "#a9d6a0",
    },
    {
      id: 4,
      c: "Matcha",
      n: "Strawberry Matcha",
      p: 30000,
      d: "Perpaduan stroberi manis dan matcha",
      k: "#f5b9c8",
    },
    {
      id: 5,
      c: "Matcha",
      n: "Matcha Cloud",
      p: 29000,
      d: "Matcha legit dengan krim tebal",
      k: "#b7e0a8",
    },
    {
      id: 6,
      c: "Fruit Tea",
      n: "Lychee Tea",
      p: 22000,
      d: "Teh buah leci wangi dan segar",
      k: "#f5d0dc",
    },
    {
      id: 7,
      c: "Fruit Tea",
      n: "Peach Oolong",
      p: 23000,
      d: "Teh Oolong rasa persik manis",
      k: "#ffd2a8",
    },
    {
      id: 8,
      c: "Fruit Tea",
      n: "Passion Fruit Tea",
      p: 24000,
      d: "Teh buah markisa segar asam manis",
      k: "#ffe28a",
    },
  ];

  let S = {
    users: {
      "08123456789": {
        name: "Staf meltéa",
        pin: "2108",
        points: 240,
        vouchers: [
          {
            id: 101,
            ms: 5,
            name: "Diskon 10%",
            t: "pct",
            v: 10,
            used: false,
          },
        ],
        hist: [
          {
            t: Date.now() - 3600000,
            d: "1× Brown Sugar",
            pts: 26,
            total: 26000,
          },
        ],
      },
    },
    cur: null,
    orders: [
      {
        id: "MT48214",
        ph: "08123456789",
        name: "Rani",
        items: [
          {
            n: "Brown Sugar Milk Tea",
            q: 2,
            d: "Regular · Normal · Normal · +Boba",
          },
        ],
        total: 62000,
        status: "baru",
        source: "Website",
        t: Date.now() - 300000,
      },
      {
        id: "MT48213",
        ph: "08998877665",
        name: "Dimas",
        items: [
          { n: "Matcha Latte", q: 1, d: "Large · Less Sugar · Less Ice" },
        ],
        total: 32000,
        status: "dibuat",
        source: "Kasir",
        t: Date.now() - 600000,
      },
      {
        id: "MT48212",
        ph: "08112233445",
        name: "Siti",
        items: [
          { n: "Lychee Tea", q: 1, d: "Regular · Normal · Normal" },
        ],
        total: 22000,
        status: "selesai",
        source: "Kasir",
        t: Date.now() - 1200000,
      },
    ],
    cart: [],
    posCart: [],
    posMember: null,
    posPayMethod: "QRIS",
    staffLoggedIn: false,
    queueFilter: "Semua",
    alarmOn: true,
    myLocalOrderIds: [],
    melristeaChat: [
      {
        sender: "bot",
        text: "Halo! Aku Melristea 🤖, barista AI kecerdasan buatan (Gemini) meltéa.\n\nBingung pilih minuman apa hari ini? Beri tahu aku cuaca di tempatmu atau suasana hatimu saat ini!",
      },
    ],
    menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
  };

  try {
    const saved = localStorage.getItem("meltea_app_db");
    if (saved) {
      const parsed = JSON.parse(saved);
      S = Object.assign(S, parsed);
      if (!S.menu || !S.menu.length) {
        S.menu = JSON.parse(JSON.stringify(DEFAULT_MENU));
      }
    }
  } catch (e) {}

  const save = () => {
    try {
      localStorage.setItem("meltea_app_db", JSON.stringify(S));
    } catch (e) {}
  };
  const U = () => (S.cur ? S.users[S.cur] : null);

  let M = S.menu;

  const TOP = {
    Boba: 5000,
    "Grass Jelly": 4000,
    Pudding: 5000,
    "Cheese Foam": 7000,
  };
  let page = "home";
  let cat = "Semua";
  let posCat = "Semua";
  let sel = null;
  let authMode = "login";
  let authErr = "";
  let vsel = null;
  let useP = false;

  window.handleLogoClick = () => go("home");
  window.handleFooterClick = () => {};
  window.go = (p) => {
    page = p;
    nav();
    render();
  };
  window.render = () => render();
  window.setCat = (c) => {
    cat = c;
    render();
  };
  window.setPosCat = (c) => {
    posCat = c;
    render();
  };

  const cup = (k, w) =>
    `<svg style="--c:${k};${w || ""}"><use href="#cup"/></svg>`;

  function renderCupOrImg(m, cupFn, styleStr) {
    if (m && m.img) {
      return `<img src="${m.img}" alt="${m.n}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    }
    return cupFn
      ? cupFn(m ? m.k : "#1F45A3", styleStr)
      : cup(m ? m.k : "#1F45A3", styleStr);
  }

  const unit = (i) => {
    const item = M.find((m) => m.id === i.id) || M[0];
    return (
      (item ? item.p : 0) +
      (i.size === "Large" ? 4000 : 0) +
      i.tops.reduce((a, t) => a + TOP[t], 0)
    );
  };
  const sub = () => S.cart.reduce((a, i) => a + unit(i) * i.qty, 0);
  const desc = (i) =>
    `${i.size} · Gula ${i.sugar} · Es ${i.ice}${i.tops.length ? " · +" + i.tops.join(", ") : ""}`;

  function disc(v) {
    const s = sub();
    if (!v || !s) return 0;
    if (v.t === "rp") return Math.min(v.v, s);
    if (v.t === "pct") return (s * v.v) / 100;
    if (v.t === "up")
      return S.cart.some((i) => i.size === "Large") ? v.v : 0;
    if (v.t === "free") return Math.min(...S.cart.map(unit));
    return 0;
  }

  function calc() {
    const u = S.cur && U();
    const v =
      u && vsel != null
        ? u.vouchers.find((x) => x.id == vsel && !x.used)
        : null;
    const d = disc(v);
    const a = sub() - d;
    const pu = u && useP ? Math.min(u.points, Math.floor(a)) : 0;
    return { v, d, pu, total: Math.max(0, a - pu) };
  }

  function toast(t) {
    let e = $("#toast");
    if (!e) return;
    e.textContent = t;
    e.style.opacity = 1;
    setTimeout(() => (e.style.opacity = 0), 2200);
  }

  function playNotificationSound() {
    if (!S.alarmOn) return;
    try {
      const ctx = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {}
  }
  window.playNotificationSound = playNotificationSound;

  function nav() {
    const cartQty = S.cart.reduce((a, i) => a + i.qty, 0);
    const u = S.cur && U();

    let brandHtml = `<div class="nav-brand"><span class="d lg" onclick="handleLogoClick()">meltéa</span>`;
    if (S.staffLoggedIn) {
      brandHtml += `<span class="stf-badge">STAF MODE</span>`;
    }
    brandHtml += `</div>`;

    let linksHtml = `<div class="nav-links">`;
    if (!S.staffLoggedIn) {
      const L = [
        ["home", "🏠 Home"],
        ["menu", "🍵 Menu"],
        ["melristea", "🤖 Tanya Melristea"],
        ["track", "📦 Lacak"],
        ["member", "⭐ Member"],
      ];
      linksHtml += L.map(
        (l) =>
          `<a onclick="go('${l[0]}')" class="${page === l[0] ? "on" : ""}">${l[1]}</a>`,
      ).join("");
    } else {
      const L = [
        ["staff-queue", "📋 Antrean"],
        ["staff-pos", "💳 POS Kasir"],
        ["menu", "🍵 Kelola Menu"],
        ["staff-rekap", "📊 Rekap AI"],
      ];
      linksHtml += L.map(
        (l) =>
          `<a onclick="go('${l[0]}')" class="${page === l[0] ? "on" : ""}">${l[1]}</a>`,
      ).join("");
    }
    linksHtml += `</div>`;

    let actionsHtml = `<div class="nav-actions">`;
    if (!S.staffLoggedIn) {
      actionsHtml += `<a onclick="go('cart')" class="bt sm" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;">🛒 <span class="nav-badge">${cartQty}</span></a>`;
      if (u)
        actionsHtml += `<a onclick="go('member')" class="bt o sm">⭐ ${u.points}</a>`;
    } else {
      actionsHtml += `<a onclick="logoutStaff()" class="bt o sm" style="border-color:var(--pk);color:var(--pk)">Keluar Staf</a>`;
    }
    actionsHtml += `</div>`;

    $("#nav").innerHTML =
      `<div class="nav-container">${brandHtml}${linksHtml}${actionsHtml}</div>`;
  }

  function modal(h) {
    const o = $("#ov");
    o.innerHTML = h
      ? `<div class="ovl" onclick="if(event.target===this) closeModal()"><div class="sheet">${h}</div></div>`
      : "";
  }
  window.closeModal = () => modal("");

  window.openModalItem = (id) => {
    sel = {
      id,
      size: "Regular",
      sugar: "Normal",
      ice: "Normal",
      tops: [],
      qty: 1,
    };
    renderItemModal();
  };

  window.openModalWithConfig = (id, size, sugar, ice, tops) => {
    sel = {
      id,
      size: size || "Regular",
      sugar: sugar || "Normal",
      ice: ice || "Normal",
      tops: tops || [],
      qty: 1,
    };
    renderItemModal();
  };

  function renderItemModal() {
    const m = M.find((x) => x.id === sel.id) || M[0];
    modal(`
<div style="display:flex;gap:12px;align-items:center">
<div class="im2">${renderCupOrImg(m)}</div>
<div>
  <b class="d" style="font-size:18px">${m.n}</b>
  <div style="font-weight:800;color:var(--b)">${R(m.p)}</div>
</div>
</div>
<h4>Ukuran</h4>
<div class="chips l">
<span class="ch ${sel.size === "Regular" ? "on" : ""}" onclick="selectChip(this, 'size', 'Regular')">Regular</span>
<span class="ch ${sel.size === "Large" ? "on" : ""}" onclick="selectChip(this, 'size', 'Large')">Large</span>
</div>
<h4>Sugar Level</h4>
<div class="chips l">
<span class="ch ${sel.sugar === "No Sugar" ? "on" : ""}" onclick="selectChip(this, 'sugar', 'No Sugar')">No Sugar</span>
<span class="ch ${sel.sugar === "Less Sugar" ? "on" : ""}" onclick="selectChip(this, 'sugar', 'Less Sugar')">Less Sugar</span>
<span class="ch ${sel.sugar === "Normal" ? "on" : ""}" onclick="selectChip(this, 'sugar', 'Normal')">Normal</span>
</div>
<h4>Ice Level</h4>
<div class="chips l">
<span class="ch ${sel.ice === "No Ice" ? "on" : ""}" onclick="selectChip(this, 'ice', 'No Ice')">No Ice</span>
<span class="ch ${sel.ice === "Less Ice" ? "on" : ""}" onclick="selectChip(this, 'ice', 'Less Ice')">Less Ice</span>
<span class="ch ${sel.ice === "Normal" ? "on" : ""}" onclick="selectChip(this, 'ice', 'Normal')">Normal</span>
</div>
<h4>Extra Topping</h4>
<div class="chips l">
${Object.keys(TOP)
  .map(
    (t) =>
      `<span class="ch ${sel.tops.includes(t) ? "on" : ""}" onclick="toggleTopChip(this, '${t}')">${t} +${R(TOP[t])}</span>`,
  )
  .join("")}
</div>
<div class="row" style="margin-top:16px">
<div>
  <span class="ch" onclick="changeModalQty(-1)">−</span>
  <b id="modal-qty" style="margin:0 8px">${sel.qty}</b>
  <span class="ch" onclick="changeModalQty(1)">+</span>
</div>
<span id="modal-add-btn" class="bt" onclick="addToCart()">Tambah · ${R(unit(sel) * sel.qty)}</span>
</div>
`);
  }

  function updateModalPrice() {
    const btn = $("#modal-add-btn");
    if (btn) btn.textContent = `Tambah · ${R(unit(sel) * sel.qty)}`;
  }

  window.selectChip = (el, key, val) => {
    sel[key] = val;
    if (el && el.parentElement) {
      el.parentElement
        .querySelectorAll(".ch")
        .forEach((c) => c.classList.remove("on"));
      el.classList.add("on");
    }
    updateModalPrice();
  };

  window.toggleTopChip = (el, t) => {
    const i = sel.tops.indexOf(t);
    if (i < 0) {
      sel.tops.push(t);
      if (el) el.classList.add("on");
    } else {
      sel.tops.splice(i, 1);
      if (el) el.classList.remove("on");
    }
    updateModalPrice();
  };

  window.changeModalQty = (d) => {
    sel.qty = Math.max(1, sel.qty + d);
    const qEl = $("#modal-qty");
    if (qEl) qEl.textContent = sel.qty;
    updateModalPrice();
  };

  window.addToCart = () => {
    const m = M.find((x) => x.id === sel.id) || M[0];
    const tops = [...sel.tops].sort();
    const key = [sel.id, sel.size, sel.sugar, sel.ice, tops].join("|");
    const itemPrice = unit(sel);
    const itemDesc = `${sel.size} · Gula ${sel.sugar} · Es ${sel.ice}${tops.length ? " · +" + tops.join(", ") : ""}`;

    if (S.staffLoggedIn && page === "staff-pos") {
      const f = S.posCart.find((i) => i.key === key);
      if (f) {
        f.q += sel.qty;
      } else {
        S.posCart.push({
          id: sel.id,
          n: m.n,
          p: itemPrice,
          q: sel.qty,
          d: itemDesc,
          key,
        });
      }
      save();
      closeModal();
      render();
      toast("Item kustom ditambahkan ke Kasir POS 🧋");
      return;
    }

    const f = S.cart.find((i) => i.key === key);
    if (f) f.qty += sel.qty;
    else
      S.cart.push({
        id: sel.id,
        size: sel.size,
        sugar: sel.sugar,
        ice: sel.ice,
        tops,
        qty: sel.qty,
        key,
      });

    save();
    closeModal();
    nav();
    toast("Ditambahkan ke keranjang 🧋");
    if (page === "cart") render();
  };

  // Staff Menu Management Functions
  window.handleImageUpload = (input) => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Ukuran file gambar maksimal 2MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      window._tempMenuImg = e.target.result;
      const prev = $("#menu-img-preview");
      if (prev) {
        prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
      }
    };
    reader.readAsDataURL(file);
  };

  window.removeUploadedImage = () => {
    window._tempMenuImg = "";
    const prev = $("#menu-img-preview");
    if (prev) {
      prev.innerHTML = `<span style="font-size:11px;color:#6b77a0;">Gambar dihapus (Akan memakai ikon cangkir)</span>`;
    }
  };

  window.openAddMenuModal = () => {
    window._tempMenuImg = undefined;
    modal(`
<div style="text-align:center;margin-bottom:12px;">
  <h3 class="d" style="font-size:22px">➕ Tambah Menu Baru</h3>
  <p style="font-size:11.5px;color:#6b77a0;">Isi detail menu baru untuk ditambahkan ke sistem.</p>
</div>
<div class="in2">
  <div>
    <label style="font-weight:800;font-size:12px;color:var(--b);">Nama Minuman / Menu:</label>
    <input id="menuName" placeholder="Contoh: Mango Boba Tea" value="">
  </div>
  
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Kategori:</label>
      <input id="menuCat" list="cat-suggestions" placeholder="Milk Tea / Matcha / Fruit Tea" value="Milk Tea">
      <datalist id="cat-suggestions">
        <option value="Milk Tea"></option>
        <option value="Matcha"></option>
        <option value="Fruit Tea"></option>
        <option value="Coffee"></option>
        <option value="Specialty"></option>
      </datalist>
    </div>
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Harga (Rp):</label>
      <input id="menuPrice" type="number" placeholder="25000" value="25000">
    </div>
  </div>

  <div>
    <label style="font-weight:800;font-size:12px;color:var(--b);">Deskripsi Singkat:</label>
    <input id="menuDesc" placeholder="Teh susu segar dengan ekstra rasa manis..." value="">
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;">
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Warna Cangkir:</label>
      <input id="menuColor" type="color" value="#1F45A3" style="height:40px;padding:2px;cursor:pointer;">
    </div>
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Upload Gambar:</label>
      <input type="file" id="menuImgInput" accept="image/*" onchange="handleImageUpload(this)" style="font-size:11px;padding:4px;">
    </div>
  </div>

  <div id="menu-img-preview" style="height:110px;border:2px dashed var(--bl);border-radius:12px;display:grid;place-items:center;background:#fff;margin-top:6px;overflow:hidden;">
    <span style="font-size:11px;color:#6b77a0;">Belum ada gambar diupload (Akan memakai ikon cangkir)</span>
  </div>
  <button class="bt sm o" onclick="removeUploadedImage()" style="margin-top:4px;">Hapus Gambar / Gunakan Icon Cangkir</button>
</div>

<div style="display:flex;gap:8px;margin-top:16px;">
  <button class="bt o" onclick="closeModal()" style="flex:1;">Batal</button>
  <button class="bt" onclick="saveMenuItem()" style="flex:2;">✨ Simpan Menu Baru</button>
</div>
`);
  };

  window.openEditMenuModal = (id) => {
    const item = S.menu.find((m) => m.id === id);
    if (!item) return;
    window._tempMenuImg = item.img || "";

    modal(`
<div style="text-align:center;margin-bottom:12px;">
  <h3 class="d" style="font-size:22px">✏️ Edit Menu</h3>
  <p style="font-size:11.5px;color:#6b77a0;">Ubah informasi, harga, atau gambar untuk "${item.n}".</p>
</div>
<div class="in2">
  <div>
    <label style="font-weight:800;font-size:12px;color:var(--b);">Nama Minuman / Menu:</label>
    <input id="menuName" placeholder="Nama Menu" value="${item.n}">
  </div>
  
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Kategori:</label>
      <input id="menuCat" list="cat-suggestions" placeholder="Kategori" value="${item.c}">
      <datalist id="cat-suggestions">
        <option value="Milk Tea"></option>
        <option value="Matcha"></option>
        <option value="Fruit Tea"></option>
        <option value="Coffee"></option>
        <option value="Specialty"></option>
      </datalist>
    </div>
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Harga (Rp):</label>
      <input id="menuPrice" type="number" placeholder="Harga" value="${item.p}">
    </div>
  </div>

  <div>
    <label style="font-weight:800;font-size:12px;color:var(--b);">Deskripsi Singkat:</label>
    <input id="menuDesc" placeholder="Deskripsi" value="${item.d || ""}">
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;">
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Warna Cangkir:</label>
      <input id="menuColor" type="color" value="${item.k || "#1F45A3"}" style="height:40px;padding:2px;cursor:pointer;">
    </div>
    <div>
      <label style="font-weight:800;font-size:12px;color:var(--b);">Upload Gambar Baru:</label>
      <input type="file" id="menuImgInput" accept="image/*" onchange="handleImageUpload(this)" style="font-size:11px;padding:4px;">
    </div>
  </div>

  <div id="menu-img-preview" style="height:110px;border:2px dashed var(--bl);border-radius:12px;display:grid;place-items:center;background:#fff;margin-top:6px;overflow:hidden;">
    ${item.img ? `<img src="${item.img}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : `<span style="font-size:11px;color:#6b77a0;">Gambar belum diupload (Memakai ikon cangkir)</span>`}
  </div>
  <button class="bt sm o" onclick="removeUploadedImage()" style="margin-top:4px;">Hapus Gambar / Gunakan Icon Cangkir</button>
</div>

<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
  <button class="bt o" onclick="deleteMenuItem(${item.id})" style="border-color:var(--pk);color:var(--pk);flex:1;">🗑️ Hapus</button>
  <button class="bt o" onclick="closeModal()" style="flex:1;">Batal</button>
  <button class="bt" onclick="saveMenuItem(${item.id})" style="flex:2;">💾 Simpan Perubahan</button>
</div>
`);
  };

  window.saveMenuItem = (id) => {
    const nameInput = $("#menuName");
    const catInput = $("#menuCat");
    const priceInput = $("#menuPrice");
    const descInput = $("#menuDesc");
    const colorInput = $("#menuColor");

    const name = nameInput ? nameInput.value.trim() : "";
    const catVal = catInput ? catInput.value.trim() : "Lainnya";
    const price = priceInput ? Number(priceInput.value) || 0 : 0;
    const descVal = descInput ? descInput.value.trim() : "";
    const colorVal = colorInput ? colorInput.value : "#1F45A3";

    if (!name || price <= 0) {
      toast("Nama menu dan harga valid harus diisi!");
      return;
    }

    if (id !== undefined && id !== null) {
      const item = S.menu.find((m) => m.id === id);
      if (item) {
        item.n = name;
        item.c = catVal || "Lainnya";
        item.p = price;
        item.d = descVal;
        item.k = colorVal;
        if (window._tempMenuImg !== undefined) {
          item.img = window._tempMenuImg;
        }
      }
      toast("Menu " + name + " berhasil diperbarui! ✏️");
    } else {
      const newId = S.menu.length
        ? Math.max(...S.menu.map((m) => m.id)) + 1
        : 0;
      const newItem = {
        id: newId,
        c: catVal || "Lainnya",
        n: name,
        p: price,
        d: descVal,
        k: colorVal,
        img: window._tempMenuImg || "",
      };
      S.menu.push(newItem);
      toast("Menu baru " + name + " berhasil ditambahkan! ✨");
    }

    delete window._tempMenuImg;
    save();
    closeModal();
    render();
  };

  window.deleteMenuItem = (id) => {
    const item = S.menu.find((m) => m.id === id);
    if (!item) return;
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${item.n}"?`)) {
      S.menu = S.menu.filter((m) => m.id !== id);
      M = S.menu;
      save();
      closeModal();
      render();
      toast("Menu telah dihapus 🗑️");
    }
  };

  function renderAuthModal(v) {
    modal(`
<div style="text-align:center">
<img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
<h3 class="d" style="font-size:22px">${authMode === "reg" ? "Daftar Member" : "Masuk Member"}</h3>
${authMode === "reg" ? '<b style="color:var(--b);font-size:12px">Bonus 100 poin untuk member baru!</b>' : ""}
</div>
<div class="in2">
${authMode === "reg" ? '<input id="memberName" placeholder="Nama Lengkap / Panggilan">' : ""}
<input id="ph" inputmode="numeric" placeholder="Nomor WhatsApp, contoh: 08123456789" value="${v || ""}">
<input id="pin" type="password" placeholder="PIN / Kata Sandi (min. 4 angka)">
</div>
${authErr ? `<p style="color:var(--pk);font-weight:700;margin-top:6px;font-size:11.5px">${authErr}</p>` : ""}
<div style="text-align:center;margin-top:14px">
<span class="bt" onclick="submitAuth()">${authMode === "reg" ? "Daftar Sekarang" : "Masuk"}</span>
</div>
<p style="text-align:center;margin-top:12px;color:var(--b);font-weight:800;cursor:pointer;font-size:12px" onclick="toggleAuthMode()">${authMode === "reg" ? "Sudah punya akun? Masuk" : "Belum jadi member? Daftar"}</p>
`);
  }

  window.openLogin = (m) => {
    authMode = m || "login";
    authErr = "";
    renderAuthModal("");
  };
  window.toggleAuthMode = () => {
    authMode = authMode === "reg" ? "login" : "reg";
    authErr = "";
    renderAuthModal($("#ph") ? $("#ph").value : "");
  };

  window.submitAuth = () => {
    const name =
      authMode === "reg" && $("#memberName")
        ? $("#memberName").value.trim()
        : "";
    const p = $("#ph").value.replace(/\D/g, "");
    const pin = $("#pin").value;

    if (authMode === "reg" && !name) {
      authErr = "Silakan masukkan Nama Anda.";
      return renderAuthModal(p);
    }
    if (p.length < 9 || pin.length < 4) {
      authErr = "Nomor WhatsApp min 9 digit & PIN min 4 digit.";
      return renderAuthModal(p);
    }
    if (authMode === "reg") {
      if (S.users[p]) {
        authErr = "Nomor sudah terdaftar. Silakan masuk.";
        return renderAuthModal(p);
      }
      S.users[p] = {
        name,
        pin,
        points: 100,
        vouchers: [],
        hist: [
          { t: Date.now(), d: "Bonus pendaftaran member", pts: 100 },
        ],
      };
    } else {
      if (p === "08123456789" && pin === "2108") {
        S.staffLoggedIn = true;
        S.cur = p;
        authErr = "";
        save();
        closeModal();
        nav();
        go("staff-queue");
        toast("Masuk Mode Staf 🔑");
        return;
      }
      if (!S.users[p] || S.users[p].pin !== pin) {
        authErr = "Nomor atau PIN salah.";
        return renderAuthModal(p);
      }
    }
    S.staffLoggedIn = false;
    S.cur = p;
    authErr = "";
    save();
    closeModal();
    nav();
    render();
  };

  window.logoutMember = () => {
    S.cur = null;
    S.staffLoggedIn = false;
    vsel = null;
    useP = false;
    save();
    nav();
    go("member");
  };
  window.logoutStaff = () => {
    S.staffLoggedIn = false;
    S.cur = null;
    save();
    nav();
    go("home");
    toast("Keluar Mode Staf");
  };

  window.updateCartQty = (key, delta) => {
    const item = S.cart.find((i) => i.key === key);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        S.cart = S.cart.filter((i) => i.key !== key);
      }
    }
    save();
    nav();
    render();
  };

  window.setVoucher = (v) => {
    vsel = v ? Number(v) || v : null;
    render();
  };
  window.setUsePoints = (c) => {
    useP = c;
    render();
  };

  window.askMelristea = (promptText) => {
    if (!promptText || !promptText.trim()) return;
    const txt = promptText.trim().toLowerCase();

    S.melristeaChat.push({ sender: "user", text: promptText });
    render();

    setTimeout(() => {
      let targetItem = M.find((x) => x.id === 1) || M[0];
      let size = "Regular";
      let sugar = "Normal";
      let ice = "Normal";
      let tops = ["Boba"];
      let reason = "";

      if (
        txt.includes("panas") ||
        txt.includes("terik") ||
        txt.includes("segar") ||
        txt.includes("buah") ||
        txt.includes("haus")
      ) {
        if (txt.includes("leci") || txt.includes("lychee")) {
          targetItem = M.find((x) => x.id === 6) || M[0];
        } else if (txt.includes("persik") || txt.includes("peach")) {
          targetItem = M.find((x) => x.id === 7) || M[0];
        } else {
          targetItem = M.find((x) => x.id === 8) || M[0];
        }
        size = "Large";
        ice = "Normal";
        tops = ["Grass Jelly"];
        reason =
          "Cuaca panas atau keinginan menyegarkan paling pas dipadukan dengan kesegaran Fruit Tea dingin asam-manis melimpah!";
      } else if (
        txt.includes("dingin") ||
        txt.includes("hujan") ||
        txt.includes("calm") ||
        txt.includes("tenang") ||
        txt.includes("santai") ||
        txt.includes("matcha")
      ) {
        if (txt.includes("stroberi") || txt.includes("strawberry")) {
          targetItem = M.find((x) => x.id === 4) || M[0];
        } else if (txt.includes("cloud") || txt.includes("krim")) {
          targetItem = M.find((x) => x.id === 5) || M[0];
        } else {
          targetItem = M.find((x) => x.id === 3) || M[0];
        }
        size = "Regular";
        sugar = "Less Sugar";
        ice = "Less Ice";
        tops = ["Cheese Foam"];
        reason =
          "Aroma matcha otentik dengan balutan susu lembut dan Cheese Foam akan memberikan rasa tenang di saat cuaca sejuk.";
      } else if (
        txt.includes("manis") ||
        txt.includes("karamel") ||
        txt.includes("galau") ||
        txt.includes("boba") ||
        txt.includes("sedih") ||
        txt.includes("taro")
      ) {
        if (txt.includes("taro")) {
          targetItem = M.find((x) => x.id === 2) || M[0];
        } else {
          targetItem = M.find((x) => x.id === 1) || M[0];
        }
        size = "Regular";
        sugar = "Normal";
        ice = "Normal";
        tops = ["Boba", "Pudding"];
        reason =
          "Sentuhan gula aren karamel gurih dan chewy boba adalah booster mood terbaik untuk mengembalikan senyuman manismu!";
      } else if (
        txt.includes("fokus") ||
        txt.includes("belajar") ||
        txt.includes("kerja") ||
        txt.includes("ngantuk")
      ) {
        targetItem = M.find((x) => x.id === 0) || M[0];
        size = "Large";
        sugar = "Less Sugar";
        ice = "Normal";
        tops = ["Boba"];
        reason =
          "Kombinasi kenikmatan racikan Classic Milk Tea yang mantap bikin pikiran segar kembali dan siap fokus beraktivitas!";
      } else {
        targetItem = M[Math.floor(Math.random() * M.length)];
        reason =
          "Racikan favorit pilihan ini selalu sukses memanjakan lidah kapan saja!";
      }

      const aiResponse = `Rekomendasi dari Melristea 🤖:\n\nCobalah ${targetItem.n}! ${reason}\n\nRekomendasi racikan terbaik: ${size} · Gula ${sugar} · Es ${ice} + ${tops.join(", ")}.`;

      S.melristeaChat.push({
        sender: "bot",
        text: aiResponse,
        recId: targetItem.id,
        recSize: size,
        recSugar: sugar,
        recIce: ice,
        recTops: tops,
      });
      save();
      render();

      const box = $("#melristea-chat-box");
      if (box) box.scrollTop = box.scrollHeight;
    }, 400);
  };

  window.sendMelristeaMessage = () => {
    const inp = $("#melristea-input");
    if (inp && inp.value) {
      const val = inp.value;
      inp.value = "";
      askMelristea(val);
    }
  };

  window.clearMelristeaChat = () => {
    S.melristeaChat = [
      {
        sender: "bot",
        text: "Halo! Aku Melristea 🤖, barista AI kecerdasan buatan (Gemini) meltéa.\n\nBingung pilih minuman apa hari ini? Beri tahu aku cuaca di tempatmu atau suasana hatimu saat ini!",
      },
    ];
    save();
    render();
  };

  window.submitCheckout = () => {
    if (!S.cart.length) return toast("Keranjang masih kosong!");
    if (!S.cur) {
      toast("Harus masuk atau daftar member untuk memesan! 🔒");
      openLogin("login");
      return;
    }
    const u = U();
    const c = calc();

    modal(`
<div style="text-align:center">
<img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
<h3 class="d" style="font-size:20px">Konfirmasi Pesanan</h3>
<p style="font-size:11.5px;color:#6b77a0;margin-top:2px">Pesanan atas nama Member meltéa</p>
</div>
<div style="background:var(--bl);border-radius:12px;padding:10px;margin-top:12px">
<div class="row" style="border:0;padding:2px 0"><small>Member:</small><b>${u ? u.name || "Member" : ""} (${S.cur})</b></div>
<div class="row" style="border:0;padding:2px 0"><small>Total Item:</small><b>${S.cart.reduce((a, i) => a + i.qty, 0)} cup</b></div>
<div class="row" style="border:0;padding:2px 0"><small>Total Bayar:</small><b style="color:var(--b);font-size:15px">${R(c.total)}</b></div>
</div>
<div style="text-align:center;margin-top:14px">
<span class="bt" onclick="confirmCheckout()">Konfirmasi & Pesan</span>
</div>
`);
  };

  window.confirmCheckout = () => {
    const u = S.cur && U();
    if (!u) {
      toast("Harus masuk atau daftar member terlebih dahulu! 🔒");
      openLogin("login");
      return;
    }
    const c = calc();
    const orderId = "MT" + String(Date.now()).slice(-5);

    if (c.v) c.v.used = true;

    const earn = S.cart.reduce(
      (a, i) => a + (i.size === "Large" ? 600 : 450) * i.qty,
      0,
    );
    u.points += earn - c.pu;
    const names = S.cart
      .map((i) => {
        const item = M.find((m) => m.id === i.id);
        return i.qty + "× " + (item ? item.n : "Minuman");
      })
      .join(", ");
    u.hist.unshift({
      t: Date.now(),
      d: names,
      pts: earn - c.pu,
      total: c.total,
    });

    const orderObj = {
      id: orderId,
      ph: S.cur,
      name: u.name || "Member meltéa",
      items: S.cart.map((i) => {
        const item = M.find((m) => m.id === i.id);
        return { n: item ? item.n : "Minuman", q: i.qty, d: desc(i) };
      }),
      total: c.total,
      status: "baru",
      source: "Website",
      t: Date.now(),
    };

    S.orders.unshift(orderObj);
    S.myLocalOrderIds = S.myLocalOrderIds || [];
    S.myLocalOrderIds.unshift(orderId);

    playNotificationSound();

    S.cart = [];
    vsel = null;
    useP = false;

    save();
    closeModal();
    nav();
    go("track");
    toast("Pesanan #" + orderId + " berhasil dibuat! 🎉");
  };

  window.setOrderStatus = (id, st) => {
    const o = S.orders.find((x) => x.id === id);
    if (o) {
      o.status = st;
      save();
      render();
      toast("Status pesanan #" + id + " diubah ke " + st.toUpperCase());
    }
  };

  window.setQueueFilter = (f) => {
    S.queueFilter = f;
    render();
  };

  window.toggleAlarm = () => {
    S.alarmOn = !S.alarmOn;
    if (S.alarmOn) playNotificationSound();
    save();
    render();
    toast("Alarm " + (S.alarmOn ? "ON 🔔" : "OFF 🔕"));
  };

  window.posAdd = (id) => {
    openModalItem(id);
  };

  window.setPosPayMethod = (m) => {
    S.posPayMethod = m;
    render();
  };

  window.posQty = (key, delta) => {
    const item = S.posCart.find((i) => i.key === key);
    if (item) {
      item.q += delta;
      if (item.q <= 0) {
        S.posCart = S.posCart.filter((i) => i.key !== key);
      }
    }
    save();
    render();
  };

  window.posRemove = (key) => {
    S.posCart = S.posCart.filter((i) => i.key !== key);
    save();
    render();
  };

  window.posClear = () => {
    S.posCart = [];
    save();
    render();
  };

  window.posSubmit = () => {
    if (!S.posCart.length) return toast("Keranjang POS masih kosong!");
    const payMethod = S.posPayMethod || "QRIS";
    const total = S.posCart.reduce((a, i) => a + i.p * i.q, 0);
    const orderId = "MT" + String(Date.now()).slice(-5);

    S.orders.unshift({
      id: orderId,
      ph: "POS Kasir",
      name: "Pelanggan Kasir (" + payMethod + ")",
      items: S.posCart.map((i) => ({ n: i.n, q: i.q, d: i.d })),
      total: total,
      status: "baru",
      source: "Kasir",
      t: Date.now(),
    });

    playNotificationSound();

    S.posCart = [];
    save();
    toast("Transaksi " + payMethod + " Berhasil! #" + orderId + " 💳");
    go("staff-queue");
  };

  window.generateAIAnalytics = () => {
    const orders = S.orders || [];
    if (!orders.length) {
      return {
        topProduct: "Belum ada data",
        topCategory: "Belum ada data",
        avgBasket: 0,
        insights: [
          {
            t: "Belum Ada Transaksi",
            d: "Lakukan transaksi pertama di Kasir POS atau pesanan online untuk mengaktifkan analisis AI real-time.",
          },
        ],
      };
    }

    const itemCounts = {};
    const catCounts = {};
    let totalRevenue = 0;
    let totalCups = 0;

    orders.forEach((o) => {
      totalRevenue += o.total;
      o.items.forEach((i) => {
        totalCups += i.q;
        itemCounts[i.n] = (itemCounts[i.n] || 0) + i.q;
        const foundItem = M.find((m) => m.n === i.n);
        const catName = foundItem ? foundItem.c : "Lainnya";
        catCounts[catName] = (catCounts[catName] || 0) + i.q;
      });
    });

    let topProduct = "Belum ada";
    let maxProdCount = 0;
    Object.entries(itemCounts).forEach(([name, count]) => {
      if (count > maxProdCount) {
        maxProdCount = count;
        topProduct = name;
      }
    });

    let topCategory = "Belum ada";
    let maxCatCount = 0;
    Object.entries(catCounts).forEach(([catName, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCategory = catName;
      }
    });

    const avgBasket = Math.round(totalRevenue / orders.length);

    const insights = [
      {
        t: "Produk Paling Laris: " + topProduct,
        d:
          "Menyumbang " +
          maxProdCount +
          " cup dari total " +
          totalCups +
          " cup terjual. Pastikan stok bahan baku seperti susu, sirup, dan boba selalu siap sebelum jam sibuk.",
      },
      {
        t: "Kategori Utama: " + topCategory,
        d:
          "Kategori " +
          topCategory +
          " menjadi pilihan favorit pelanggan. Pertimbangkan untuk meluncurkan varian terbatas di kategori ini.",
      },
      {
        t: "Rata-Rata Belanja (Basket Size): " + R(avgBasket),
        d: "Tingkatkan rata-rata belanja per transaksi dengan merekomendasikan topping boba/cheese foam (+Rp5.000) atau upgrade ukuran ke Large (+Rp4.000) di kasir.",
      },
      {
        t: "Rekomendasi Paket Promo AI",
        d:
          "Buat Paket Combo Sore: 1 " +
          topProduct +
          " Large + Topping Cheese Foam dengan potongan diskon 10% khusus pembelian jam 14.00 - 17.00.",
      },
    ];

    return {
      topProduct,
      maxProdCount,
      topCategory,
      avgBasket,
      insights,
      totalCups,
      totalRevenue,
    };
  };

  window.askBusinessAI = (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const q = queryText.trim().toLowerCase();

    let response = "";
    if (
      q.includes("hujan") ||
      q.includes("sepi") ||
      q.includes("cuaca")
    ) {
      response =
        "Strategi Cuaca Hujan/Sepi:\n\n1. Buka promo kilat WhatsApp blast untuk member: Diskon 15% hangat & manis.\n2. Berikan opsi free delivery atau free topping boba untuk pesanan via website.\n3. Dorong produk kategori Milk Tea & Matcha hangat/creamy.";
    } else if (
      q.includes("boba") ||
      q.includes("bahan") ||
      q.includes("stok") ||
      q.includes("besok")
    ) {
      const totalCup = S.orders.reduce(
        (a, o) => a + o.items.reduce((b, i) => b + i.q, 0),
        0,
      );
      const estBoba = Math.max(2, Math.ceil(totalCup * 0.6));
      response =
        "Estimasi Kebutuhan Bahan Besok:\n\n1. Boba: Siapkan minimal " +
        estBoba +
        " kg boba mentah berdasarkan tren pesanan hari ini.\n2. Susu Murni: Minimal " +
        Math.ceil(totalCup * 0.2) +
        " liter.\n3. Gula Aren: Minimal " +
        Math.ceil(totalCup * 0.05) +
        " kg sirup.";
    } else if (
      q.includes("promo") ||
      q.includes("iklan") ||
      q.includes("whatsapp") ||
      q.includes("wa")
    ) {
      response =
        "Draf Pesan Promosi WhatsApp Member:\n\nHalo Sahabat meltéa! 🧋\n\nSudah waktunya rehat sore nih! Dapatkan penawaran khusus diskon Rp5.000 untuk pembelian Brown Sugar Milk Tea atau Matcha Cloud hari ini.\n\nTukarkan poin membermu sekarang juga di website resmi meltéa!";
    } else {
      response =
        "Analisis Strategi Bisnis AI:\n\n1. Fokus pada peningkatan Upselling: Latih kasir untuk menawarkan upgrade ke ukuran Large (+Rp4.000) dan extra Topping Boba (+Rp5.000).\n2. Program Loyalitas: Ajak pembeli non-member untuk mendaftar agar bisa mengumpulkan 450-600 poin per cup.\n3. Evaluasi Produk: Kategori terlaris saat ini dapat dibuatkan varian edisi terbatas bulan depan.";
    }

    S.aiBusinessResponse = response;
    save();
    render();
  };

  function render() {
    const app = $("#app");
    if (!app) return;

    // 1. HOME VIEW
    if (page === "home") {
      app.innerHTML = `
<div class="hero">
  <div class="w">WELCOME TO</div>
  <div class="t d">meltéa</div>
  <svg class="s" style="left:12px;top:60px"><use href="#st"/></svg>
  <svg class="s" style="right:12px;top:90px;width:18px"><use href="#st"/></svg>
  <svg class="s" style="right:16px;top:20px;width:28px;height:28px"><use href="#lf"/></svg>
  <img src="assets/img/Meltea Bear Transparent.png" class="bear" alt="Meltea Bear">
  <span class="pill" style="left:12px">100 poin gratis</span>
  <span class="pill" style="right:12px">Boba Time!</span>
</div>

<section class="sec">
  <div style="color:var(--pk);font-weight:800;letter-spacing:.2em;font-size:11px">TEH · MATCHA · FRUIT TEA</div>
  <h2 class="d" style="margin-top:4px">Boba Lucu buat Mood-mu Setiap Hari</h2>
  <p>Atur gula, es, dan topping sesukamu. Kumpulin poin, dapat reward.</p>
  <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">
    <a class="bt" onclick="go('menu')">Lihat Menu</a>
    <a class="bt o" onclick="openLogin('reg')">Daftar Member</a>
  </div>
</section>

<!-- Banner AI Melristea -->
<section class="ban" style="background: linear-gradient(135deg, #1F45A3, #d94f8f); text-align: left; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
  <div style="max-width: 650px;">
    <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 10.5px; font-weight: 800; margin-bottom: 6px;">GEMINI AI ASSISTANT 🤖</div>
    <h3 style="margin: 0 0 4px 0;">Bingung Pilih Menu Hari Ini?</h3>
    <p style="margin: 0; font-size: 12.5px; opacity: 0.95;">Tanya <b>Melristea 🤖</b>, asisten AI meltéa yang siap merekomendasikan racikan minuman terbaik sesuai mood atau cuaca di tempatmu!</p>
  </div>
  <a class="bt" onclick="go('melristea')" style="background: #fff; color: var(--b); font-size: 13px; padding: 8px 18px;">Tanya Melristea 🤖</a>
</section>

<div class="mq"><span>✦ SIP SIP HOORAY ✦ SIP SIP HOORAY ✦ SIP SIP HOORAY ✦ SIP SIP HOORAY ✦</span></div>

<section class="sec">
  <h2 class="d">Menu Favorit</h2>
  <p>Paling sering dipesan minggu ini</p>
  <div class="gm center-cards">
    ${S.menu
      .slice(0, 3)
      .map(
        (m) => `
      <div class="c">
        <div class="im">${renderCupOrImg(m)}</div>
        <div class="tx">
          <b>${m.n}</b>
          <small>${m.d}</small>
          <span class="pr">${R(m.p)}</span>
          <span class="bt sm" onclick="openModalItem(${m.id})">Pilih</span>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
</section>

<div class="foot" style="cursor:pointer;user-select:none;" onclick="handleFooterClick()">meltéa · Tea so good it melts</div>
`;
    }

    // 2. MENU VIEW
    else if (page === "menu") {
      const categories = ["Semua", ...new Set(S.menu.map((m) => m.c))];
      const list =
        cat === "Semua" ? S.menu : S.menu.filter((m) => m.c === cat);

      if (S.staffLoggedIn) {
        app.innerHTML = `
<div class="hd">
  <h1 class="d">Kelola Menu meltéa</h1>
  <div style="font-size:12px;margin-top:2px;">Tambah menu baru, update harga, upload gambar, atau sunting info menu.</div>
  <div style="margin-top:10px;">
    <button class="bt" onclick="openAddMenuModal()" style="background:var(--pk);">➕ Tambah Menu Baru</button>
  </div>
</div>
<div class="chips">
  ${categories.map((c) => `<span class="ch ${cat === c ? "on" : ""}" onclick="setCat('${c}')">${c}</span>`).join("")}
</div>
<div class="gm">
  ${list
    .map(
      (m) => `
    <div class="c">
      <div class="im">${renderCupOrImg(m)}</div>
      <div class="tx">
        <span class="tg" style="margin-bottom:4px;display:inline-block;">${m.c}</span>
        <b>${m.n}</b>
        <small>${m.d}</small>
        <span class="pr">${R(m.p)}</span>
        <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;">
          <button class="bt sm" onclick="openEditMenuModal(${m.id})">✏️ Edit Menu</button>
          <button class="bt sm o" onclick="deleteMenuItem(${m.id})" style="border-color:var(--pk);color:var(--pk);padding:4px 8px;">🗑️</button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")}
</div>
`;
      } else {
        app.innerHTML = `
<div class="hd">
  <h1 class="d">Pilih Minumanmu</h1>
  <div style="font-size:12px;margin-top:2px;">Semua bisa dikustomisasi sesuai selera manis & es pilihanmu.</div>
</div>
<div class="chips">
  ${categories.map((c) => `<span class="ch ${cat === c ? "on" : ""}" onclick="setCat('${c}')">${c}</span>`).join("")}
</div>
<div class="gm">
  ${list
    .map(
      (m) => `
    <div class="c">
      <div class="im">${renderCupOrImg(m)}</div>
      <div class="tx">
        <b>${m.n}</b>
        <small>${m.d}</small>
        <span class="pr">${R(m.p)}</span>
        <span class="bt sm" onclick="openModalItem(${m.id})">Pilih</span>
      </div>
    </div>
  `,
    )
    .join("")}
</div>
`;
      }
    }

    // 3. TANYA MELRISTEA
    else if (page === "melristea") {
      app.innerHTML = `
<div class="hd" style="background: linear-gradient(135deg, var(--bl), #fff); border-bottom:3px solid var(--b);">
  <h1 class="d" style="display:flex;align-items:center;justify-content:center;gap:8px;">
    <span>Tanya Melristea</span>
    <span style="font-size:24px">🤖</span>
  </h1>
  <div style="font-size:12px;margin-top:2px;color:#4d5b8a;">
    Asisten virtual berbasis AI (Gemini) siap merekomendasikan minuman terbaik sesuai selera & cuacamu.
  </div>
</div>

<div class="pnl" style="max-width:800px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <b class="d" style="font-size:15px;">Pilih Rekomendasi Cepat:</b>
    <span style="font-size:11px;color:var(--pk);font-weight:800;cursor:pointer;" onclick="clearMelristeaChat()">Hapus Obrolan</span>
  </div>

  <div class="chips l" style="margin-bottom:12px;">
    <span class="ch" onclick="askMelristea('Hari ini cuaca sangat panas terik, mau yang segar-segar!')">☀️ Panas Terik</span>
    <span class="ch" onclick="askMelristea('Lagi hujan dan sejuk, mau minuman hangat atau creamy')">🌧️ Hujan / Sejuk</span>
    <span class="ch" onclick="askMelristea('Mau yang manis karamel bikin mood bagus!')">🍮 Mood Galau / Manis</span>
    <span class="ch" onclick="askMelristea('Pengen matcha Jepang otentik yang menenangkan')">🍵 Matcha Creamy</span>
    <span class="ch" onclick="askMelristea('Butuh melek buat fokus belajar dan kerja')">⚡ Butuh Fokus</span>
  </div>

  <div id="melristea-chat-box" class="chat-box">
    ${S.melristeaChat
      .map((msg) => {
        const itemObj =
          msg.recId !== undefined
            ? M.find((x) => x.id === msg.recId)
            : null;
        return `
      <div class="chat-msg ${msg.sender}">
        ${msg.sender === "bot" ? `<div class="bot-avatar">🤖</div>` : ""}
        <div class="chat-bubble">
          <div style="white-space:pre-line">${msg.text}</div>${
            itemObj
              ? `
            <div style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--bl);">
              <button class="bt sm" onclick="openModalWithConfig(${itemObj.id}, '${msg.recSize}', '${msg.recSugar}', '${msg.recIce}', [${msg.recTops.map((t) => `'${t}'`).join(",")}])">
                Pilih & Pesan ${itemObj.n} 🧋
              </button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
      })
      .join("")}
  </div>

  <div style="display:flex;gap:6px;flex-wrap:wrap;">
    <input id="melristea-input" style="flex:1;min-width:200px;" placeholder="Tanyakan racikan ke Melristea (contoh: 'lagi pusing pengen manis-manis')..." onkeydown="if(event.key==='Enter') sendMelristeaMessage()">
    <button class="bt" onclick="sendMelristeaMessage()" style="flex-shrink:0;">Kirim 🚀</button>
  </div>
</div>
`;

      setTimeout(() => {
        const box = $("#melristea-chat-box");
        if (box) box.scrollTop = box.scrollHeight;
      }, 50);
    }

    // 4. CART VIEW
    else if (page === "cart") {
      const u = S.cur && U();
      const c = calc();

      let h = `<div class="hd"><h1 class="d">Keranjang</h1><div style="font-size:12px;margin-top:2px;">Cangkir dengan varian sama otomatis digabung.</div></div>`;

      if (!S.cart.length) {
        h += `
  <div class="pnl" style="text-align:center;padding:24px 12px">
    <img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
    <p style="margin:8px 0 12px;">Keranjang masih kosong.</p>
    <a class="bt" onclick="go('menu')">Pilih minuman</a>
  </div>`;
      } else {
        h += `
  <div class="pnl">
    ${S.cart
      .map((i) => {
        const item = M.find((m) => m.id === i.id) || M[0];
        return `
      <div class="row">
        <div>
          <b>${item.n}</b>
          <small>${desc(i)}</small>
          <span class="qt" style="margin-top:2px;display:inline-block">${R(unit(i))}</span>
        </div>
        <div style="text-align:right;white-space:nowrap">
          <span class="ch" onclick="updateCartQty('${i.key}', -1)">−</span>
          <b style="margin:0 4px">${i.qty}</b>
          <span class="ch" onclick="updateCartQty('${i.key}', 1)">+</span>
          <br><b style="color:var(--b);display:block;margin-top:4px">${R(unit(i) * i.qty)}</b>
        </div>
      </div>
    `;
      })
      .join("")}
  </div>

  <div class="pnl">
    ${
      u
        ? `
      <div class="row">
        <span>🎟️ Voucher</span>
        <select onchange="setVoucher(this.value)">
          <option value="">Tanpa voucher</option>
          ${u.vouchers
            .filter((v) => !v.used)
            .map(
              (v) =>
                `<option value="${v.id}" ${vsel == v.id ? "selected" : ""}>${v.name}</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="row">
        <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
          <input type="checkbox" ${useP ? "checked" : ""} onchange="setUsePoints(this.checked)">
          ⭐ Pakai poin (${u.points} pts =${R(u.points)})
        </label>
        <b>${c.pu ? "−" + R(c.pu) : ""}</b>
      </div>
    `
        : `
      <div class="row">
        <span style="font-size:12px">Masuk member untuk pakai poin.</span>
        <span class="bt o sm" onclick="openLogin('login')">Masuk</span>
      </div>
    `
    }
    <div class="row"><span>Subtotal</span><span>${R(sub())}</span></div>
    ${c.d ? `<div class="row"><span>Voucher</span><b>−${R(c.d)}</b></div>` : ""}
    <div class="row">
      <b>Total</b>
      <b class="d" style="font-size:20px">${R(c.total)}</b>
    </div>
    <div style="text-align:center;margin-top:12px">
      <span class="bt" onclick="submitCheckout()">${u ? "Pesan Sekarang" : "Masuk / Daftar Member untuk Memesan"}</span>
    </div>
  </div>
`;
      }

      app.innerHTML = h;
    }

    // 5. TRACKING VIEW
    else if (page === "track") {
      S.myLocalOrderIds = S.myLocalOrderIds || [];

      let myOrders = S.orders.filter((o) => {
        const isLocal = S.myLocalOrderIds.includes(o.id);
        const isMember = S.cur && o.ph === S.cur;
        return isLocal || isMember;
      });

      const stages = [
        "Pesanan diterima",
        "Sedang dibuat barista",
        "Siap diambil / diantar",
      ];

      let h = `
<div class="hd">
  <h1 class="d">Lacak Pesanan</h1>
  <div style="font-size:12px;margin-top:2px;">Pantau status pembuatan minumanmu secara real-time.</div>
</div>
`;

      if (myOrders.length) {
        h += myOrders
          .map((o) => {
            const idx =
              o.status === "baru" ? 0 : o.status === "dibuat" ? 1 : 2;
            return `
    <div class="pnl">
      <div class="row">
        <b class="d" style="font-size:15px">#${o.id}</b>
        <b style="color:var(--b)">${R(o.total)}</b>
      </div>
      <small style="margin-bottom:6px">${o.name} (${o.ph}) · ${o.items.map((i) => i.q + "× " + i.n).join(", ")}</small>
      ${stages
        .map(
          (l, i) => `
        <div class="st">
          <span class="dot ${i <= idx ? "on" : ""}">${i < idx ? "✓" : i + 1}</span>
          <b style="${i > idx ? "color:#8a95b8" : ""};font-size:13px">${l}</b>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
          })
          .join("");
      } else {
        h += `
  <div class="pnl" style="text-align:center;padding:24px 12px;color:#6b77a0">
    Belum ada pesanan aktif.
  </div>
`;
      }

      app.innerHTML = h;
    }

    // 6. MEMBER VIEW
    else if (page === "member") {
      const u = S.cur && U();
      if (!u) {
        app.innerHTML = `
  <div class="hd"><h1 class="d">Halo, Member!</h1><div>Daftar atau masuk pakai nomor WhatsApp.</div></div>
  <div class="pnl" style="text-align:center;padding:24px 12px">
    <img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
    <p style="margin:10px 0 14px;">Daftar sekarang dan dapatkan bonus langsung 100 poin!</p>
    <span class="bt" onclick="openLogin('reg')">Daftar</span>
    <span class="bt o" onclick="openLogin('login')">Masuk</span>
  </div>
`;
        return;
      }

      app.innerHTML = `
<div class="hd"><h1 class="d">Halo, ${u.name || "Member"}!</h1><div style="font-weight:800;color:var(--b)">WA: ${S.cur}</div></div>

<div class="pt">
  <div>
    <div style="font-size:12px;opacity:.9">Saldo Poin</div>
    <div class="d">${u.points}</div>
    <div style="font-size:11px;opacity:.9">= Potongan ${R(u.points)}</div>
  </div>
  <img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
</div>

<div class="pnl">
  <b class="d" style="font-size:16px">Voucher Saya</b>
  ${
    u.vouchers.length
      ? u.vouchers
          .map(
            (v) => `
    <div class="vc" style="${v.used ? "opacity:.5" : ""}">
      <span style="font-size:20px">🎟️</span>
      <div>
        <b>${v.name}</b>
        <small>${v.used ? "Terpakai" : "Aktif"}</small>
      </div>
    </div>
  `,
          )
          .join("")
      : '<p style="color:#6b77a0;margin-top:4px">Belum ada voucher aktif.</p>'
  }
</div>

<div class="pnl">
  <b class="d" style="font-size:16px">Riwayat Poin & Transaksi</b>
  ${u.hist
    .map(
      (x) => `
    <div class="row">
      <div>
        <b>${x.d}</b>
        <small>${new Date(x.t).toLocaleString("id-ID")}${x.total ? " · " + R(x.total) : ""}</small>
      </div>
      <b style="color:var(--b)">${x.pts >= 0 ? "+" : ""}${x.pts}</b>
    </div>
  `,
    )
    .join("")}
</div>

<div style="text-align:center;padding:12px">
  <span class="bt o" onclick="logoutMember()">Keluar Akun Member</span>
</div>
`;
    }

    // 7. STAFF VIEW: LIVE ORDER QUEUE
    else if (page === "staff-queue") {
      if (!S.staffLoggedIn) return go("home");

      let filteredOrders = S.orders;
      if (S.queueFilter !== "Semua")
        filteredOrders = S.orders.filter(
          (o) => o.source === S.queueFilter,
        );

      app.innerHTML = `
<div class="hd">
  <h1 class="d">Antrean Pesanan Live</h1>
  <div style="font-size:12px;margin-top:2px;">Kelola dan ubah status pesanan pelanggan secara real-time</div>
</div>

<div class="pnl" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:14px 16px;">
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <div>
      <small style="font-weight:800">Total Pesanan Aktif</small>
      <span class="d" style="font-size:24px;color:var(--b);display:block;line-height:1">${S.orders.filter((o) => o.status !== "selesai").length}</span>
    </div>
    <div style="border-left:2px solid var(--bl);padding-left:10px;">
      <small style="color:var(--pk);font-weight:800">Baru Masuk</small>
      <b style="font-size:16px;color:var(--pk);display:block;line-height:1.2">${S.orders.filter((o) => o.status === "baru").length}</b>
    </div>
    <div style="border-left:2px solid var(--bl);padding-left:10px;">
      <small style="color:var(--b);font-weight:800">Sedang Dibuat</small>
      <b style="font-size:16px;color:var(--b);display:block;line-height:1.2">${S.orders.filter((o) => o.status === "dibuat").length}</b>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:6px;">
    <button class="bt sm o" onclick="playNotificationSound()" style="padding:4px 10px;">🔊 Tes Suara</button>
    <button class="bt sm ${S.alarmOn ? "" : "o"}" onclick="toggleAlarm()" style="${S.alarmOn ? "background:var(--pk);border-color:var(--pk)" : ""}">
      ${S.alarmOn ? "🔔 Alarm ON" : "🔕 Alarm OFF"}
    </button>
  </div>
</div>

<div class="chips" style="margin:6px 12px;">
  ${["Semua", "Website", "Kasir"].map((f) => `<span class="ch ${S.queueFilter === f ? "on" : ""}" onclick="setQueueFilter('${f}')">${f}</span>`).join("")}
</div>

<div>
  ${filteredOrders
    .map(
      (o) => `
    <div class="oc ${o.status === "baru" ? "new" : o.status === "dibuat" ? "mk" : ""}">
      <div class="row" style="border:0;padding:0">
        <b class="d" style="font-size:15px">#${o.id}</b>
        <span>
          <span class="tg ${o.status === "baru" ? "pk" : o.status === "dibuat" ? "bl" : ""}">${o.status.toUpperCase()}</span>
          <span class="tg">${o.source}</span>
        </span>
      </div>
      <small>${new Date(o.t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · ${o.name} ·${o.ph}</small>
      <div class="row">
        <div>
          ${o.items.map((i) => `<div><b>${i.q}× ${i.n}</b><small>${i.d}</small></div>`).join("")}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
        <b>${R(o.total)}</b>${o.status === "baru" ? `<span class="bt sm" onclick="setOrderStatus('${o.id}', 'dibuat')">Mulai Buat</span>` : ""}
        ${o.status === "dibuat" ? `<span class="bt sm" style="background:#2b8a3e" onclick="setOrderStatus('${o.id}', 'selesai')">✓ Tandai Selesai</span>` : ""}
        ${o.status === "selesai" ? `<span style="font-size:11px;color:#2b8a3e;font-weight:800">Selesai ✓</span>` : ""}
      </div>
    </div>
  `,
    )
    .join("")}
</div>
`;
    }

    // 8. STAFF VIEW: KASIR POS
    else if (page === "staff-pos") {
      if (!S.staffLoggedIn) return go("home");

      const totalPos = S.posCart.reduce((a, i) => a + i.p * i.q, 0);
      const posCategories = [
        "Semua",
        ...new Set(S.menu.map((m) => m.c)),
      ];
      const posList =
        posCat === "Semua" ? S.menu : S.menu.filter((m) => m.c === posCat);
      S.posPayMethod = S.posPayMethod || "QRIS";

      app.innerHTML = `
<div class="hd">
  <h1 class="d">Kasir POS</h1>
  <div style="font-size:12px;margin-top:2px;">Sistem Kasir Cepat Offline & Direct Order</div>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;max-width:1280px;margin:12px auto;padding:0 12px;box-sizing:border-box;">
  <div>
    <div class="pnl" style="margin:0 0 12px;width:100%;">
      <h4 style="margin-top:0">Pilihan Menu</h4>
      <div class="chips l" style="margin:6px 0 10px;">
        ${posCategories.map((c) => `<span class="ch ${posCat === c ? "on" : ""}" onclick="setPosCat('${c}')">${c}</span>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(120px, 1fr));gap:8px;">
        ${posList
          .map(
            (m) => `
          <div class="c" style="padding:8px;cursor:pointer;border-radius:12px;" onclick="posAdd(${m.id})">
            <div class="im" style="height:60px;border-radius:8px;">${renderCupOrImg(m, null, "width:28px;height:42px")}</div>
            <div style="margin-top:4px;font-size:11.5px;font-weight:800;color:var(--ink);line-height:1.2;">${m.n}</div>
            <div style="font-size:11.5px;font-weight:800;color:var(--b);margin-top:2px;">${R(m.p)}</div>
            <button class="bt sm" style="margin-top:4px;width:100%;padding:3px 6px;font-size:9.5px;min-height:24px;">⚙️ Kustomisasi</button>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </div>

  <div>
    <div class="pnl" style="margin:0;width:100%;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--bl);padding-bottom:8px;margin-bottom:8px;">
        <h4 style="margin:0;">Items POS (${S.posCart.reduce((a, i) => a + i.q, 0)})</h4>
        ${S.posCart.length ? `<span style="font-size:11px;color:var(--pk);font-weight:800;cursor:pointer;" onclick="posClear()">Hapus Semua</span>` : ""}
      </div>

      ${
        S.posCart.length
          ? `
        <div style="max-height:280px;overflow-y:auto;padding-right:2px;">
          ${S.posCart
            .map(
              (i) => `
            <div class="row" style="padding:6px 0;">
              <div>
                <b style="font-size:12.5px">${i.n}</b>
                <small style="color:var(--b);font-weight:700;">${i.d}</small>
                <div style="color:var(--b);font-weight:800;font-size:11.5px;margin-top:2px;">${R(i.p)} / cup</div>
              </div>
              <div style="text-align:right;">
                <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
                  <span class="ch" style="padding:2px 6px;font-size:10px;min-height:24px;" onclick="posQty('${i.key}', -1)">−</span>
                  <b style="font-size:12px;">${i.q}</b>
                  <span class="ch" style="padding:2px 6px;font-size:10px;min-height:24px;" onclick="posQty('${i.key}', 1)">+</span>
                  <span style="color:var(--pk);cursor:pointer;margin-left:4px;font-size:13px;" onclick="posRemove('${i.key}')">🗑️</span>
                </div>
                <b style="color:var(--b);display:block;margin-top:2px;font-size:12px;">${R(i.p * i.q)}</b>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div style="border-top:2px solid var(--bl);padding-top:10px;margin-top:10px;">
          <div style="font-size:11.5px;font-weight:800;margin-bottom:4px;color:#4d5b8a;">Metode Pembayaran:</div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;margin-bottom:10px;">
            <button class="bt sm ${S.posPayMethod === "Cash" ? "" : "o"}" style="padding:6px 2px;font-size:10.5px;" onclick="setPosPayMethod('Cash')">💵 Cash</button>
            <button class="bt sm ${S.posPayMethod === "QRIS" ? "" : "o"}" style="padding:6px 2px;font-size:10.5px;${S.posPayMethod === "QRIS" ? "background:#2b8a3e;border-color:#2b8a3e;" : ""}" onclick="setPosPayMethod('QRIS')">📱 QRIS</button>
            <button class="bt sm ${S.posPayMethod === "EDC" ? "" : "o"}" style="padding:6px 2px;font-size:10.5px;${S.posPayMethod === "EDC" ? "background:#101114;border-color:#101114;" : ""}" onclick="setPosPayMethod('EDC')">💳 EDC</button>
          </div>

          <div class="tot" style="margin:0;width:100%;border-radius:14px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <small style="color:#dfe7ff">Total (${S.posPayMethod})</small>
              <div class="d" style="font-size:20px">${R(totalPos)}</div>
            </div>
            <button class="bt" style="background:#fff;color:var(--b)" onclick="posSubmit()">Bayar & Kirim</button>
          </div>
        </div>
      `
          : `
        <div style="text-align:center;padding:30px 10px;color:#6b77a0;">
          <img src="assets/img/Meltea Bear Transparent.png" style="width: 60px; height: auto;" alt="Meltea Bear">
          <p style="margin-top:8px;font-size:12px;">Klik menu di sebelah kiri untuk menentukan ukuran, es, gula & topping pesanan.</p>
        </div>
      `
      }
    </div>
  </div>
</div>
`;
    }

    // 9. STAFF VIEW: REKAP AI ANALITIK
    else if (page === "staff-rekap") {
      if (!S.staffLoggedIn) return go("home");

      const aiData = generateAIAnalytics();
      const totalOmzet = S.orders.reduce((a, o) => a + o.total, 0);
      const totalCup = S.orders.reduce(
        (a, o) => a + o.items.reduce((b, i) => b + i.q, 0),
        0,
      );

      app.innerHTML = `
<div class="hd">
  <h1 class="d">Rekap & Analisis Bisnis AI</h1>
  <div style="font-size:12px">${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
</div>

<div class="pnl">
  <div class="g2">
    <div class="k on" style="grid-column:span 2">
      <small>Total Omzet</small>
      <span class="d" style="font-size:24px">${R(totalOmzet)}</span>
    </div>
    <div class="k"><small>Cup Terjual</small><span class="d">${totalCup}</span></div>
    <div class="k"><small>Total Transaksi</small><span class="d">${S.orders.length}</span></div>
    <div class="k"><small>Rata-Rata / Transaksi</small><span class="d" style="font-size:16px">${R(aiData.avgBasket)}</span></div>
    <div class="k"><small>Produk Terlaris</small><b style="color:var(--b);font-size:13px;display:block;margin-top:2px">${aiData.topProduct}</b></div>
  </div>

  <h4 style="margin-top:14px">Grafik Jam Ramai Transaksi</h4>
  <div class="bars">
    <i style="height:25%"></i><i style="height:45%"></i><i style="height:35%"></i>
    <i class="t" style="height:100%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:40%"></i>
  </div>
  <div class="lbl"><span>10.00</span><span>12.00</span><span>13.00</span><span>14.00</span><span>15.00</span><span>16.00</span><span>17.00</span></div>
</div>

<div class="pnl ai">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <b class="d" style="font-size:16px;color:var(--b);">🤖 Rekomendasi & Analisis AI Otomatis</b>
    <span class="bt sm" onclick="render()">🔄 Perbarui</span>
  </div>

  ${aiData.insights
    .map(
      (item) => `
    <div class="row" style="align-items:flex-start;padding:8px 0;">
      <div style="width:100%;">
        <b style="color:var(--b);font-size:13px;display:block;">${item.t}</b>
        <small style="color:var(--ink);font-size:12px;line-height:1.35;margin-top:2px;">${item.d}</small>
      </div>
    </div>
  `,
    )
    .join("")}
</div>

<div class="pnl" style="background:#fff;border:2px solid var(--b);">
  <b class="d" style="font-size:16px;color:var(--b);display:block;margin-bottom:4px;">💬 Konsultasi Bisnis AI Interaktif</b>
  <p style="font-size:11.5px;color:#4d5b8a;margin-bottom:10px;">Tanyakan strategi penjualan, prediksi stok, atau draf promosi WhatsApp langsung ke AI.</p>

  <div class="chips l" style="margin-bottom:10px;">
    <span class="ch" onclick="askBusinessAI('Bagaimana strategi penjualan saat cuaca hujan?')">🌧️ Strategi Hujan</span>
    <span class="ch" onclick="askBusinessAI('Berapa estimasi stok boba dan bahan baku esok hari?')">📦 Prediksi Stok Besok</span>
    <span class="ch" onclick="askBusinessAI('Buatkan draf promo WhatsApp untuk member meltéa')">📱 Draf WA Blast Member</span>
    <span class="ch" onclick="askBusinessAI('Bagaimana cara meningkatkan rata-rata belanja kasir?')">💡 Tips Upselling Kasir</span>
  </div>

  <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
    <input id="biz-ai-input" style="flex:1;min-width:180px;" placeholder="Ketik pertanyaan bisnis (contoh: 'Cara jualan fruit tea pas sore')..." onkeydown="if(event.key==='Enter') askBusinessAI($('#biz-ai-input').value)">
    <button class="bt" onclick="askBusinessAI($('#biz-ai-input').value)" style="flex-shrink:0;">Tanya AI 🤖</button>
  </div>

  ${
    S.aiBusinessResponse
      ? `
    <div style="background:var(--p);border:2px dashed var(--b);border-radius:12px;padding:12px;margin-top:8px;">
      <b style="color:var(--b);display:block;margin-bottom:4px;font-size:12.5px;">Tanggapan Asisten Bisnis AI:</b>
      <div style="white-space:pre-line;font-size:12.5px;line-height:1.45;color:var(--ink);">${S.aiBusinessResponse}</div>
    </div>
  `
      : ""
  }
</div>
`;
    }
  }

  nav();
  render();
})();