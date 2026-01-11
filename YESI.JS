// ...existing code...
function formatNumberDot(n, decimals = 2) {
  const num = Number(n || 0);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num).toFixed(decimals); // "1234567.89"
  const [intPart, decPart] = abs.split('.');
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // "1.234.567"
  return `${sign}${intWithDots},${decPart}`; // "1.234.567,89"
}

function parseFormattedNumber(str) {
  if (!str) return 0;
  // remove spaces, non-digit except . and ,
  const s = String(str).trim().replace(/\s/g, '');
  // If contains comma as decimal separator, replace dots (thousands) then comma->dot
  if (s.indexOf(',') !== -1) {
    return Number(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // no comma: remove dots and parse
  return Number(s.replace(/\./g, '')) || 0;
}

function calcularTasa(valor_demanda, valor_consiliacion) {
  const demanda = Number(valor_demanda || 0);
  const cons = Number(valor_consiliacion || 0);
  const tasa = +(cons * 0.03).toFixed(2);
  const pendiente = +(tasa - (demanda * 0.03)).toFixed(2);
  return {
    tasa, tasa_formateada: formatNumberDot(tasa),
    pendiente, pendiente_formateada: formatNumberDot(pendiente)
  };
}

function calcularDestruccion(valor_asegurado, presupuesto) {
  const a = Number(valor_asegurado || 0);
  const p = Number(presupuesto || 0);
  const resultado = +(a * 0.8).toFixed(2);
  const puede_reclamar = p <= resultado;
  const mensaje = puede_reclamar
    ? "Se puede reclamar el daño material"
    : "No se puede reclamar. Corroborar si es destrucción total del vehículo con las fotos";
  return { resultado, resultado_formateado: formatNumberDot(resultado), puede_reclamar, mensaje };
}

document.addEventListener('DOMContentLoaded', () => {
  const show = id => {
    document.querySelectorAll('.form-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    const r = document.getElementById('resultado'); r.style.display = 'none'; r.innerHTML = '';
    // toggle active class
    document.querySelectorAll('.selector').forEach(b => b.classList.remove('active'));
    (id === 'tasa' ? document.getElementById('btn-tasa') : document.getElementById('btn-destruccion')).classList.add('active');
  };

  document.getElementById('btn-destruccion').addEventListener('click', () => show('destruccion'));
  document.getElementById('btn-tasa').addEventListener('click', () => show('tasa'));

  // formatting behavior: on focus show raw (dot decimal), on blur format with thousands and comma
  function attachFormatting(el) {
    if (!el) return;
    el.addEventListener('focus', () => {
      const val = parseFormattedNumber(el.value);
      // show raw with dot decimal for easier editing
      el.value = val === 0 ? '' : String(val);
      el.select();
    });
    el.addEventListener('blur', () => {
      const val = parseFormattedNumber(el.value);
      el.value = val === 0 ? '' : formatNumberDot(val);
    });
    // optional: prevent invalid keys (allow digits, comma, dot, backspace, arrows)
    el.addEventListener('keydown', (e) => {
      const allowed = ['Backspace','ArrowLeft','ArrowRight','Delete','Tab','Home','End'];
      if (allowed.includes(e.key)) return;
      if (/^[0-9\.,]$/.test(e.key)) return;
      e.preventDefault();
    });
  }

  ['valor_asegurado','presupuesto','valor_demanda','valor_consiliacion'].forEach(id => {
    attachFormatting(document.getElementById(id));
  });

  const resultadoEl = document.getElementById('resultado');
  const showResult = html => { resultadoEl.innerHTML = html; resultadoEl.style.display = 'block'; };

  document.getElementById('calcular_tasa').addEventListener('click', () => {
    const vDem = parseFormattedNumber(document.getElementById('valor_demanda').value);
    const vCons = parseFormattedNumber(document.getElementById('valor_consiliacion').value);
    const res = calcularTasa(vDem, vCons);
    showResult(`<strong>Tasa:</strong> ${res.tasa_formateada} — <strong>Pendiente:</strong> ${res.pendiente_formateada}`);
  });

  document.getElementById('calcular_destruccion').addEventListener('click', () => {
    const vAse = parseFormattedNumber(document.getElementById('valor_asegurado').value);
    const pres = parseFormattedNumber(document.getElementById('presupuesto').value);
    const res = calcularDestruccion(vAse, pres);
    showResult(`${res.mensaje} — <strong>80%:</strong> ${res.resultado_formateado}`);
  });

  // estado inicial
  document.getElementById('btn-tasa').click();
});