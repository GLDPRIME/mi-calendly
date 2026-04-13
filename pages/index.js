import { useState } from 'react'
import Head from 'next/head'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_SHORT = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

// ── EDITA AQUÍ TU CONFIGURACIÓN ──────────────────────────────────────────────
const CONFIG = {
  hostName: 'Glen Barber',
  hostInitials: 'GB',
  meetingTitle: 'Reserva tu corte',
  duration: '45 min',
  timezone: 'CLT (Santiago)',
  meetingType: 'Diagonal Paraguay',
  // Horarios por día de la semana (1=Lunes … 6=Sábado)
  slots: {
    1: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    2: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    3: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    4: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    5: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    6: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const today = new Date(); today.setHours(0,0,0,0)
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selDate, setSelDate] = useState(null)
  const [selTime, setSelTime] = useState(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  const yr = viewDate.getFullYear(), mo = viewDate.getMonth()
  const firstDow = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()

  const calDays = []
  for (let i = 0; i < firstDow; i++) calDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

  const slots = selDate ? (CONFIG.slots[selDate.getDay()] || []) : []

  async function confirm() {
    if (!form.name || !form.email) { setError('Completa tu nombre y correo.'); return }
    setError(''); setLoading(true)
    const dateStr = selDate.toISOString().split('T')[0]
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date: dateStr, time: selTime })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al guardar'); return }
    setBooking(data.booking)
    setStep(3)
  }

  function reset() {
    setSelDate(null); setSelTime(null); setStep(1)
    setForm({ name: '', email: '', notes: '' }); setBooking(null); setError('')
  }

  const dateLabel = selDate
    ? selDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <>
      <Head>
        <title>{CONFIG.meetingTitle} — {CONFIG.hostName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.page}>
        <div style={s.card}>

          {/* SIDEBAR */}
          <aside style={s.sidebar}>
            <div style={s.avatar}>{CONFIG.hostInitials}</div>
            <p style={s.hostName}>{CONFIG.hostName}</p>
            <p style={s.meetingTitle}>{CONFIG.meetingTitle}</p>
            <div style={s.divider} />
            <div style={s.meta}><span style={s.dot}/>{CONFIG.duration}</div>
            <div style={s.meta}>
              <ClockIcon /> {CONFIG.timezone}
            </div>
            <div style={s.meta}>
              <VideoIcon /> {CONFIG.meetingType}
            </div>
          </aside>

          {/* MAIN */}
          <main style={s.main}>

            {/* ── STEP 1: Calendario + horarios ── */}
            {step === 1 && (
              <div style={s.stepWrap}>
                <div style={s.stepHeader}>
                  <p style={s.stepTitle}>Selecciona una fecha y hora</p>
                  <p style={s.stepSub}>Elige el día que mejor te acomode</p>
                </div>

                {/* Navegación */}
                <div style={s.calNav}>
                  <button style={s.navBtn} onClick={() => setViewDate(new Date(yr, mo - 1, 1))}>←</button>
                  <span style={s.calMonth}>{MONTHS[mo]} {yr}</span>
                  <button style={s.navBtn} onClick={() => setViewDate(new Date(yr, mo + 1, 1))}>→</button>
                </div>

                {/* Grid días */}
                <div style={s.calGrid}>
                  {DAYS_SHORT.map(d => <div key={d} style={s.dow}>{d}</div>)}
                  {calDays.map((d, i) => {
                    if (!d) return <div key={`e${i}`} />
                    const dt = new Date(yr, mo, d)
                    const isPast = dt < today
                    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6
                    const isAvail = !isPast && !isWeekend
                    const isSel = selDate && dt.toDateString() === selDate.toDateString()
                    return (
                      <button
                        key={d}
                        style={{
                          ...s.dayBtn,
                          ...(isSel ? s.dayBtnSel : {}),
                          ...(isAvail && !isSel ? s.dayBtnAvail : {}),
                          ...(!isAvail ? s.dayBtnDisabled : {}),
                        }}
                        disabled={!isAvail}
                        onClick={() => { setSelDate(dt); setSelTime(null) }}
                      >{d}</button>
                    )
                  })}
                </div>

                {/* Horarios */}
                {selDate && (
                  <div style={s.timesWrap}>
                    <p style={s.timesTitle}>{dateLabel}</p>
                    {slots.length === 0
                      ? <p style={s.noSlots}>Sin horarios disponibles este día.</p>
                      : <div style={s.timesGrid}>
                          {slots.map(t => (
                            <button
                              key={t}
                              style={{ ...s.timeBtn, ...(selTime === t ? s.timeBtnSel : {}) }}
                              onClick={() => setSelTime(t)}
                            >{t}</button>
                          ))}
                        </div>
                    }
                  </div>
                )}

                <div style={s.btnRow}>
                  <button
                    style={{ ...s.btnPrimary, ...(!selTime ? s.btnDisabled : {}) }}
                    disabled={!selTime}
                    onClick={() => setStep(2)}
                  >Siguiente →</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Formulario ── */}
            {step === 2 && (
              <div style={s.stepWrap}>
                <div style={s.stepHeader}>
                  <p style={s.stepTitle}>Tus datos</p>
                  <p style={s.stepSub}>{dateLabel} · {selTime}</p>
                </div>
                <div style={s.formArea}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Nombre completo *</label>
                    <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Tu nombre" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Correo electrónico *</label>
                    <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tu@correo.com" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Notas adicionales (opcional)</label>
                    <textarea style={s.textarea} rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Motivo de la cita..." />
                  </div>
                  {error && <p style={s.errorMsg}>{error}</p>}
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnSecondary} onClick={() => setStep(1)}>← Atrás</button>
                  <button style={{ ...s.btnPrimary, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={confirm}>
                    {loading ? 'Guardando…' : 'Confirmar cita'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirmación ── */}
            {step === 3 && (
              <div style={s.confirmWrap}>
                <div style={s.checkCircle}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#2a7a4f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={s.confirmTitle}>¡Cita confirmada!</p>
                <p style={s.confirmSub}>Te esperamos en Diagonal Paraguay. ¡Hasta pronto!</p>
                <div style={s.confirmCard}>
                  {[
                    ['Reunión', CONFIG.meetingTitle],
                    ['Fecha', booking?.date],
                    ['Hora', booking?.time],
                    ['Invitado', booking?.name],
                    ['Correo', booking?.email],
                  ].map(([k,v]) => (
                    <div key={k} style={s.confirmRow}>
                      <span style={s.confirmKey}>{k}</span>
                      <span style={s.confirmVal}>{v}</span>
                    </div>
                  ))}
                </div>
                <button style={s.btnSecondary} onClick={reset}>Agendar otra cita</button>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  )
}

// ── Iconos ────────────────────────────────────────────────────────────────────
function ClockIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
}
function VideoIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
    <rect x="1" y="4" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', background:'var(--bg)' },
  card: { display:'flex', background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden', width:'100%', maxWidth:820, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' },
  sidebar: { width:220, flexShrink:0, borderRight:'1px solid var(--border)', padding:'28px 20px', display:'flex', flexDirection:'column', gap:10 },
  avatar: { width:48, height:48, borderRadius:'50%', background:'#e8f0fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:600, color:'#2a5bd7' },
  hostName: { fontSize:12, color:'var(--text-muted)', marginTop:2 },
  meetingTitle: { fontSize:15, fontWeight:600, color:'var(--text)', marginTop:4 },
  divider: { height:1, background:'var(--border)', margin:'4px 0' },
  meta: { display:'flex', alignItems:'center', gap:7, fontSize:12, color:'var(--text-muted)' },
  dot: { width:7, height:7, borderRadius:'50%', background:'#2a7a4f', flexShrink:0 },
  main: { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
  stepWrap: { display:'flex', flexDirection:'column', flex:1 },
  stepHeader: { padding:'24px 28px 16px', borderBottom:'1px solid var(--border)' },
  stepTitle: { fontSize:15, fontWeight:600 },
  stepSub: { fontSize:13, color:'var(--text-muted)', marginTop:3 },
  calNav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 28px 8px' },
  calMonth: { fontSize:14, fontWeight:600 },
  navBtn: { background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'4px 12px', fontSize:13, color:'var(--text)' },
  calGrid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, padding:'0 28px 12px' },
  dow: { textAlign:'center', fontSize:11, color:'var(--text-hint)', padding:'4px 0 8px' },
  dayBtn: { aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, borderRadius:'50%', border:'none', background:'none', color:'var(--text-muted)', cursor:'default' },
  dayBtnAvail: { color:'var(--text)', fontWeight:500, cursor:'pointer' },
  dayBtnSel: { background:'var(--accent)', color:'#fff', fontWeight:600 },
  dayBtnDisabled: { color:'var(--text-hint)', opacity:0.5 },
  timesWrap: { padding:'12px 28px 0' },
  timesTitle: { fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-muted)' },
  noSlots: { fontSize:13, color:'var(--text-hint)' },
  timesGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 },
  timeBtn: { border:'1px solid var(--border)', borderRadius:8, padding:'8px 0', fontSize:13, background:'none', color:'var(--text)', cursor:'pointer', textAlign:'center' },
  timeBtnSel: { background:'var(--accent)', color:'#fff', borderColor:'var(--accent)' },
  btnRow: { padding:'16px 28px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10, marginTop:'auto' },
  btnPrimary: { fontSize:13, padding:'9px 20px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontWeight:500 },
  btnSecondary: { fontSize:13, padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', background:'none', color:'var(--text)' },
  btnDisabled: { opacity:0.4, cursor:'not-allowed' },
  formArea: { flex:1, padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 },
  formGroup: { display:'flex', flexDirection:'column', gap:5 },
  label: { fontSize:12, fontWeight:500, color:'var(--text-muted)' },
  input: { fontSize:14, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', outline:'none' },
  textarea: { fontSize:14, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', resize:'none', outline:'none' },
  errorMsg: { fontSize:13, color:'#c0392b', marginTop:4 },
  confirmWrap: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:'32px 28px', textAlign:'center' },
  checkCircle: { width:56, height:56, borderRadius:'50%', background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center' },
  confirmTitle: { fontSize:17, fontWeight:600 },
  confirmSub: { fontSize:13, color:'var(--text-muted)', maxWidth:300 },
  confirmCard: { border:'1px solid var(--border)', borderRadius:10, padding:'14px 20px', width:'100%', maxWidth:320, textAlign:'left' },
  confirmRow: { display:'flex', gap:8, fontSize:13, padding:'4px 0' },
  confirmKey: { color:'var(--text-muted)', minWidth:70 },
  confirmVal: { color:'var(--text)', fontWeight:500, wordBreak:'break-all' },
}
