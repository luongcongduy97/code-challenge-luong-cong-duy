document.addEventListener('alpine:init', () => {
  Alpine.data('swapApp', () => ({
    API_URL: "https://interview.switcheo.com/prices.json",
    ICON_BASE: "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/",
    prices: {},
    symbols: [],
    from: "",
    to: "",
    amount: "",
    result: "",
    rateLine: "Rate: —",
    amtError: "",
    globalError: "",
    toastMsg: "",
    loading: false,
    canSubmit: false,
    _balances: {}, // mock balances for UX (can be removed)

    async init() {
      this.loading = true;
      try {
        const res = await fetch(this.API_URL);
        const data = await res.json();
        data.forEach(it => this.prices[it.currency] = it.price);

        this.symbols = Object.keys(this.prices).sort();

        // mock balances
        this.symbols.forEach(s => this._balances[s] = 100 + Math.random()*50);

        // restore or default
        const saved = JSON.parse(localStorage.getItem("swap.sel")||"{}");
        this.from = (saved.f && this.prices[saved.f]) ? saved.f : (this.prices.ETH ? "ETH" : this.symbols[0] || "");
        this.to   = (saved.t && this.prices[saved.t]) ? saved.t : (this.prices.USDC ? "USDC" : this.symbols[1] || "");

        this.update();
      } catch (e) {
        this.globalError = "Failed to load token prices. Please refresh.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // helpers
    fmt6(n){ return Number(n||0).toFixed(6); },
    fmt2(n){ return Number(n||0).toFixed(2); },
    balance(sym){ return this._balances[sym] || 0; },
    icon(sym){
      const url = this.ICON_BASE + encodeURIComponent(sym) + ".svg";
      // build a data-URI fallback text icon
      const t = (sym||"?").slice(0,4);
      const fallback = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
           <rect width='100%' height='100%' fill='#eef2ff'/>
           <text x='50%' y='55%' font-family='Arial' font-size='10' text-anchor='middle' fill='#334155'>${t}</text>
         </svg>`
      );
      // preload and return
      const img = new Image();
      img.src = url;
      img.onerror = () => (img.src = fallback);
      return img.src; // returns url now; if 404, next paint uses fallback
    },

    save(){ localStorage.setItem("swap.sel", JSON.stringify({f:this.from, t:this.to})); },

    validate(){
      this.amtError = ""; this.globalError = ""; this.canSubmit = true;

      // amount
      const raw = (this.amount+"").trim();
      const val = Number(raw);
      if (!raw)                 { this.amtError="Please enter an amount."; this.canSubmit=false; }
      else if (!isFinite(val))  { this.amtError="Amount must be a number."; this.canSubmit=false; }
      else if (val <= 0)        { this.amtError="Amount must be greater than 0."; this.canSubmit=false; }
      else if (!/^\d+(\.\d{1,8})?$/.test(raw)) { this.amtError="Max 8 decimals allowed."; this.canSubmit=false; }
      else if (val - this.balance(this.from) > 1e-8)   { 
        this.amtError=`Amount exceeds balance (${this.fmt6(this.balance(this.from))} ${this.from}).`; 
        this.canSubmit=false; 
      }

      // tokens
      if (this.from === this.to) { this.globalError="From and To must be different."; this.canSubmit=false; }
      if (!this.prices[this.from]) { this.globalError=`Missing price for ${this.from}.`; this.canSubmit=false; }
      if (!this.prices[this.to])   { this.globalError=`Missing price for ${this.to}.`;   this.canSubmit=false; }
    },

    calc(){
      const a = Number(this.amount);
      const fp = this.prices[this.from], tp = this.prices[this.to];
      if (!isFinite(a) || !fp || !tp){
        this.result = ""; this.rateLine = "Rate: —"; return;
      }
      const usd = a * fp;
      this.result = this.fmt6(usd / tp);
      this.rateLine = `Rate: 1 ${this.from} ≈ ${this.fmt6(fp/tp)} ${this.to}`;
    },

    update(){
      this.save();
      this.validate();
      this.calc();
    },

    flip(){
      const f=this.from; this.from=this.to; this.to=f;
      if (this.result) this.amount = this.result;
      this.update();
    },

    useMax(){
      this.amount = this.fmt6(this.balance(this.from));
      this.update();
    },

    fromUsdHint(){
      const a=Number(this.amount), fp=this.prices[this.from];
      return (isFinite(a)&&fp) ? `≈ $${this.fmt2(a*fp)}` : "≈ —";
    },

    toUsdHint(){
      const r=Number(this.result), tp=this.prices[this.to];
      return (isFinite(r)&&tp) ? `≈ $${this.fmt2(r*tp)}` : "≈ —";
    },

    submit(){
      if (!this.canSubmit) return;
      this.toastMsg = ""; this.canSubmit=false;
      const btn = document.getElementById('swap-btn');
      const prev = btn.textContent; btn.textContent="PROCESSING...";
      setTimeout(()=>{
        btn.textContent = prev; this.canSubmit=true;
        this.toastMsg = "Swap submitted!";
        setTimeout(()=>this.toastMsg="", 2000);
      }, 1000);
    },

    get resultDisplay(){ return this.result || ""; },
  }))
});