import { supabase } from '../../lib/supabase'

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

  return res.status(200).json({ ok: true, booking: data[0] })
}
