/**
 * Responsive local assistant bot engine for cybersecurity advice.
 */

export const QUICK_PROMPTS = [
  '¿Tengo riesgo de Phishing?',
  '¿Virus o falso positivo?',
  'Mi PC está muy lenta',
  '¿Cómo configuro la VPN?',
  'Soporte urgente Hackeo'
];

export function getBotResponse(userMessage: string): string {
  const query = userMessage.toLowerCase();

  if (query.includes('phishing') || query.includes('correo') || query.includes('falso') || query.includes('revalidar') || query.includes('ajunto')) {
    return '🤖 [MICRO-SOC ALERTA] - Phishing Detectores:\n\n' +
      '1. Fíjate en el dominio del remitente. Si dice "bancochile-alertas.com" en vez de "bancochile.cl", es falso.\n' +
      '2. Nunca des clic en enlaces urgentes. Entra directo desde tu navegador escribiendo la URL del servicio comercial.\n' +
      '3. Comunícale al resto de la empresa para que tampoco abran dicho correo.\n\n' +
      '¿Deseas completar un Ticket y reportar este adjunto? Elige "Sospecha de Correo Falso" arriba.';
  }

  if (query.includes('virus') || query.includes('antivirus') || query.includes('amenaza') || query.includes('bloque')) {
    return '🤖 [CENTRAL ANÁLISIS DE AMENAZAS] - Antivirus Alertas:\n\n' +
      '• Si el antivirus ya bloqueó el archivo, el riesgo está contenido por ahora.\n' +
      '• No intentes desactivar el antivirus para verificarlo tú mismo. Los falsos positivos existen, pero es mejor que un auditor de Micro-SOC valide la firma del script.\n' +
      '• Te sugerimos rellenar un Ticket con prioridad "Media" adjuntando las observaciones del nombre del virus bloqueado.';
  }

  if (query.includes('lenta') || query.includes('lento') || query.includes('recurso') || query.includes('ventilador')) {
    return '🤖 [DIAGNÓSTICO PREVENTIVO] - Rendimiento de terminal:\n\n' +
      '• Presiona Ctrl+Shift+Esc para abrir el Administrador de Tareas en tu PC.\n' +
      '• Ordena por uso de "Disco" o "CPU" para verificar qué aplicación consume recursos anormales.\n' +
      '• Si observas un ejecutable de letras aleatorias (ej: "ax92.exe") con alto consumo, desconecta el PC del Wi-Fi de inmediato y genera un Ticket con prioridad Alta en Micro-SOC.';
  }

  if (query.includes('vpn') || query.includes('conexion') || query.includes('conectar') || query.includes('remoto')) {
    return '🤖 [INFRAESTRUCTURA SEGURA VERIFIER] - VPN y Conectividad:\n\n' +
      '1. Confirma que tu conexión local a Internet esté activa y estable navegando a otra web.\n' +
      '2. Si te rebota el servidor, verifica que la fecha y hora de tu reloj en tu sistema estén 100% coordinados con la realidad local. (Errores de reloj rompen certificados SSL/VPN).\n' +
      '3. Recuerda que no debes usar VPNs personales para el tráfico confidencial de tu empresa.';
  }

  if (query.includes('hack') || query.includes('urgente') || query.includes('secuestro') || query.includes('pagar') || query.includes('ransomware')) {
    return '🚨 [BOT ALERTA MÁXIMA - RESPUESTA A INCIDENTES]:\n\n' +
      '1. ¡DESCONECTA INMEDIATAMENTE el cable de red y apaga el Wi-Fi de las computadoras afectadas para aislar el problema!\n' +
      '2. NO apagues el equipo por el botón de fuerza si te lo prohíbe una pantalla de rescate, pero aísla el disco duro de la red local.\n' +
      '3. NO respondas los correos ni procedas a realizar pagos en criptomonedas.\n' +
      '4. Carga un Ticket en Micro-SOC en el menú superior con prioridad "Alta 🔴" de inmediato para que nuestros auditores asuman el control.';
  }

  if (query.includes('wifi') || query.includes('publica') || query.includes('cafeteria')) {
    return '🤖 [CONSEJO SOC-BOT] - Wi-Fi Público:\n\n' +
      'Un Wi-Fi público puede estar intervenido por un ataque "Man-in-the-Middle" (un hacker transmitiendo con el mismo nombre de red). Usa tus datos móviles (hotspot) si necesitas transmitir claves corporativas críticas o conéctate con VPN activa desde el primer segundo.';
  }

  if (query.includes('contraseña') || query.includes('clave') || query.includes('password') || query.includes('mfa')) {
    return '🤖 [CONTROL DE ACCESO] - Claves Corruptas:\n\n' +
      '• Configura claves de mínimo 12 caracteres combinando mayúsculas, minúsculas, símbolos y números.\n' +
      '• No repitas la misma clave en tu correo electrónico y en tus sistemas de facturación.\n' +
      '• Activa el Doble Factor de Autenticación (MFA/2FA) para todas tus cuentas críticas.';
  }

  if (query.includes('ayuda') || query.includes('ticket') || query.includes('hola') || query.includes('buenos') || query.includes('tardes') || query.includes('soc')) {
    return '👋 ¡Hola! Soy el asistente virtual e interactivo de **Micro-SOC**.\n\n' +
      'Estoy entrenado para evaluar síntomas informáticos de tu empresa. Puedes consultarme por:\n' +
      '• Sospechas de correo falso (Phishing)\n' +
      '• Archivos sospechosos detectados por tu antivirus\n' +
      '• Redes lentas o caídas de VPN\n' +
      '• Qué hacer ante sospecha de hackeo inminente.\n\n' +
      '¿Qué anomalía observas en tu local comercial o empresa hoy?';
  }

  return '🤖 [MICRO-SOC PROTOCOLO ANALISTA]:\n\n' +
    'He registrado tus observaciones: "' + userMessage + '". Recuerda que nuestro equipo de auditores humanos vigila constantemente esta cola.\n\n' +
    'Te sugiero encarecidamente que si notas un comportamiento inapropiado del software, rellenes el formulario de "Enviar Ticket" seleccionando el tipo de incidente y prioridad adecuados. ¡Estamos para proteger a tu PYME a precio accesible!';
}
