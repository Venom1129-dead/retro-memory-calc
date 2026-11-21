// RetroMemory Hex & CWCheat Calculator Engine
(function () {
  // Elements: Pointer Calculator
  const baseAddressEl = document.getElementById('baseAddress');
  const offsetAddressEl = document.getElementById('offsetAddress');
  const mathOpEl = document.getElementById('mathOp');
  const resAbsoluteHexEl = document.getElementById('resAbsoluteHex');
  const resDecimalEl = document.getElementById('resDecimal');
  const resCwRelativeEl = document.getElementById('resCwRelative');

  // Elements: Endianness Swapper
  const endianInputEl = document.getElementById('endianInput');
  const endianWidthEl = document.getElementById('endianWidth');
  const resBigEndianEl = document.getElementById('resBigEndian');
  const resLittleEndianEl = document.getElementById('resLittleEndian');
  const resByteSequenceEl = document.getElementById('resByteSequence');

  // Elements: CWCheat Formatter
  const cheatNameEl = document.getElementById('cheatName');
  const cheatAddressEl = document.getElementById('cheatAddress');
  const cheatTypeEl = document.getElementById('cheatType');
  const cheatValueEl = document.getElementById('cheatValue');
  const cheatOutputEl = document.getElementById('cheatOutput');
  const copyCheatBtn = document.getElementById('copyCheatBtn');

  // Elements: Presets
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Helper: Parse Hex / Dec input cleanly
  function parseNumberInput(str) {
    if (!str) return 0;
    str = str.trim().replace(/^[\$#]/, '');
    if (str.startsWith('0x') || str.startsWith('0X')) {
      return parseInt(str, 16) || 0;
    }
    // Check if contains hex letters A-F without 0x prefix
    if (/^[0-9a-fA-F]+$/.test(str) && /[a-fA-F]/.test(str)) {
      return parseInt(str, 16) || 0;
    }
    return parseInt(str, 10) || 0;
  }

  function toHex32(num) {
    // Unsigned 32-bit representation
    return '0x' + (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  // 1. Calculate Pointer Offset
  function updatePointerCalc() {
    const base = parseNumberInput(baseAddressEl.value);
    const offset = parseNumberInput(offsetAddressEl.value);
    const op = mathOpEl.value;

    let absolute = op === 'add' ? (base + offset) : (base - offset);
    if (absolute < 0) absolute = 0;

    resAbsoluteHexEl.textContent = toHex32(absolute);
    resDecimalEl.textContent = (absolute >>> 0).toLocaleString();

    // Relative to standard PSP User RAM (0x08800000) or current base
    const pspBase = 0x08800000;
    const relOffset = absolute >= pspBase ? (absolute - pspBase) : offset;
    resCwRelativeEl.textContent = toHex32(relOffset);

    // Auto-update cheat address field if user is experimenting
    if (document.activeElement === baseAddressEl || document.activeElement === offsetAddressEl) {
      cheatAddressEl.value = toHex32(relOffset);
      updateCheatGenerator();
    }
  }

  // 2. Endianness Swapper
  function updateEndianSwapper() {
    let raw = endianInputEl.value.trim().replace(/^0x/i, '').replace(/[\s\$,]/g, '');
    const width = parseInt(endianWidthEl.value, 10);
    const hexChars = width / 4; // 16-bit -> 4 chars, 32-bit -> 8 chars, 64-bit -> 16 chars

    // Pad or trim
    raw = raw.padStart(hexChars, '0').slice(-hexChars).toUpperCase();

    // Chunk into bytes
    const bytes = [];
    for (let i = 0; i < raw.length; i += 2) {
      bytes.push(raw.slice(i, i + 2));
    }

    const bigEndian = '0x' + bytes.join('');
    const littleEndian = '0x' + [...bytes].reverse().join('');
    const byteSeq = [...bytes].reverse().join(' ');

    resBigEndianEl.textContent = bigEndian;
    resLittleEndianEl.textContent = littleEndian;
    resByteSequenceEl.textContent = byteSeq;
  }

  // 3. CWCheat / Action Replay Generator
  function updateCheatGenerator() {
    const name = cheatNameEl.value.trim() || 'Untitled Cheat';
    const type = cheatTypeEl.value; // '2', '1', or '0'
    const addrNum = parseNumberInput(cheatAddressEl.value);
    const valNum = parseNumberInput(cheatValueEl.value);

    // In CWCheat, the address is masked:
    // Type 2 (32-bit): 0x2XXXXXXX
    // Address format: strip leading bits to fit 7 hex digits
    const addrHex = (addrNum & 0x0FFFFFFF).toString(16).toUpperCase().padStart(7, '0');
    const valHex = (valNum >>> 0).toString(16).toUpperCase().padStart(8, '0');

    const firstWord = `0x${type}${addrHex}`;
    const secondWord = `0x${valHex}`;

    const code = `_C0 ${name}\n_L ${firstWord} ${secondWord}`;
    cheatOutputEl.textContent = code;
  }

  // Preset Handlers
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const base = btn.dataset.base;
      baseAddressEl.value = base;
      updatePointerCalc();
    });
  });

  // Copy Button
  copyCheatBtn.addEventListener('click', () => {
    const code = cheatOutputEl.textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyCheatBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyCheatBtn.textContent = '📋 Copy Code';
      }, 1800);
    }).catch(() => {
      copyCheatBtn.textContent = 'Select & Copy';
    });
  });

  // Event Listeners
  [baseAddressEl, offsetAddressEl, mathOpEl].forEach(el => {
    el.addEventListener('input', updatePointerCalc);
    el.addEventListener('change', updatePointerCalc);
  });

  [endianInputEl, endianWidthEl].forEach(el => {
    el.addEventListener('input', updateEndianSwapper);
    el.addEventListener('change', updateEndianSwapper);
  });

  [cheatNameEl, cheatAddressEl, cheatTypeEl, cheatValueEl].forEach(el => {
    el.addEventListener('input', updateCheatGenerator);
    el.addEventListener('change', updateCheatGenerator);
  });

  // Initial runs
  updatePointerCalc();
  updateEndianSwapper();
  updateCheatGenerator();
})();
