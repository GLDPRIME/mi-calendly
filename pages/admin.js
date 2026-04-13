import { useState, useEffect } from 'react'
import Head from 'next/head'

// ── EDITA AQUÍ tu contraseña de admin ────────────────────────────────────────
const ADMIN_PASSWORD = 'admin123'
// ─────────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin-bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => { if (authed) load() }, [authed])

  function login() {
    if (pw === ADMIN_PASSWORD) setAuthed(true)
    else alert('Contraseña incorrecta')
  }

  const filtered = bookings.filter(b =>
    !filter || b.name?.toLowerCase().includes(filter.toLowerCase()) || b.email?.toLowerCase().includes(filter.toLowerCase())
  )

  const today = new Date().toISOString().split('T')[0]
  const upcoming = filtered.filter(b => b.date >= today)
  const past = filtered.filter(b => b.date < today)

  if (!authed) return (
    <>
      <Head><title>Admin — Mi Calendly</title></Head>
      <div style={s.loginPage}>
        <div style={s.loginCard}>
          <p style={s.loginTitle}>Panel de administración</p>
          <input style={s.input} type="password" placeholder="Contraseña" value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()} />
          <button style={s.btnPrimary} onClick={login}>Entrar</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin — Mi Calendly</title></Head>
      <div style={s.page}>
        <div style={s.topBar}>
          <p style={s.pageTitle}>Reservas</p>
          <div style={s.topRight}>
            <span style={s.badge}>{upcoming.length} próximas</span>
            <button style={s.btnSmall} onClick={load}>↻ Actualizar</button>
            <a href="/" style={s.btnSmall}>← Ver calendario</a>
          </div>
        </div>

        <input style={s.search} placeholder="Buscar por nombre o correo..." value={filter} onChange={e => setFilter(e.target.value)} />

        {loading && <p style={s.hint}>Cargando...</p>}

        {!loading && (
          <>
            {upcoming.length > 0 && (
              <section>
                <p style={s.sectionLabel}>Próximas ({upcoming.length})</p>
                <BookingTable bookings={upcoming} highlight />
              </section>
            )}
            {past.length > 0 && (
              <section style={{marginTop:32}}>
                <p style={s.sectionLabel}>Pasadas ({past.length})</p>
                <BookingTable bookings={past} />
              </section>
            )}
            {filtered.length === 0 && <p style={s.hint}>No hay reservas aún.</p>}
          </>
        )}
      </div>
    </>
  )
}

function BookingTable({ bookings, highlight }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['Fecha','Hora','Nombre','Correo','Notas'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} style={highlight ? s.trHighlight : s.tr}>
              <td style={s.td}>{b.date}</td>
              <td style={s.td}>{b.time}</td>
              <td style={{...s.td, fontWeight:500}}>{b.name}</td>
              <td style={s.td}>{b.email}</td>
              <td style={{...s.td, color:'var(--text-muted)', maxWidth:220}}>{b.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const s = {
  loginPage: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' },
  loginCard: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'32px 28px', display:'flex', flexDirection:'column', gap:14, width:320 },
  loginTitle: { fontSize:16, fontWeight:600 },
  page: { maxWidth:900, margin:'0 auto', padding:'32px 20px' },
  topBar: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 },
  pageTitle: { fontSize:20, fontWeight:600 },
  topRight: { display:'flex', alignItems:'center', gap:10 },
  badge: { fontSize:12, background:'#edf7f2', color:'#2a7a4f', padding:'4px 10px', borderRadius:20, fontWeight:500 },
  btnSmall: { fontSize:13, padding:'6px 14px', border:'1px solid var(--border)', borderRadius:8, background:'none', color:'var(--text)', cursor:'pointer' },
  btnPrimary: { fontSize:14, padding:'10px 0', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontWeight:500, cursor:'pointer' },
  input: { fontSize:14, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', outline:'none' },
  search: { fontSize:14, padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', outline:'none', width:'100%', marginBottom:24 },
  hint: { fontSize:14, color:'var(--text-muted)', textAlign:'center', marginTop:40 },
  sectionLabel: { fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 },
  tableWrap: { overflowX:'auto', border:'1px solid var(--border)', borderRadius:10 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)', background:'var(--bg)' },
  td: { padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text)' },
  tr: { background:'var(--surface)' },
  trHighlight: { background:'#f0f9f4' },
}
