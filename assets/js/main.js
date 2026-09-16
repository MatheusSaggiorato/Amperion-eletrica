document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
});

function preencherPotencia() {
  const select = document.getElementById('carga-exemplo');
  const inputPotencia = document.getElementById('potencia-dim');
  const selectTipo = document.getElementById('tipo-circuito');

  if (select.value !== "") {
    inputPotencia.value = select.value;
    const tipoSugerido = select.options[select.selectedIndex].getAttribute('data-tipo');
    if (tipoSugerido) {
      selectTipo.value = tipoSugerido;
    }
  }
}

function calcularDimensionamento() {
  const potencia = parseFloat(document.getElementById('potencia-dim').value);
  const tensao = parseFloat(document.getElementById('tensao-dim').value);
  const metodo = document.getElementById('metodo-inst').value;
  const tipoCircuito = document.getElementById('tipo-circuito').value;
  const resultDiv = document.getElementById('resultado-dim');

  if (isNaN(potencia) || potencia <= 0) {
    alert("Insira uma potência válida maior que zero.");
    return;
  }

  const ampacidade = {
    "B1": [{ bitola: "1.5", iz: 17.5 }, { bitola: "2.5", iz: 24 }, { bitola: "4.0", iz: 32 }, { bitola: "6.0", iz: 41 }, { bitola: "10.0", iz: 57 }, { bitola: "16.0", iz: 76 }],
    "A1": [{ bitola: "1.5", iz: 14.5 }, { bitola: "2.5", iz: 19.5 }, { bitola: "4.0", iz: 26 }, { bitola: "6.0", iz: 34 }, { bitola: "10.0", iz: 46 }, { bitola: "16.0", iz: 61 }],
    "C": [{ bitola: "1.5", iz: 19.5 }, { bitola: "2.5", iz: 27 }, { bitola: "4.0", iz: 36 }, { bitola: "6.0", iz: 46 }, { bitola: "10.0", iz: 63 }, { bitola: "16.0", iz: 85 }]
  };

  const disjuntoresComerciais = [10, 16, 20, 25, 32, 40, 50, 63, 80];
  const ib = potencia / tensao;

  let in_disjuntor = null;
  for (let i = 0; i < disjuntoresComerciais.length; i++) {
    if (disjuntoresComerciais[i] >= ib) {
      in_disjuntor = disjuntoresComerciais[i];
      break;
    }
  }

  const bitolaMinimaNorma = (tipoCircuito === "iluminacao") ? 1.5 : 2.5;

  let bitolaSugerida = null;
  let iz_cabo = null;
  if (in_disjuntor !== null) {
    const tabelaMetodo = ampacidade[metodo];
    for (let j = 0; j < tabelaMetodo.length; j++) {

      if (parseFloat(tabelaMetodo[j].bitola) < bitolaMinimaNorma) {
        continue;
      }

      if (tabelaMetodo[j].iz >= in_disjuntor) {
        bitolaSugerida = tabelaMetodo[j].bitola;
        iz_cabo = tabelaMetodo[j].iz;
        break;
      }
    }
  }

  resultDiv.style.display = "block";

  if (in_disjuntor === null || bitolaSugerida === null) {
    resultDiv.innerHTML = `<strong>Aviso:</strong> A carga de ${potencia}W excede os parâmetros residenciais simples. Requer projeto específico.`;
  } else {
    const ibFormatado = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ib);
    const ibCurtoFormatado = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(ib);
    const bitolaFormatada = bitolaSugerida.replace('.', ',');

    resultDiv.innerHTML = `
            Corrente de Projeto (I<sub>b</sub>): <strong>${ibFormatado} A</strong><br>
            Disjuntor Sugerido (I<sub>n</sub>): <strong>${in_disjuntor} A</strong><br>
            Cabo Sugerido (I<sub>z</sub>): <strong>${bitolaFormatada} mm²</strong> (${iz_cabo} A)<br><br>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
            Validação NBR 5410: I<sub>b</sub> (${ibCurtoFormatado} A) &le; I<sub>n</sub> (${in_disjuntor} A) &le; I<sub>z</sub> (${iz_cabo} A)</span>
        `;
  }
}

function calcularConsumo() {
  const potencia = parseFloat(document.getElementById('potencia-cons').value);
  const minutos = parseFloat(document.getElementById('tempo-uso').value);
  const tarifa = parseFloat(document.getElementById('tarifa-kwh').value);
  const resultDiv = document.getElementById('resultado-cons');

  if (isNaN(potencia) || isNaN(minutos) || isNaN(tarifa) || potencia <= 0 || minutos <= 0) {
    alert("Preencha todos os campos com valores maiores que zero.");
    return;
  }

  const tempoHoras = minutos / 60;
  const potenciaKw = potencia / 1000;
  const consumoKwh = potenciaKw * tempoHoras;
  const custoTotal = consumoKwh * tarifa;

  const consumoFormatado = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(consumoKwh);
  const custoFormatado = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(custoTotal);

  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
        Energia Consumida: <strong>${consumoFormatado} kWh</strong><br>
        Custo Total: <strong>R$ ${custoFormatado}</strong>
    `;
}