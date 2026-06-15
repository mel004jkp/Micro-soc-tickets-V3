import { FAQItem } from '../types';

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    categoria: 'Phishing y Correos',
    pregunta: '¿Cómo diferencio un correo legítimo de mi banco de un ataque de Phishing?',
    respuesta: 'Los bancos legítimos nunca pedirán contraseñas, PINs o códigos SMS por correo. Revisa siempre la dirección exacta del remitente (ej. contacto@mi-banco.com vs contacto@banco15-seguro-revalidar.com). Si tiene enlaces raros o te urge a actuar por "riesgo de bloqueo", sospecha de phishing imediato.'
  },
  {
    id: 'faq-2',
    categoria: 'Antivirus',
    pregunta: 'Mi antivirus bloqueó un archivo de un programa de confianza. ¿Es un virus real?',
    respuesta: 'Esto suele conocerse como un "Falso Positivo". Sucede si el programa realiza actualizaciones o acciones inusuales que el antivirus califica como dudosas. Intenta verificar la fuente de descarga original o contacta a Micro-SOC antes de añadirlo a excepciones.'
  },
  {
    id: 'faq-3',
    categoria: 'Redes y VPN',
    pregunta: 'No me puedo conectar a la VPN empresarial y me sale error de credenciales. ¿Me hackearon?',
    respuesta: 'En la gran mayoría de casos es un problema de red local, clave vencida, desincronización horaria entre tu equipo y el servidor, o mantenimiento. Prueba reiniciando la conexión o la PC. Si persiste, ingresa un ticket con prioridad Media.'
  },
  {
    id: 'faq-4',
    categoria: 'Alertas Falsas',
    pregunta: 'Me apareció un anuncio gigante diciendo que mi equipo tiene 15 virus y debo pagar para limpiarlo.',
    respuesta: '¡Totalmente falso! Estos anuncios se conocen como "Scareware". Son ventanas emergentes en el navegador web diseñadas para infundir miedo para que descargues virus reales o entregues tu tarjeta de crédito. Simplemente cierra la pestaña del navegador inmediatamente.'
  },
  {
    id: 'faq-5',
    categoria: 'Dispositivos',
    pregunta: 'La luz de la cámara web de mi laptop parpadeó un segundo al encender. ¿Fui hackeado?',
    respuesta: 'A menudo el sistema operativo o aplicaciones autorizadas de videollamadas hacen un chequeo de hardware al arrancar o despertar el equipo. No obstante, para máxima seguridad, mantén el software de tu cámara cubierto con un protector físico cuando no lo uses.'
  },
  {
    id: 'faq-6',
    categoria: 'Contraseñas',
    pregunta: '¿Por qué mi navegador web me dice que una de mis contraseñas fue expuesta en una filtración?',
    respuesta: 'Significa que una página externa donde usaste esa contraseña sufrió una brecha de datos pública. No significa que tu PC esté hackeada, pero sí debes cambiar esa contraseña de inmediato en cualquier servicio donde la estés repitiendo.'
  },
  {
    id: 'faq-7',
    categoria: 'Rendimiento',
    pregunta: 'Mi computadora está extremadamente lenta y el ventilador suena fuerte. ¿Es señal de malware?',
    respuesta: 'Puede ser, pero primero descarta actualizaciones automáticas de Windows/Office en segundo plano, exceso de pestañas en el navegador, o acumulación de polvo físico sobre los ventiladores. Revisa tu Administrador de Tareas para ver qué consume tu procesador.'
  },
  {
    id: 'faq-8',
    categoria: 'Phishing y Correos',
    pregunta: 'Recibí un correo falso pero no abrí ningún enlace. ¿Está en peligro mi empresa?',
    respuesta: 'No. El simple hecho de recibir o abrir el mensaje para leerlo rara vez comprometerá tu sistema, siempre y cuando no hayas descargado archivos adjuntos, ejecutado scripts o hecho clic en sus enlaces para introducir tus datos.'
  },
  {
    id: 'faq-9',
    categoria: 'Amenazas Reales',
    pregunta: '¿Qué es un Ransomware y cómo me doy cuenta si mi tienda local lo sufre?',
    respuesta: 'El Ransomware es un secuestro de datos. Sabrás que lo tienes si tus archivos cambian de icono a extensiones irreconocibles, no abren, y aparece un archivo de texto en tu escritorio exigiendo un rescate monetario para devolverte el acceso. Apaga el equipo y contáctanos inmediatamente.'
  },
  {
    id: 'faq-10',
    categoria: 'Antivirus',
    pregunta: '¿Es necesario tener más de un antivirus instalado en el mismo computador local?',
    respuesta: '¡No! Tener dos antivirus con protección en tiempo real activos causa conflictos del sistema, ralentiza horriblemente la máquina y puede hacer que se cancelen mutuamente, dejándote desprotegido. Usa solo una solución certificada.'
  },
  {
    id: 'faq-11',
    categoria: 'Redes y VPN',
    pregunta: '¿Es seguro conectarme al Wi-Fi público de una cafetería para trabajar con datos confidenciales de clientes?',
    respuesta: 'Es muy peligroso. Los atacantes pueden interceptar el tráfico de redes públicas fácilmente. Si vas a usarlo, es obligatorio activar la VPN de tu empresa para cifrar todo tu tráfico, bloquear accesos del vecindario de red y asegurar tu sesión.'
  },
  {
    id: 'faq-12',
    categoria: 'Amenazas Reales',
    pregunta: 'Encontré una memoria USB tirada en la entrada de mi local comercial. ¿Puedo revisarla?',
    respuesta: '¡Bajo ninguna circunstancia! Es un ataque de ingeniería social común llamado "Baiting" (Señuelo). Los atacantes dejan USBs infectados con virus automáticos esperando que un empleado curioso lo conecte a la red interna corporativa.'
  },
  {
    id: 'faq-13',
    categoria: 'Dispositivos',
    pregunta: 'El celular corporativo de la empresa se calienta mucho de la nada. ¿Significa espionaje?',
    respuesta: 'Generalmente se debe al GPS activo, brillo alto bajo el sol o apps consumiendo batería en segundo plano. Sin embargo, si se calienta en reposo absoluto e inactivo, y el consumo de datos móviles es inexplicable, conviene hacerle una revisión de seguridad.'
  },
  {
    id: 'faq-14',
    categoria: 'Contraseñas',
    pregunta: '¿El uso de Verificación de Dos Pasos (2FA) realmente bloquea ataques masivos?',
    respuesta: 'Sí, bloquea aproximadamente el 99.9% de los ataques automatizados de hackeo de cuentas corporativas. Incluso si te roban la contraseña, el atacante no podrá ingresar sin el código confidencial de tu aplicación móvil de autenticación.'
  },
  {
    id: 'faq-15',
    categoria: 'Phishing y Correos',
    pregunta: 'Un correo de mi propio jefe me pide comprar tarjetas de regalo o hacer una transferencia rápida. ¿Es sospechoso?',
    respuesta: 'Sí, se conoce como "Fraude del CEO" o "BEC" (Business Email Compromise). El atacante se hace pasar por un alto directivo con urgencia ficticia. Siempre re-confirma por teléfono u otra vía física antes de procesar pagos inusuales.'
  }
];
