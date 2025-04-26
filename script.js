let expenses = [];

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("expenseForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const priority = document.getElementById("priority").value;

    if (!name || isNaN(amount) || amount <= 0) {
      alert("Preencha os campos corretamente.");
      return;
    }

    expenses.unshift({ name, amount, priority }); // Adiciona ao início do array
    updateTable();
    updateBalance();
    this.reset();
  });
});

function updateTable() {
  const tableBody = document.getElementById("expenseTable");
  tableBody.innerHTML = ""; // Limpa a tabela antes de adicionar novos itens

  expenses.forEach((expense, index) => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td class="p-3 border-b">${expense.name}</td>
      <td class="p-3 border-b">R$ ${expense.amount.toFixed(2)}</td>
      <td class="p-3 border-b">${expense.priority}</td>
      <td class="p-3 border-b"><button onclick="removeExpense(${index})" class="text-red-600 hover:text-red-800">Excluir</button></td>
    `;

    tableBody.appendChild(row);
  });
}

function removeExpense(index) {
  expenses.splice(index, 1);
  updateTable();
  updateBalance();
}

function updateBalance() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = income - totalExpense;

  document.getElementById("totalExpense").innerText = totalExpense.toFixed(2);
  document.getElementById("remainingBalance").innerText = remainingBalance.toFixed(2);
  document.getElementById("remainingBalance").className = remainingBalance < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold";
}

// Função para calcular o bônus no final do mês
function calcularBonus() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Define um percentual de economia (por exemplo, 10%)
  const percentualEconomia = 0.1;
  const economia = income * percentualEconomia;

  const bonusFinal = income - totalExpense - economia;

  document.getElementById("bonusFinal").innerText = `R$ ${bonusFinal.toFixed(2)}`;
  document.getElementById("bonusFinal").className = bonusFinal < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold";
}

function logout() {
  window.location.href = "Index.html";
}

function downloadXLSX() {
  if (expenses.length === 0) {
      showErrorPopup("Nenhum gasto registrado para exportação!");
      return;
  }

  // Exibe o popup antes do download
  const downloadPopup = document.getElementById("downloadPopup");
  downloadPopup.classList.remove("hidden");

  setTimeout(() => {
      // Obtém os valores de renda e calcula o bônus
      const income = parseFloat(document.getElementById("income").value) || 0;
      const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentualEconomia = 0.1; 
      const economia = income * percentualEconomia;
      const bonusFinal = income - totalExpense - economia;

      const header = [["Nome", "Valor (R$)", "Prioridade"]];
      const rows = expenses.map(expense => [expense.name, expense.amount.toFixed(2), expense.priority]);
      rows.push(["", "", ""]);
      rows.push(["Bônus Restante", `R$ ${bonusFinal.toFixed(2)}`, ""]);

      const worksheet = XLSX.utils.aoa_to_sheet([...header, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

      XLSX.writeFile(workbook, "gastos.xlsx");

      // Oculta o popup após o download
      setTimeout(() => {
          downloadPopup.classList.add("hidden");
      }, 2000);
  }, 1500);
}

function calcularBonus() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Percentual opcional de economia (por exemplo, 10% da renda)
  const percentualEconomia = 0.1; // 10% de economia
  const economia = income * percentualEconomia;

  const bonusFinal = income - totalExpense - economia;

  // Exibe o resultado na tela
  document.getElementById("bonusFinal").innerText = `R$ ${bonusFinal.toFixed(2)}`;
  document.getElementById("bonusFinal").className = bonusFinal < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold";
}
function showErrorPopup(message) {
  const errorPopup = document.getElementById("errorPopup");
  document.getElementById("errorMessage").innerText = message;
  errorPopup.classList.remove("hidden");
}

function closeErrorPopup() {
  document.getElementById("errorPopup").classList.add("hidden");
}
document.getElementById("expenseForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const priority = document.getElementById("priority").value;

  if (!name || isNaN(amount) || amount <= 0) {
      showErrorPopup("⚠️ Preencha os campos corretamente!");
      return;
  }

  expenses.unshift({ name, amount, priority });
  updateTable();
  updateBalance();
  this.reset();
});



function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Título principal do documento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Heurísticas de Nielsen Aplicadas - Save Money", 10, 20);

  // Subtítulo
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.text("Validação de UX para Melhor Usabilidade", 10, 30);

  // Conteúdo das heurísticas
  const heuristics = [
      {
          title: "1 Visibilidade do status do sistema",
          description: "O sistema mantém o usuário informado sobre o estado atual através de mensagens de status, como a confirmação de login e atualização de saldo. Isso evita que o usuário se sinta perdido ou inseguro ao navegar."
      },
      {
          title: "2 Correspondência entre o sistema e o mundo real",
          description: "Os termos usados nos botões e placeholders são familiares ao usuário, como 'Adicionar Gasto' e 'Renda Líquida'. Além disso, a interface simula processos financeiros reais, facilitando sua compreensão."
      },
      {
          title: "3 Controle e liberdade para o usuário",
          description: "O sistema permite que o usuário exclua gastos adicionados e saia da plataforma com um botão de 'Logout'. Isso garante maior liberdade de ação sem riscos de comprometimento inesperado."
      },
      {
          title: "4 Consistência e padrões",
          description: "Toda a interface segue um padrão visual coerente utilizando Tailwind CSS, garantindo uma navegação fluida e intuitiva entre os elementos do sistema."
      },
      {
          title: "5 Prevenção de erros",
          description: "Quando o usuário tenta inserir valores inválidos, o sistema exibe alertas estilizados evitando erros comuns e garantindo que os dados sejam inseridos corretamente."
      },
      {
          title: "6 Reconhecimento em vez de lembrança",
          description: "As opções de prioridade são apresentadas em um menu suspenso, evitando que o usuário precise lembrar os valores disponíveis e tornando a interação mais eficiente."
      },
      {
          title: "7 Flexibilidade e eficiência de uso",
          description: "O sistema permite exportação de dados para Excel, melhorando a produtividade de usuários avançados que desejam analisar seus gastos fora da aplicação."
      },
      {
          title: "8 Estética e design minimalista",
          description: "A interface tem um design limpo e intuitivo, evitando informações desnecessárias e focando na funcionalidade central de controle financeiro."
      },
      {
          title: "9 Ajuda e documentação",
          description: "O sistema inclui tooltips explicativos que auxiliam os usuários a entenderem melhor certas funções, garantindo uma experiência mais informada."
      },
      {
          title: "10 Diagnóstico e recuperação de erros",
          description: "Mensagens de erro são apresentadas de forma clara, explicando o que deu errado e sugerindo ações para corrigir o problema."
      }
  ];

  // Adicionando heurísticas ao PDF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  let yPosition = 40;

  heuristics.forEach((heuristic) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(heuristic.title, 10, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(heuristic.description, 10, yPosition, { maxWidth: 180 });
      yPosition += 15;
  });

  // Baixar o arquivo PDF
  doc.save("Heuristicas_SaveMoney.pdf");
}
