document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. CONFIGURAÇÃO DO WEBGL (SHADER FUNDO)
  // ==========================================
  const canvas = document.getElementById("shader-canvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL não suportado");
  } else {
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Vertex Shader
    const vertexShaderSource = `
            attribute vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

    // Fragment Shader (EFEITO NEON/FUMAÇA)
    const fragmentShaderSource = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uResolution;

            float random(in vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise(in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            float fbm(in vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / uResolution.xy;
                st.x *= uResolution.x / uResolution.y;

                vec3 color1 = vec3(0.0, 0.0, 0.0); 
                vec3 color2 = vec3(0.0, 0.48, 1.0); 

                vec2 q = vec2(0.);
                q.x = fbm(st + 0.1 * uTime);
                q.y = fbm(st + vec2(1.0));

                vec2 r = vec2(0.);
                r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
                r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

                float f = fbm(st + r);
                float sharp = pow(f, 3.0); 
                
                vec3 color = mix(color1, color2, clamp(sharp * 1.8, 0.0, 1.0));

                float dist = distance(gl_FragCoord.xy / uResolution.xy, vec2(0.5));
                color *= 1.0 - dist * 0.8;

                gl_FragColor = vec4(color, 1.0);
            }
        `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const positionLocation = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const timeLocation = gl.getUniformLocation(program, "uTime");
      const resolutionLocation = gl.getUniformLocation(program, "uResolution");

      function render(time) {
        time *= 0.001;
        gl.uniform1f(timeLocation, time);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    }
  }

  // ==========================================
  // 2. LÓGICA DA CALCULADORA IMC
  // ==========================================
  const btnImc = document.getElementById("calcular-imc");

  function calcularIMC() {
    // Seletores específicos do container IMC
    const alturaInput = document.getElementById("altura");
    const pesoInput = document.getElementById("peso");
    const resultContainer = alturaInput
      .closest(".container")
      .querySelector(".result-container");
    const resultadoDiv = document.getElementById("resultado-imc");
    const classDiv = document.getElementById("classification-imc");

    const altura = parseFloat(alturaInput.value);
    const peso = parseFloat(pesoInput.value);

    if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
      alert("Por favor, preencha altura e peso corretamente.");
      return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";
    let corTexto = "";

    if (imc < 18.5) {
      classificacao = "Abaixo do peso";
      corTexto = "#4a9fff";
    } else if (imc < 25) {
      classificacao = "Peso ideal";
      corTexto = "#007bff";
    } else if (imc < 30) {
      classificacao = "Sobrepeso";
      corTexto = "#ffcc00";
    } else if (imc < 35) {
      classificacao = "Obesidade Grau I";
      corTexto = "#ff8800";
    } else if (imc < 40) {
      classificacao = "Obesidade Grau II";
      corTexto = "#ff4444";
    } else {
      classificacao = "Obesidade Grau III";
      corTexto = "#ff0000";
    }

    resultadoDiv.innerHTML = `IMC: <span style="color:${corTexto}; text-shadow: 0 0 10px ${corTexto}40">${imc.toFixed(
      2
    )}</span>`;
    classDiv.textContent = classificacao;
    classDiv.style.color = corTexto;

    // Animação de aparecer
    resultContainer.classList.remove("show");
    void resultContainer.offsetWidth; // Trigger reflow
    resultContainer.classList.add("show");
  }

  if (btnImc) btnImc.addEventListener("click", calcularIMC);

  // ==========================================
  // 3. LÓGICA DA CALCULADORA TMB (NOVO)
  // ==========================================
  const btnTmb = document.getElementById("calcular-tmb");

  function calcularTMB() {
    const genero = document.getElementById("tmb-genero").value;
    const idade = parseInt(document.getElementById("tmb-idade").value);
    const altura = parseFloat(document.getElementById("tmb-altura").value);
    const peso = parseFloat(document.getElementById("tmb-peso").value);
    const atividade = document.getElementById("tmb-atividade").value;

    const resultContainer = document
      .getElementById("tmb-genero")
      .closest(".container")
      .querySelector(".result-container");
    const resBasal = document.getElementById("resultado-tmb-basal");
    const resNdc = document.getElementById("resultado-tmb-ndc");
    const dicaDiet = document.getElementById("dica-diet");

    if (
      isNaN(idade) ||
      isNaN(altura) ||
      isNaN(peso) ||
      idade <= 0 ||
      altura <= 0 ||
      peso <= 0
    ) {
      alert("Por favor, preencha todos os dados da TMB corretamente.");
      return;
    }

    // Fórmula de Harris-Benedict
    // Masculino: 66.5 + (13.75 * kg) + (5.003 * cm) - (6.75 * anos)
    // Feminino: 655.1 + (9.563 * kg) + (1.85 * cm) - (4.676 * anos)

    const alturaCm = altura * 100; // Converter metros para cm
    let tmb = 0;

    if (genero === "masculino") {
      tmb = 66.5 + 13.75 * peso + 5.003 * alturaCm - 6.75 * idade;
    } else {
      tmb = 655.1 + 9.563 * peso + 1.85 * alturaCm - 4.676 * idade;
    }

    // Fatores de Atividade
    let fatorAtividade = 1.2; // Sedentário
    if (atividade === "moderado") fatorAtividade = 1.55;
    if (atividade === "intenso") fatorAtividade = 1.725;

    const ndc = tmb * fatorAtividade;
    const perdaPeso = ndc - 500; // Déficit sugerido na imagem

    // Exibir Resultados
    resBasal.innerHTML = `Basal (Repouso): <strong>${Math.round(
      tmb
    )} kcal</strong>`;
    resNdc.innerHTML = `Para manter o peso: <strong>${Math.round(
      ndc
    )} kcal</strong>`;

    dicaDiet.innerHTML = `
            <span style="color: #a0a0a0; font-size: 0.9rem;">Para perder peso (Déficit):</span><br>
            <span style="color: #007bff; font-weight: bold;">~${Math.round(
              perdaPeso
            )} kcal/dia</span>
        `;

    // Animação
    resultContainer.classList.remove("show");
    void resultContainer.offsetWidth;
    resultContainer.classList.add("show");
  }

  if (btnTmb) btnTmb.addEventListener("click", calcularTMB);

  // Tecla Enter para disparar o cálculo (dependendo de onde está o foco)
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      // Se o foco estiver dentro da caixa IMC
      if (
        document.activeElement.closest(".container") &&
        document.activeElement
          .closest(".container")
          .querySelector("#calcular-imc")
      ) {
        calcularIMC();
      }
      // Se o foco estiver dentro da caixa TMB
      else if (
        document.activeElement.closest(".container") &&
        document.activeElement
          .closest(".container")
          .querySelector("#calcular-tmb")
      ) {
        calcularTMB();
      }
    }
  });
});
