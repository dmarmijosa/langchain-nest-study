// test-stream.js
async function testStream() {
  console.log('🚀 Conectando al servidor...');

  try {
    const response = await fetch('http://localhost:3000/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Cuenta del 1 al 5' }), // Mensaje de prueba
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    if (!response.body) {
      console.error('❌ No llegó body en la respuesta');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log('👀 Escuchando datos...\n');

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('\n✅ Stream finalizado.');
        break;
      }
      // Imprimimos TAL CUAL llega del servidor
      const text = decoder.decode(value);
      process.stdout.write(text);
    }
  } catch (error) {
    console.error('🔥 Error fatal:', error);
  }
}

testStream();
