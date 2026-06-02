import React from 'react';
import { useState, useEffect } from 'react';

const SUPA_URL = 'https://rmpzdamnzhzgckznyupc.supabase.co';
const SUPA_KEY = 'sb_publishable_qlVINMUvgUnX13V_4uskbA_tRhCPL0s';
const SUPA_KEY_NAME = 'sponsor_tracker_v8';

async function supaLoad() {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/tracker_state?key=eq.${SUPA_KEY_NAME}&select=value`,
      {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      }
    );
    const data = await r.json();
    if (data && data[0]?.value) return JSON.parse(data[0].value);
  } catch (e) {}
  return null;
}

async function supaSave(state, retries = 3) {
  const body = JSON.stringify({
    key: SUPA_KEY_NAME,
    value: JSON.stringify(state),
  });
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/tracker_state?on_conflict=key`,
        {
          method: 'POST',
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body,
        }
      );
      if (r.ok) return;
      if (r.status === 503 && attempt < retries - 1) {
        await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
        continue;
      }
      const err = await r.text();
      console.error('supaSave error:', r.status, err);
    } catch (e) {
      console.error('supaSave exception:', e);
    }
  }
}

const CONTRACT_NOTES = {
  Kraken:
    '2 Stories/Mention en CriptoNorber (1 por mes)\n2 Menciones en Telegram de CriptoNorber y Joven Inversor (1 por mes en cada canal)\n1 Mencion en video de YouTube de Joven Inversor\n1 Mencion en video de YouTube de CriptoNorber\n1 Mencion en WhatsApp de CriptoNorber\n1 Mencion en WhatsApp de Joven Inversor\n1 Mencion en X de CriptoNorber',
  Bybit:
    '3 Stories/Mention en CriptoNorber (1 por mes)\n6 Menciones en Telegram y WhatsApp de CriptoNorber (2 por mes en cada canal)\n3 Menciones en Telegram de Joven Inversor (1 por mes)',
  NEXO: '2 Videos dedicados en YouTube de Joven Inversor\n2 Videos dedicados en YouTube de CriptoNorber\n3 Videos integrados (menciones) en YouTube de Joven Inversor\n2 Videos integrados (menciones) en YouTube de CriptoNorber\n12 Instagram Stories (6 Joven Inversor + 6 CriptoNorber)\n3 Tweets en X de CriptoNorber\n12 Mensajes en WhatsApp\n12 Mensajes en Telegram',
  BloFin:
    '6 YT Mencion/mes CriptoNorber – 6 Historias/mes CN – 3 Twitter/X/mes CN – 3 WhatsApp/mes CN – 3 Telegram/mes CN – 12 YT Mencion/mes Joven Inversor – 3 Historias/mes JI – 3 WhatsApp/mes JI – 3 Telegram/mes JI',
};
const NO_TRACK = ['Bullmarket'];
const NEXO_ID = 2;
const NEXO_COMPLETIONS = {
  'Joven Inversor': {
    ytDedicado: [{ idx: 0, date: '2026-03-03' }],
    ytMencion: [{ idx: 0, date: '2026-03-08' }],
    historias: [
      { idx: 0, date: '2026-03-18' },
      { idx: 1, date: '2026-03-18' },
      { idx: 2, date: '2026-03-18' },
    ],
    reelTiktok: [],
    twitter: [],
    whatsapp: [{ idx: 0, date: '2026-03-08' }],
    telegram: [{ idx: 0, date: '2026-03-08' }],
  },
  CriptoNorber: {
    ytDedicado: [{ idx: 0, date: '2026-03-01' }],
    historias: [
      { idx: 0, date: '2026-02-26' },
      { idx: 1, date: '2026-03-02' },
    ],
    twitter: [{ idx: 0, date: '2026-02-26' }],
    whatsapp: [{ idx: 0, date: '2026-02-26' }],
    telegram: [{ idx: 0, date: '2026-02-26' }],
    ytMencion: [],
    reelTiktok: [],
  },
};

const ACTION_TYPES = [
  { key: 'ytDedicado', label: 'YT Dedicado', short: 'YTD' },
  { key: 'ytMencion', label: 'YT Mencion', short: 'YTM' },
  { key: 'historias', label: 'Historias', short: 'HIS' },
  { key: 'reelTiktok', label: 'Reel / TikTok', short: 'REE' },
  { key: 'twitter', label: 'Twitter / X', short: 'TWX' },
  { key: 'whatsapp', label: 'WhatsApp', short: 'WAS' },
  { key: 'telegram', label: 'Telegram', short: 'TEL' },
];
const INFLUENCERS = ['CriptoNorber', 'Joven Inversor'];

// Themes
const DARK = {
  surface: '#18181b',
  surfaceRaised: '#1f1f23',
  surfaceBorder: 'rgba(255,255,255,0.07)',
  surfaceBorderHover: 'rgba(255,255,255,0.18)',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  orange: '#fb923c',
  orangeDim: 'rgba(251,146,60,0.15)',
  success: '#4ade80',
  successDim: 'rgba(74,222,128,0.12)',
  warn: '#fbbf24',
  warnDim: 'rgba(251,191,36,0.12)',
  danger: '#f87171',
  dangerDim: 'rgba(248,113,113,0.12)',
  blue: '#60a5fa',
  blueDim: 'rgba(96,165,250,0.12)',
};
const T = DARK;

const BRAND_COLORS = [
  { bg: 'rgba(251,146,60,0.12)', accent: '#fb923c' },
  { bg: 'rgba(96,165,250,0.12)', accent: '#60a5fa' },
  { bg: 'rgba(167,139,250,0.12)', accent: '#a78bfa' },
  { bg: 'rgba(74,222,128,0.12)', accent: '#4ade80' },
  { bg: 'rgba(251,191,36,0.12)', accent: '#fbbf24' },
  { bg: 'rgba(248,113,113,0.12)', accent: '#f87171' },
  { bg: 'rgba(34,211,238,0.12)', accent: '#22d3ee' },
  { bg: 'rgba(232,121,249,0.12)', accent: '#e879f9' },
];

function brandColor(brand) {
  let h = 0;
  for (let i = 0; i < brand.length; i++)
    h = (h * 31 + brand.charCodeAt(i)) % BRAND_COLORS.length;
  return BRAND_COLORS[h];
}
function brandInitials(brand) {
  return brand.slice(0, 2).toUpperCase();
}
function daysColor(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (diff < 0) return { color: T.danger, bg: T.dangerDim, label: 'vencido' };
  if (diff <= 7) return { color: T.warn, bg: T.warnDim, label: diff + 'd' };
  return { color: T.success, bg: T.successDim, label: deadline };
}

function Pill({ dc, label }) {
  if (!label) return null;
  const style = dc
    ? {
        background: dc.bg,
        color: dc.color,
        fontSize: 10,
        padding: '1px 7px',
        borderRadius: 20,
        display: 'inline-block',
      }
    : {
        background: T.surfaceBorder,
        color: T.textMuted,
        fontSize: 10,
        padding: '1px 7px',
        borderRadius: 20,
        display: 'inline-block',
      };
  return <span style={style}>{dc ? dc.label : label}</span>;
}

function Btn({ onClick, children, small, danger }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover
          ? danger
            ? T.dangerDim
            : 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.05)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: small ? 7 : 8,
        color: danger ? T.danger : T.text,
        cursor: 'pointer',
        padding: small ? '4px 10px' : '6px 14px',
        fontSize: small ? 11 : 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        transition: 'background 0.15s',
        fontFamily: 'system-ui,sans-serif',
      }}
    >
      {children}
    </button>
  );
}

const INITIAL_DEALS = [
  {
    id: 1,
    brand: 'BingX',
    contact: 'Bingx NPG',
    deadline: '2026-10-31',
    budget: 12000,
    influencers: ['CriptoNorber', 'Joven Inversor'],
    actions: {
      CriptoNorber: {
        ytDedicado: 0,
        ytMencion: 3,
        historias: 12,
        reelTiktok: 0,
        twitter: 12,
        whatsapp: 6,
        telegram: 0,
      },
      'Joven Inversor': {
        ytDedicado: 6,
        ytMencion: 0,
        historias: 12,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 12,
        telegram: 0,
      },
    },
  },
  {
    id: 2,
    brand: 'NEXO',
    contact: 'njgiudicenexo@gmail.com',
    deadline: '2026-08-31',
    budget: 12000,
    influencers: ['CriptoNorber', 'Joven Inversor'],
    actions: {
      CriptoNorber: {
        ytDedicado: 2,
        ytMencion: 2,
        historias: 6,
        reelTiktok: 0,
        twitter: 3,
        whatsapp: 12,
        telegram: 12,
      },
      'Joven Inversor': {
        ytDedicado: 2,
        ytMencion: 3,
        historias: 6,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 12,
        telegram: 12,
      },
    },
  },
  {
    id: 4,
    brand: 'Bullmarket',
    contact: 'Cuenta de Agus',
    deadline: '2026-04-30',
    budget: 880,
    influencers: ['CriptoNorber', 'Joven Inversor'],
    actions: {
      CriptoNorber: {
        ytDedicado: 0,
        ytMencion: 0,
        historias: 0,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 0,
        telegram: 0,
      },
      'Joven Inversor': {
        ytDedicado: 0,
        ytMencion: 0,
        historias: 0,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 0,
        telegram: 0,
      },
    },
  },
  {
    id: 8,
    brand: 'BloFin',
    contact: '',
    deadline: '2026-10-31',
    budget: 8000,
    influencers: ['CriptoNorber', 'Joven Inversor'],
    actions: {
      CriptoNorber: {
        ytDedicado: 0,
        ytMencion: 6,
        historias: 6,
        reelTiktok: 0,
        twitter: 3,
        whatsapp: 3,
        telegram: 3,
      },
      'Joven Inversor': {
        ytDedicado: 0,
        ytMencion: 12,
        historias: 3,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 3,
        telegram: 3,
      },
    },
  },
];


export default function App() {
  const [deals, setDeals] = React.useState(INITIAL_DEALS);
  const [completions, setCompletions] = React.useState({
    [NEXO_ID]: NEXO_COMPLETIONS,
  });
  const [log, setLog] = React.useState([]);
  const [notes, setNotes] = React.useState({});
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showLog, setShowLog] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const [filterInf, setFilterInf] = React.useState('all');
  const [newDeal, setNewDeal] = React.useState({
    brand: '',
    contact: '',
    deadline: '',
    budget: '',
    influencers: [],
  });

  React.useEffect(() => {
    supaLoad().then((saved) => {
      if (saved) {
        if (saved.deals) setDeals(saved.deals);
        if (saved.completions) setCompletions(saved.completions);
        if (saved.log) setLog(saved.log);
        if (saved.notes) setNotes(saved.notes);
      }
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (!loading) supaSave({ deals, completions, log, notes });
  }, [deals, completions, log, notes, loading]);

  function addLog(msg) {
    setLog((p) => [
      { ts: new Date().toLocaleString('es-AR'), msg },
      ...p.slice(0, 99),
    ]);
  }

  function toggleAction(dealId, inf, ak, idx, date) {
    setCompletions((prev) => {
      const dc = { ...(prev[dealId] || {}) };
      const ic = { ...(dc[inf] || {}) };
      const arr = [...(ic[ak] || [])];
      const pos = arr.findIndex((e) => e.idx === idx);
      if (pos >= 0) {
        arr.splice(pos, 1);
        addLog(
          inf.split(' ')[0] +
            ' desmarcó ' +
            ak +
            ' #' +
            (idx + 1) +
            ' en deal ' +
            dealId
        );
      } else {
        arr.push({ idx, date });
        addLog(
          inf.split(' ')[0] +
            ' completó ' +
            ak +
            ' #' +
            (idx + 1) +
            ' en deal ' +
            dealId
        );
      }
      ic[ak] = arr;
      dc[inf] = ic;
      return { ...prev, [dealId]: dc };
    });
  }

  function addDeal() {
    if (!newDeal.brand || !newDeal.budget || newDeal.influencers.length === 0)
      return;
    const id = Date.now();
    const actions = {};
    newDeal.influencers.forEach((inf) => {
      actions[inf] = {
        ytDedicado: 0,
        ytMencion: 0,
        historias: 0,
        reelTiktok: 0,
        twitter: 0,
        whatsapp: 0,
        telegram: 0,
      };
    });
    setDeals((p) => [
      ...p,
      { id, ...newDeal, budget: Number(newDeal.budget), actions },
    ]);
    addLog('Nuevo deal: ' + newDeal.brand);
    setNewDeal({
      brand: '',
      contact: '',
      deadline: '',
      budget: '',
      influencers: [],
    });
    setShowAdd(false);
  }

  function moveDeal(idx, dir) {
    setDeals((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }

  const sortedDeals = deals;
  const visible =
    filterInf === 'all'
      ? sortedDeals
      : sortedDeals.filter((d) => d.influencers.includes(filterInf));

  const inputStyle = {
    fontSize: 13,
    padding: '7px 10px',
    borderRadius: 8,
    border: `0.5px solid ${T.surfaceBorder}`,
    background: 'rgba(255,255,255,0.04)',
    color: T.text,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'system-ui,sans-serif',
    outline: 'none',
  };

  if (loading)
    return (
      <div
        style={{
          background: T.surface,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.textDim,
          fontSize: 13,
        }}
      >
        Cargando...
      </div>
    );

  if (selected) {
    const deal = deals.find((d) => d.id === selected);
    return (
      <DealDetail
        deal={deal}
        completions={completions}
        notes={notes}
        setNotes={setNotes}
        onToggle={toggleAction}
        onBack={() => setSelected(null)}
        deals={deals}
        setDeals={setDeals}
        addLog={addLog}
      />
    );
  }

  return (
    <div
      style={{
        background: T.surface,
        minHeight: '100vh',
        fontFamily: 'system-ui,sans-serif',
        padding: '1.5rem 1.25rem 3rem',
        color: T.text,
      }}
    >
      {null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>
            Sponsor tracker
          </div>
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>
            Joven Inversor &amp; CriptoNorber
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            onClick={() => {
              setShowLog(!showLog);
              setShowAdd(false);
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="1"
                width="12"
                height="2.2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="1"
                y="5.9"
                width="8.5"
                height="2.2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="1"
                y="10.8"
                width="5"
                height="2.2"
                rx="1"
                fill="currentColor"
              />
            </svg>
            Log
          </Btn>
          <Btn
            onClick={() => {
              setShowAdd(!showAdd);
              setShowLog(false);
            }}
          >
            + Nuevo deal
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          { l: 'Deals activos', v: deals.length },
          {
            l: 'Budget total',
            v: '$' + deals.reduce((a, d) => a + d.budget, 0).toLocaleString(),
          },
        ].map((m) => (
          <div
            key={m.l}
            style={{
              background: T.surfaceRaised,
              borderRadius: 10,
              padding: '0.875rem 1rem',
              border: `0.5px solid ${T.surfaceBorder}`,
            }}
          >
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 5 }}>
              {m.l}
            </div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {showLog && (
        <div
          style={{
            background: T.surfaceRaised,
            border: `0.5px solid ${T.surfaceBorder}`,
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
            Log de acciones
          </div>
          {log.length === 0 ? (
            <div style={{ fontSize: 12, color: T.textDim }}>
              Sin acciones registradas.
            </div>
          ) : (
            log.map((entry, i) => (
              <div
                key={i}
                style={{ fontSize: 11, color: T.textMuted, marginBottom: 3 }}
              >
                <span style={{ color: T.textDim }}>{entry.ts}</span> —{' '}
                {entry.msg}
              </div>
            ))
          )}
        </div>
      )}

      {showAdd && (
        <div
          style={{
            background: T.surfaceRaised,
            border: `0.5px solid ${T.surfaceBorder}`,
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            Nuevo deal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              style={inputStyle}
              placeholder="Marca"
              value={newDeal.brand}
              onChange={(e) =>
                setNewDeal((p) => ({ ...p, brand: e.target.value }))
              }
            />
            <input
              style={inputStyle}
              placeholder="Contacto"
              value={newDeal.contact}
              onChange={(e) =>
                setNewDeal((p) => ({ ...p, contact: e.target.value }))
              }
            />
            <input
              style={inputStyle}
              type="date"
              value={newDeal.deadline}
              onChange={(e) =>
                setNewDeal((p) => ({ ...p, deadline: e.target.value }))
              }
            />
            <input
              style={inputStyle}
              placeholder="Budget (USD)"
              type="number"
              value={newDeal.budget}
              onChange={(e) =>
                setNewDeal((p) => ({ ...p, budget: e.target.value }))
              }
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {INFLUENCERS.map((inf) => (
                <button
                  key={inf}
                  onClick={() =>
                    setNewDeal((p) => ({
                      ...p,
                      influencers: p.influencers.includes(inf)
                        ? p.influencers.filter((i) => i !== inf)
                        : [...p.influencers, inf],
                    }))
                  }
                  style={{
                    background: newDeal.influencers.includes(inf)
                      ? T.orangeDim
                      : 'rgba(255,255,255,0.04)',
                    border: `0.5px solid ${
                      newDeal.influencers.includes(inf)
                        ? T.orange
                        : T.surfaceBorder
                    }`,
                    borderRadius: 8,
                    color: newDeal.influencers.includes(inf)
                      ? T.orange
                      : T.textMuted,
                    cursor: 'pointer',
                    padding: '5px 12px',
                    fontSize: 12,
                    fontFamily: 'system-ui,sans-serif',
                  }}
                >
                  {inf}
                </button>
              ))}
            </div>
            <Btn onClick={addDeal}>Agregar deal</Btn>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['all', ...INFLUENCERS].map((inf) => (
          <button
            key={inf}
            onClick={() => setFilterInf(inf)}
            style={{
              background: filterInf === inf ? T.orangeDim : 'transparent',
              border: `0.5px solid ${
                filterInf === inf ? T.orange : T.surfaceBorder
              }`,
              borderRadius: 20,
              color: filterInf === inf ? T.orange : T.textMuted,
              cursor: 'pointer',
              padding: '3px 12px',
              fontSize: 12,
              fontFamily: 'system-ui,sans-serif',
            }}
          >
            {inf === 'all' ? 'Todos' : inf}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((deal, dealIdx) => {
          const dc = deal.deadline ? daysColor(deal.deadline) : null;
          const { bg, accent } = brandColor(deal.brand);
          return (
            <div
              key={deal.id}
              onClick={() => setSelected(deal.id)}
              style={{
                background: T.surfaceRaised,
                border: `0.5px solid ${T.surfaceBorder}`,
                borderRadius: 12,
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = T.surfaceBorderHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = T.surfaceBorder)
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 500,
                    color: accent,
                    flexShrink: 0,
                    border: '0.5px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {brandInitials(deal.brand)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: 14 }}>
                      {deal.brand}
                    </span>
                    <span style={{ fontSize: 11, color: T.textDim }}>
                      {deal.contact}
                    </span>
                    <Pill dc={dc} label={deal.deadline} />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 5,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {'$'}
                    {deal.budget.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {deal.influencers.map((inf) => (
                      <span
                        key={inf}
                        style={{
                          fontSize: 10,
                          padding: '1px 7px',
                          borderRadius: 20,
                          background: T.orangeDim,
                          color: T.orange,
                        }}
                      >
                        {inf === 'CriptoNorber' ? 'CN' : 'JI'}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDeal(deals.indexOf(deal), -1);
                    }}
                    disabled={dealIdx === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: dealIdx === 0 ? 'default' : 'pointer',
                      color:
                        dealIdx === 0
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,255,255,0.6)',
                      padding: '1px 4px',
                      fontSize: 13,
                      lineHeight: 1,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDeal(deals.indexOf(deal), 1);
                    }}
                    disabled={dealIdx === visible.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor:
                        dealIdx === visible.length - 1 ? 'default' : 'pointer',
                      color:
                        dealIdx === visible.length - 1
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,255,255,0.6)',
                      padding: '1px 4px',
                      fontSize: 13,
                      lineHeight: 1,
                    }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealDetail({
  deal,
  completions,
  notes,
  setNotes,
  onToggle,
  onBack,
  deals,
  setDeals,
  addLog,
}) {
  if (!deal) {
    onBack();
    return null;
  }

  const dc = deal.deadline ? daysColor(deal.deadline) : null;
  const { bg, accent } = brandColor(deal.brand);
  const isNoTrack = NO_TRACK.includes(deal.brand);
  const dealCompletions = completions[deal.id] || {};
  const [editNote, setEditNote] = React.useState(false);
  const [noteVal, setNoteVal] = React.useState('');
  const [editActions, setEditActions] = React.useState(false);
  const [editDeal, setEditDeal] = React.useState(false);
  const [editDealData, setEditDealData] = React.useState({ ...deal });
  const [editDeadline, setEditDeadline] = React.useState(false);
  const [deadlineVal, setDeadlineVal] = React.useState('');

  const contractNote = CONTRACT_NOTES[deal.brand];

  let totalActions = 0;
  let doneActions = 0;
  if (!isNoTrack) {
    deal.influencers.forEach((inf) => {
      const infActions = deal.actions?.[inf] || {};
      const infCompletions = dealCompletions[inf] || {};
      ACTION_TYPES.forEach(({ key }) => {
        const count = infActions[key] || 0;
        totalActions += count;
        doneActions += Math.min((infCompletions[key] || []).length, count);
      });
    });
  }
  const pct =
    totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

  const inputStyle = {
    fontSize: 13,
    padding: '7px 10px',
    borderRadius: 8,
    border: `0.5px solid ${T.surfaceBorder}`,
    background: 'rgba(255,255,255,0.04)',
    color: T.text,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'system-ui,sans-serif',
    outline: 'none',
  };

  function deleteDeal() {
    if (
      !window.confirm(
        '\u00bfEliminar el deal de ' +
          deal.brand +
          '? Esta acci\u00f3n no se puede deshacer.'
      )
    )
      return;
    setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    addLog('Deal eliminado: ' + deal.brand);
    onBack();
  }

  return (
    <div
      style={{
        background: T.surface,
        minHeight: '100vh',
        fontFamily: 'system-ui,sans-serif',
        padding: '1.5rem 1.25rem 3rem',
        color: T.text,
      }}
    >
      {null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: '1.75rem',
        }}
      >
        <Btn onClick={onBack}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver
        </Btn>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 500,
            color: accent,
            border: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          {brandInitials(deal.brand)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 500 }}>{deal.brand}</span>
            {editDeadline ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="date"
                  value={deadlineVal}
                  onChange={(e) => setDeadlineVal(e.target.value)}
                  style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 8,
                    border: `0.5px solid ${T.surfaceBorder}`,
                    background: 'rgba(255,255,255,0.07)',
                    color: T.text,
                    fontFamily: 'system-ui,sans-serif',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    setDeals((prev) =>
                      prev.map((d) =>
                        d.id === deal.id ? { ...d, deadline: deadlineVal } : d
                      )
                    );
                    addLog(
                      'Fecha actualizada: ' + deal.brand + ' → ' + deadlineVal
                    );
                    setEditDeadline(false);
                  }}
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 8,
                    border: `0.5px solid ${T.success}`,
                    background: T.successDim,
                    color: T.success,
                    cursor: 'pointer',
                    fontFamily: 'system-ui,sans-serif',
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditDeadline(false)}
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 8,
                    border: `0.5px solid ${T.surfaceBorder}`,
                    background: 'rgba(255,255,255,0.04)',
                    color: T.textMuted,
                    cursor: 'pointer',
                    fontFamily: 'system-ui,sans-serif',
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setDeadlineVal(deal.deadline || '');
                  setEditDeadline(true);
                }}
                title="Editar fecha de vencimiento"
              >
                <Pill dc={dc} label={deal.deadline || 'Sin fecha'} />
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ opacity: 0.4 }}
                >
                  <path
                    d="M10 2L12 4L5 11H3V9L10 2Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 1 }}>
            {deal.contact}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {'$'}
            {deal.budget.toLocaleString()}
          </div>
          {!isNoTrack && (
            <div
              style={{
                fontSize: 12,
                color: pct === 100 ? T.success : T.textMuted,
                marginTop: 1,
              }}
            >
              {pct}% completado
            </div>
          )}
        </div>
        <button
          onClick={deleteDeal}
          title="Eliminar deal"
          style={{
            background: 'rgba(220,50,50,0.12)',
            border: '0.5px solid rgba(220,50,50,0.3)',
            borderRadius: 8,
            color: '#f87171',
            cursor: 'pointer',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M12 3.5l-.8 8a1 1 0 01-1 .9H3.8a1 1 0 01-1-.9L2 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Eliminar
        </button>
      </div>

      <div
        style={{
          background: T.surfaceRaised,
          border: `0.5px solid rgba(255,255,255,0.08)`,
          borderRadius: 12,
          padding: '1rem 1.25rem',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: notes[deal.brand] || editNote ? 10 : 0,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 13 }}>
            Acciones contratadas
          </span>
          <Btn
            small
            onClick={() => {
              setNoteVal(notes[deal.brand] || '');
              setEditNote(!editNote);
            }}
          >
            {editNote ? 'Cancelar' : 'Editar'}
          </Btn>
        </div>
        {editNote ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <Btn
              small
              onClick={() => {
                setNotes((p) => ({ ...p, [deal.brand]: noteVal }));
                setEditNote(false);
                addLog('Nota actualizada: ' + deal.brand);
              }}
            >
              Guardar
            </Btn>
          </div>
        ) : notes[deal.brand] ? (
          <div
            style={{ fontSize: 12, color: T.textMuted, whiteSpace: 'pre-line' }}
          >
            {notes[deal.brand]}
          </div>
        ) : contractNote ? (
          <div
            style={{ fontSize: 12, color: T.textMuted, whiteSpace: 'pre-line' }}
          >
            {contractNote}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: T.textDim }}>
            Sin acciones cargadas — hacé click en Editar para agregar.
          </div>
        )}
      </div>

      {deal.influencers.map((inf) => {
        const infActions = deal.actions?.[inf] || {};
        const infCompletions = dealCompletions[inf] || {};
        const infTotal = ACTION_TYPES.reduce(
          (s, { key }) => s + (infActions[key] || 0),
          0
        );
        const infDone = ACTION_TYPES.reduce(
          (s, { key }) =>
            s +
            Math.min((infCompletions[key] || []).length, infActions[key] || 0),
          0
        );
        const infPct =
          infTotal > 0 ? Math.round((infDone / infTotal) * 100) : 0;
        const { bg: iBg, accent: iAccent } = brandColor(inf);

        return (
          <div
            key={inf}
            style={{
              background: T.surfaceRaised,
              border: `0.5px solid rgba(255,255,255,0.08)`,
              borderRadius: 12,
              padding: '1rem 1.25rem',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: iBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    color: iAccent,
                  }}
                >
                  {inf === 'CriptoNorber' ? 'CN' : 'JI'}
                </div>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{inf}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!isNoTrack && (
                  <span style={{ fontSize: 11, color: T.textDim }}>
                    {infPct}%
                  </span>
                )}
                <Btn
                  small
                  onClick={() =>
                    setEditActions(editActions === inf ? false : inf)
                  }
                >
                  {editActions === inf ? 'Cerrar' : 'Editar'}
                </Btn>
              </div>
            </div>

            {editActions === inf && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 12,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                }}
              >
                {ACTION_TYPES.map(({ key, label }) => (
                  <div
                    key={key}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: T.textMuted,
                        minWidth: 100,
                      }}
                    >
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={infActions[key] || 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setDeals((prev) =>
                          prev.map((d) =>
                            d.id === deal.id
                              ? {
                                  ...d,
                                  actions: {
                                    ...d.actions,
                                    [inf]: {
                                      ...(d.actions?.[inf] || {}),
                                      [key]: val,
                                    },
                                  },
                                }
                              : d
                          )
                        );
                      }}
                      style={{ ...inputStyle, width: 60 }}
                    />
                  </div>
                ))}
              </div>
            )}

            {!isNoTrack &&
              ACTION_TYPES.map(({ key, label }) => {
                const count = infActions[key] || 0;
                if (count === 0) return null;
                const completed = infCompletions[key] || [];
                return (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, color: T.textMuted }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 10, color: T.textDim }}>
                        {completed.length}/{count}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Array.from({ length: count }, (_, idx) => {
                        const entry = completed.find((e) => e.idx === idx);
                        const [date, setDate] = React.useState(
                          new Date().toISOString().split('T')[0]
                        );
                        const onDateChange = (v) => setDate(v);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: entry
                                ? T.successDim
                                : 'rgba(255,255,255,0.04)',
                              border: `0.5px solid ${
                                entry ? T.success : 'rgba(255,255,255,0.08)'
                              }`,
                              borderRadius: 8,
                              padding: '4px 8px',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!entry}
                              onChange={() =>
                                onToggle(deal.id, inf, key, idx, date)
                              }
                              style={{
                                cursor: 'pointer',
                                accentColor: T.success,
                              }}
                            />
                            <span style={{ fontSize: 11, color: T.textDim }}>
                              #{idx + 1}
                            </span>
                            {entry ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: T.success,
                                  fontWeight: 500,
                                }}
                              >
                                {entry.date}
                              </span>
                            ) : (
                              <input
                                type="date"
                                value={date}
                                onChange={(e) => onDateChange(e.target.value)}
                                style={{
                                  fontSize: 11,
                                  padding: '1px 4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: T.textMuted,
                                  width: 108,
                                  fontFamily: 'system-ui,sans-serif',
                                  outline: 'none',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
