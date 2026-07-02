# Dinova Agency - Guía de Configuración

## 1. Configurar Supabase

### Crear proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto llamado "dinova-registrations"
3. Anota tu **Project URL** y **anon public key** (Settings > API)

### Crear tabla de registros
Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Crear tabla de registros
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  olive_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  id_photo_url TEXT,
  selfie_photo_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede insertar (para el formulario público)
CREATE POLICY "Allow public inserts" ON registrations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Política: solo usuarios autenticados pueden ver registros
CREATE POLICY "Allow authenticated reads" ON registrations
  FOR SELECT TO authenticated
  USING (true);
```

### Crear bucket de almacenamiento
1. Ve a **Storage** en Supabase
2. Crea un nuevo bucket llamado `registrations`
3. Marca como **público** (para que las URLs de las fotos sean accesibles)
4. En **Policies**, agrega:

```sql
-- Permitir uploads públicos al bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'registrations');

-- Permitir lectura pública
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'registrations');
```

### Actualizar main.js
En el archivo `main.js`, reemplaza los valores placeholder:
```javascript
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-CLAVE-PUBLICA-ANON';
```

---

## 2. Conectar con Google Sheets

### Opción A: Usando Google Apps Script (Recomendado - GRATIS)

1. Crea una hoja de Google Sheets nueva
2. Ve a **Extensiones > Apps Script**
3. Pega este código:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Agregar headers si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Fecha', 'ID Olive', 'Nombre', 'Apellido', 
        'Edad', 'Teléfono', 'País', 
        'Foto Cédula URL', 'Selfie URL', 'Estado'
      ]);
    }
    
    // Agregar nueva fila
    sheet.appendRow([
      new Date().toLocaleString('es-MX'),
      data.olive_id,
      data.first_name,
      data.last_name,
      data.age,
      data.phone,
      data.country,
      data.id_photo_url || '',
      data.selfie_photo_url || '',
      'Pendiente'
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Implementar > Nueva implementación**
5. Tipo: **App web**
6. Ejecutar como: **Yo**
7. Quién tiene acceso: **Cualquier persona**
8. Click **Implementar** y copia la URL
9. En `main.js`, reemplaza:
```javascript
const GOOGLE_SHEETS_WEBHOOK_URL = 'TU-URL-DE-APPS-SCRIPT';
```

---

## 3. Desplegar en Vercel (Gratis)

### Pasos:
1. Sube tu proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
3. Importa tu repositorio
4. Configuración del build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anon
   - `VITE_GOOGLE_SHEETS_WEBHOOK_URL` = tu URL de Apps Script
6. Click **Deploy**

### Tu logo
Coloca tu logo de Dinova en:
- `public/images/logo.png` (para la web)
- `public/favicon.ico` (como favicon)

---

## 4. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (NO lo subas a GitHub):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/tu-id/exec
```
