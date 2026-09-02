/**
 * Ingeniería y Construcción CM Ltda.
 * Receptor de solicitudes de cotización del sitio web.
 *
 * Este archivo NO se sube al sitio. Su contenido se pega dentro del editor de
 * Apps Script de la hoja de cálculo de Google. Ver GUIA-FORMULARIO.md.
 */

/* ------------------------------------------------------------------ AJUSTES */

// Nombre de la pestaña donde se guardan los leads. Se crea sola si no existe.
var NOMBRE_HOJA = 'Leads';

// Aviso por correo cada vez que llega una solicitud.
// Para desactivarlo, cambie true por false.
var ENVIAR_AVISO = true;
var AVISAR_A = 'fernando.casas@ingenieriacasas.cl';

var COLUMNAS = [
  'Fecha',
  'Nombre',
  'Email',
  'Teléfono',
  'Ciudad / Comuna',
  'Tipo de servicio',
  'Detalles del proyecto',
  'Origen'
];

/* -------------------------------------------------- RECEPCIÓN DEL FORMULARIO */

function doPost(e) {
  try {
    var datos = (e && e.parameter) ? e.parameter : {};

    var fila = [
      new Date(),
      String(datos.name    || ''),
      String(datos.email   || ''),
      String(datos.phone   || ''),
      String(datos.city    || ''),
      String(datos.service || ''),
      String(datos.message || ''),
      String(datos.origen  || '')
    ];

    obtenerHoja_().appendRow(fila);

    // El aviso por correo nunca debe impedir que el lead quede guardado.
    if (ENVIAR_AVISO) {
      try {
        enviarAviso_(fila);
      } catch (errCorreo) {
        console.warn('No se pudo enviar el aviso por correo: ' + errCorreo);
      }
    }

    return responder_({ ok: true });

  } catch (err) {
    console.error(err);
    return responder_({ ok: false, error: String(err) });
  }
}

/**
 * Permite abrir la URL en el navegador para comprobar que está publicada.
 */
function doGet() {
  return responder_({ ok: true, mensaje: 'Endpoint de cotizaciones activo.' });
}

/* ----------------------------------------------------------------- INTERNAS */

function obtenerHoja_() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(NOMBRE_HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
  }

  // Si la hoja está vacía, escribimos los títulos de las columnas.
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length)
        .setFontWeight('bold')
        .setBackground('#f0f0f0');
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 150);  // Fecha
    hoja.setColumnWidth(7, 400);  // Detalles del proyecto
  }

  return hoja;
}

function enviarAviso_(fila) {
  var cuerpo = [
    'Nueva solicitud de cotización desde el sitio web.',
    '',
    'Nombre: '            + fila[1],
    'Email: '             + fila[2],
    'Teléfono: '          + (fila[3] || 'No indicado'),
    'Ciudad / Comuna: '   + (fila[4] || 'No indicada'),
    'Tipo de servicio: '  + fila[5],
    '',
    'Detalles del proyecto:',
    fila[6],
    '',
    'Origen: ' + (fila[7] || 'No indicado'),
    '',
    '— Enviado automáticamente por el formulario de ingenieriacasas.cl'
  ].join('\n');

  MailApp.sendEmail({
    to: AVISAR_A,
    subject: 'Nueva cotización — ' + fila[5] + ' — ' + fila[1],
    body: cuerpo,
    replyTo: fila[2] || undefined
  });
}

function responder_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
