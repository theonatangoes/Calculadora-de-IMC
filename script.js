const inputAltura = document.getElementById('altura');
const inputPeso = document.getElementById('peso');
const botaoCalcular = document.getElementById('calcular');
const elementoResultado = document.getElementById('resultado');

botaoCalcular.addEventListener('click', calcularIMC); // <-- AQUI

function calcularIMC() {
  const altura = parseFloat(inputAltura.value);
  const peso = parseFloat(inputPeso.value);

  if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
    elementoResultado.style.color = '#ff6600'; 
    elementoResultado.textContent = 'Por favor, insira valores válidos.';
    return; 
  }

  const imc = peso / (altura * altura);
  const imcFormatado = imc.toFixed(2);

  let classificacao = '';

  if (imc < 18.5) classificacao = 'Abaixo do peso';
  else if (imc < 25) classificacao = 'Peso normal';
  else if (imc < 30) classificacao = 'Sobrepeso';
  else if (imc < 35) classificacao = 'Obesidade Grau I';
  else if (imc < 40) classificacao = 'Obesidade Grau II';
  else classificacao = 'Obesidade Grau III';

  elementoResultado.style.color = '#0077ff';
  elementoResultado.textContent = `Seu IMC é ${imcFormatado} (${classificacao})`;
}

elementoResultado.classList.remove('resultado-animado'); 
void elementoResultado.offsetWidth; 
elementoResultado.classList.add('resultado-animado');
