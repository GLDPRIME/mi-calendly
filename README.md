# Mi Calendly 📅

Clon de Calendly con Next.js + Supabase + Vercel.

---

## Estructura del proyecto

```
pages/
  index.js          ← Página pública (el calendario que ve tu cliente)
  admin.js          ← Panel para ver todas las reservas
  api/
    bookings.js     ← Guarda una nueva reserva en Supabase
    admin-bookings.js ← Lee todas las reservas
lib/
  supabase.js       ← Conexión a la base de datos
styles/
  globals.css       ← Estilos globales
```

---

## Cómo personalizar

Abre `pages/index.js` y edita el objeto `CONFIG` al inicio del archivo:

```js
const CONFIG = {
  hostName: 'Tu nombre aquí',
  hostInitials: 'TN',
  meetingTitle: 'Reunión de 45 minutos',
  duration: '45 min',
  timezone: 'CLT (Santiago)',
  meetingType: 'Videollamada',
  slots: {
    1: ['09:00', '10:00', '14:00'],   // Lunes
    2: ['09:00', '11:00'],            // Martes
    3: ['10:00', '15:00'],            // Miércoles
    4: ['09:00', '13:00'],            // Jueves
    5: ['09:00'],                     // Viernes
  }
}
```

Para cambiar la contraseña del panel admin, edita `pages/admin.js`:
```js
const ADMIN_PASSWORD = 'tu_nueva_contraseña'
```

---

## Deploy paso a paso

### 1. Crear la base de datos en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto
3. En el menú izquierdo ve a **SQL Editor** y ejecuta:

```sql
create table bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  notes text,
  date date not null,
  time text not null,
  created_at timestamp default now()
);
```

4. Ve a **Project Settings → API**
5. Copia la **Project URL** y la **anon public key**

### 2. Subir el código a GitHub

1. Ve a https://github.com y crea un repositorio nuevo (llámalo `mi-calendly`)
2. En tu computador, abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "primer commit"
git remote add origin https://github.com/TUUSUARIO/mi-calendly.git
git push -u origin main
```

### 3. Publicar en Vercel (gratis)

1. Ve a https://vercel.com y crea una cuenta con tu cuenta de GitHub
2. Haz clic en **"Add New Project"**
3. Elige tu repositorio `mi-calendly`
4. Antes de hacer deploy, agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL` → tu Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → tu anon key de Supabase
5. Haz clic en **Deploy**

¡Listo! Vercel te dará un link como `https://mi-calendly.vercel.app`

---

## URLs de tu app

| URL | Descripción |
|-----|-------------|
| `tuapp.vercel.app/` | Calendario público (para compartir con clientes) |
| `tuapp.vercel.app/admin` | Panel de administración (solo tú) |

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# (edita .env.local con tus credenciales de Supabase)

# 3. Iniciar servidor local
npm run dev
# → Abre http://localhost:3000
```
