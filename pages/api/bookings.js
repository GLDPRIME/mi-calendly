import { supabase } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, notes, date, time } = req.body

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, email, notes, date, time }])
    .select()

  if (error) return res.status(500).json({ error: error.message })

  // Enviar correo de notificación al dueño
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.NOTIFY_EMAIL,
    subject: `Nueva cita — ${name}`,
    html: `
      <h2>Nueva cita reservada en Glen Barber ✂️</h2>
      <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
        <tr><td style="padding:6px 16px 6px 0;color:#666">Nombre</td><td><strong>${name}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Correo</td><td>${email}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Fecha</td><td>${date}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Hora</td><td>${time}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Teléfono</td><td>${notes || '—'}</td></tr>
      </table>
      <p style="margin-top:20px;color:#666;font-size:13px">Ver todas las citas → <a href="https://mi-calendly.vercel.app/admin">Panel admin</a></p>
    `
  })

  return res.status(200).json({ ok: true, booking: data[0] })
}
