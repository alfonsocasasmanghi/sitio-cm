# Guía: conectar el formulario a una hoja de Google

Objetivo: que cada solicitud de cotización quede guardada en una planilla de
Google (y además le llegue un correo de aviso), en vez de abrir el correo del
visitante.

Tiempo estimado: 10 minutos. No hay que saber programar: es copiar y pegar.

---

## Paso 1 — Crear la hoja de cálculo

1. Entre a <https://sheets.google.com> con la cuenta de Google de la empresa
   (la misma donde quiere recibir los avisos).
2. Cree una hoja en blanco.
3. Póngale un nombre reconocible arriba a la izquierda, por ejemplo:
   **Cotizaciones sitio web CM**.

No hace falta escribir los títulos de las columnas: el script los crea solo la
primera vez que llega una solicitud.

---

## Paso 2 — Pegar el script

1. Dentro de esa misma hoja, vaya al menú **Extensiones → Apps Script**.
   Se abre una pestaña nueva con un editor de código.
2. Verá un archivo llamado `Código.gs` con unas pocas líneas de ejemplo
   (`function myFunction() { }`). **Borre todo lo que haya ahí.**
3. Abra el archivo `google-apps-script/Codigo.gs` de este proyecto, copie
   **todo** su contenido y péguelo en el editor.
4. Haga clic en el ícono de disquete (**Guardar proyecto**).

> Si quiere que el aviso llegue a otro correo, cambie la línea:
> `var AVISAR_A = 'fernando.casas@ingenieriacasas.cl';`
> Si no quiere avisos por correo, cambie `var ENVIAR_AVISO = true;` por `false`.

---

## Paso 3 — Publicar el script como aplicación web

1. Arriba a la derecha, botón azul **Implementar → Nueva implementación**.
2. Junto a "Seleccionar tipo" hay un ícono de engranaje. Haga clic y elija
   **Aplicación web**.
3. Complete así:
   - **Descripción:** `Formulario cotizaciones` (cualquier texto sirve).
   - **Ejecutar como:** *Yo* (su correo).
   - **Quién tiene acceso:** **Cualquier persona**.

   > ⚠️ Este último punto es el que más se equivoca. Tiene que decir
   > "Cualquier persona", **no** "Cualquier persona con una cuenta de Google".
   > Si queda mal, el sitio no podrá guardar los leads.

4. Clic en **Implementar**.
5. Google le pedirá autorizar. Aparecerá una advertencia que dice
   *"Google no ha verificado esta aplicación"*. Es normal, porque el script lo
   escribió usted, no una empresa externa. Haga clic en **Configuración
   avanzada** → **Ir a (nombre del proyecto) (no seguro)** → **Permitir**.
6. Al terminar le muestra una **URL de la aplicación web**. Se ve así:

   ```
   https://script.google.com/macros/s/AKfycb.....................hs/exec
   ```

   **Cópiela.** Esa es la dirección donde el sitio va a dejar los leads.

---

## Paso 4 — Pegar la URL en el sitio

1. Abra el archivo `script.js`.
2. Arriba de todo verá estas líneas:

   ```js
   var CONFIG = {
     // Pegue aquí la URL /exec de Google Apps Script
     ENDPOINT_FORMULARIO: "",
   ```

3. Pegue la URL **entre las comillas**:

   ```js
     ENDPOINT_FORMULARIO: "https://script.google.com/macros/s/AKfycb....../exec",
   ```

4. Guarde el archivo y publique el sitio.

> Mientras esa línea esté vacía, el formulario sigue funcionando pero vuelve al
> comportamiento antiguo (abre el correo del visitante), para que el sitio nunca
> quede sin forma de recibir contactos.

---

## Paso 5 — Probar

1. Entre al sitio publicado, vaya a "Solicitar cotización" y envíe una solicitud
   de prueba con sus propios datos.
2. Debe aparecer el mensaje verde **"¡Gracias! Te contactamos en 24 h."**
3. Vuelva a la hoja de cálculo: debe haber una fila nueva.
4. Revise su correo: debe haber llegado el aviso.

Si no aparece la fila, casi siempre es el Paso 3.3: vuelva a
**Implementar → Administrar implementaciones**, edite (ícono de lápiz) y
confirme que "Quién tiene acceso" dice **Cualquier persona**.

---

## Si más adelante modifica el script

Guardar no basta: hay que volver a publicar.
**Implementar → Administrar implementaciones → lápiz → Versión: Versión nueva →
Implementar.** La URL no cambia.
