// Armazena as despesas
let expenses = [];
// Armazena os cartões cadastrados
let cards = [];

// Salva despesas, cartões e renda no LocalStorage
function saveData() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("cards", JSON.stringify(cards));

  const income = parseFloat(document.getElementById("income")?.value) || 0;
  localStorage.setItem("income", income);
}

// Carrega despesas, cartões e renda do LocalStorage
function loadData() {
  const storedExpenses = localStorage.getItem("expenses");
  const storedCards = localStorage.getItem("cards");
  const storedIncome = localStorage.getItem("income");

  expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
  cards = storedCards ? JSON.parse(storedCards) : [];

  if (storedIncome !== null && !isNaN(parseFloat(storedIncome))) {
    document.getElementById("income").value = parseFloat(storedIncome);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Cria popup erro se não existir
  if (!document.getElementById("errorPopup")) createErrorPopup();

  // Carrega dados do localStorage
  loadData();

  // Inicializa interface
  updateCardSelect();
  updateCardsDisplay();
  updateTable();
  updateBalance();
  calcularBonus();

  // Eventos forms e botões
  document.getElementById("expenseForm").addEventListener("submit", handleAddExpense);
  document.getElementById("addCardForm").addEventListener("submit", handleAddCard);
  document.getElementById("saveIncomeBtn").addEventListener("click", handleSaveIncome);
  document.getElementById("exportBtn").addEventListener("click", downloadXLSX);
  document.getElementById("errorPopup").querySelector("button").addEventListener("click", closeErrorPopup);
});

// Adiciona uma despesa
function handleAddExpense(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const priority = document.getElementById("priority").value;
  const cardSelect = document.getElementById("cardSelect").value;

  if (!name || isNaN(amount) || amount <= 0) {
    showErrorPopup("⚠️ Preencha os campos corretamente!");
    return;
  }

  expenses.unshift({ name, amount, priority, card: cardSelect || null });
  saveData();
  updateTable();
  updateBalance();
  calcularBonus();
  event.target.reset();
}

// Atualiza a tabela de despesas na tela
function updateTable() {
  const tableBody = document.getElementById("expenseTable");
  tableBody.innerHTML = "";

  expenses.forEach((expense, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 border-b">${expense.name}</td>
      <td class="p-3 border-b">R$ ${expense.amount.toFixed(2)}</td>
      <td class="p-3 border-b">${expense.priority}</td>
      <td class="p-3 border-b">${expense.card ? expense.card : "Sem cartão"}</td>
      <td class="p-3 border-b">
        <button onclick="removeExpense(${index})" class="text-red-600 hover:text-red-800">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Remove uma despesa pelo índice
function removeExpense(index) {
  expenses.splice(index, 1);
  saveData();
  updateTable();
  updateBalance();
  calcularBonus();
}

// Atualiza os saldos exibidos (total gasto, saldo restante)
function updateBalance() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = income - totalExpense;

  document.getElementById("totalExpense").innerText = totalExpense.toFixed(2);
  const remainingEl = document.getElementById("remainingBalance");
  remainingEl.innerText = remainingBalance.toFixed(2);
  remainingEl.className = remainingBalance < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold";
}

// Calcula e exibe o bônus final (renda - despesas - economia)
function calcularBonus() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const savePercentCheckbox = document.getElementById("savePercent")?.checked || false;

  let economia = 0;
  if (savePercentCheckbox) {
    const percentualEconomia = 0.1;
    economia = income * percentualEconomia;
  }

  const bonusFinal = income - totalExpense - economia;

  let bonusEl = document.getElementById("bonusFinal");
  if (!bonusEl) {
    const carteiraSection = document.getElementById("carteira");
    bonusEl = document.createElement("div");
    bonusEl.id = "bonusFinal";
    bonusEl.className = "mt-4 text-lg font-bold";
    carteiraSection.appendChild(bonusEl);
  }

  bonusEl.innerText = savePercentCheckbox
    ? `Bônus Restante (10% economia): R$ ${bonusFinal.toFixed(2)}`
    : `Bônus Restante: R$ ${bonusFinal.toFixed(2)}`;

  bonusEl.className = bonusFinal < 0
    ? "text-red-600 font-bold mt-4"
    : "text-green-600 font-bold mt-4";
}

// Atualiza o select de cartões no formulário de despesas
function updateCardSelect() {
  const select = document.getElementById("cardSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Sem cartão</option>';

  cards.forEach(card => {
    const option = document.createElement("option");
    option.value = card.name;
    option.textContent = card.name;
    select.appendChild(option);
  });
}

// Manipula o formulário de adicionar cartão
function handleAddCard(event) {
  event.preventDefault();

  const name = document.getElementById("cardName").value.trim();
  const limit = parseFloat(document.getElementById("cardLimit").value);
  const color = document.getElementById("cardColor").value;

  if (!name || isNaN(limit) || limit <= 0) {
    showErrorPopup("⚠️ Preencha os dados do cartão corretamente.");
    return;
  }

  if (cards.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    showErrorPopup("⚠️ Cartão com esse nome já existe.");
    return;
  }

  cards.push({ name, limit, color });
  saveData();
  updateCardsDisplay();
  updateCardSelect();
  event.target.reset();
}

// Atualiza visualização dos cartões adicionados
function updateCardsDisplay() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  cards.forEach((card, i) => {
    const cardEl = document.createElement("div");
    cardEl.className = "rounded-lg p-3 flex items-center gap-3 shadow cursor-default";
    cardEl.style.backgroundColor = card.color;

    cardEl.innerHTML = `
      <div class="flex-1 font-semibold text-white">${card.name}</div>
      <div class="font-mono text-white">Limite: R$ ${card.limit.toFixed(2)}</div>
      <button onclick="removeCard(${i})" class="text-white hover:text-gray-200 font-bold">✕</button>
    `;

    container.appendChild(cardEl);
  });
}

// Remove cartão pelo índice e despesas associadas
function removeCard(index) {
  if (index < 0 || index >= cards.length) return;

  const cardName = cards[index].name; // Guarda o nome do cartão antes de remover
  cards.splice(index, 1);

  // Remove despesas vinculadas a esse cartão
  expenses = expenses.filter(expense => expense.card !== cardName);

  saveData();
  updateCardsDisplay();
  updateCardSelect();
  updateTable();
  updateBalance();
  calcularBonus();
}

// Exibe popup de erro
function showErrorPopup(message) {
  const errorPopup = document.getElementById("errorPopup");
  const errorMessage = document.getElementById("errorMessage");
  if (!errorPopup || !errorMessage) return;

  errorMessage.innerText = message;
  errorPopup.classList.remove("hidden");
}

// Cria dinamicamente o popup de erro no body (chamado só uma vez)
function createErrorPopup() {
  const popup = document.createElement("div");
  popup.id = "errorPopup";
  popup.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50";

  popup.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
      <p id="errorMessage" class="text-red-700 font-semibold mb-4"></p>
      <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="closeErrorPopup()">Fechar</button>
    </div>
  `;

  document.body.appendChild(popup);
}

// Fecha popup de erro
function closeErrorPopup() {
  const errorPopup = document.getElementById("errorPopup");
  if (errorPopup) errorPopup.classList.add("hidden");
}

// Logout: redireciona para Index.html
function logout() {
  window.location.href = "Index.html";
}

// Exporta gastos para XLSX usando SheetJS
function downloadXLSX() {
  if (expenses.length === 0) {
    showErrorPopup("Nenhum gasto registrado para exportação!");
    return;
  }

  alert("Gerando arquivo Excel...");

  const income = parseFloat(document.getElementById("income").value) || 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savePercentCheckbox = document.getElementById("savePercent")?.checked || false;

  let economia = 0;
  if (savePercentCheckbox) {
    economia = income * 0.1;
  }

  const bonusFinal = income - totalExpense - economia;

  // Ajuste no cabeçalho para incluir cartão
  const header = [["Nome", "Valor (R$)", "Prioridade", "Cartão"]];
  const rows = expenses.map(e => [
    e.name,
    e.amount.toFixed(2),
    e.priority,
    e.card || "Sem cartão"
  ]);
  rows.push(["", "", "", ""]);
  if (savePercentCheckbox) {
    rows.push(["Renda Mensal", income.toFixed(2), "", ""]);
    rows.push(["Economia (10%)", economia.toFixed(2), "", ""]);
    rows.push(["Bônus Restante", bonusFinal.toFixed(2), "", ""]);
  } else {
    rows.push(["Renda Mensal", income.toFixed(2), "", ""]);
    rows.push(["Bônus Restante", bonusFinal.toFixed(2), "", ""]);
  }

  const ws = XLSX.utils.aoa_to_sheet(header.concat(rows));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gastos");

  XLSX.writeFile(wb, "gastos.xlsx");
}

// Salva renda informada no input e atualiza
function handleSaveIncome() {
  const incomeInput = document.getElementById("income");
  if (!incomeInput) return;

  const income = parseFloat(incomeInput.value);
  if (isNaN(income) || income < 0) {
    showErrorPopup("Informe um valor válido para a renda.");
    return;
  }
  saveData();
  updateBalance();
  calcularBonus();
}
