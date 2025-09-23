function addInput(listId, name = "", value = "") {
    const list = document.getElementById(listId);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
        <input type="text" placeholder="Название" value="${name}" oninput="saveData()">
        <input type="number" placeholder="Сумма" value="${value}" oninput="saveData()">
        <button onclick="this.parentElement.remove(); saveData()">✖</button>
      `;
    list.appendChild(row);
    saveData();
}

function getItems(listId) {
    const rows = document.querySelectorAll(`#${listId} .row`);
    return Array.from(rows).map(row => {
        const [nameInput, valueInput] = row.querySelectorAll("input");
        return { name: nameInput.value, value: parseFloat(valueInput.value) || 0 };
    });
}

function sumItems(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
}

function calculate() {
    const incomes = getItems('income-list');
    const expenses = getItems('expenses-list');

    const income = sumItems(incomes);
    const expense = sumItems(expenses);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    let days = 0;
    let perDay = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (days > 0 && balance > 0) {
            perDay = (balance / days).toFixed(2);
        }
    }

    let message = "";
    if (balance > 0) {
        message = `✅ Отлично! У тебя остаётся ${balance}₽ (${savingsRate}% дохода).`;
    } else if (balance === 0) {
        message = "😐 Ты живёшь в ноль, ничего не откладываешь.";
    } else {
        message = `⚠️ Расходы превышают доходы на ${Math.abs(balance)}₽. Нужно пересмотреть бюджет!`;
    }

    const html = `
        <p><b>Доходы:</b> ${income}₽</p>
        ${incomes.length ? `<ul>${incomes.map(i => `<li>${i.name || "Без названия"}: ${i.value}₽</li>`).join("")}</ul>` : ""}
        <p><b>Расходы:</b> ${expense}₽</p>
        ${expenses.length ? `<ul>${expenses.map(e => `<li>${e.name || "Без названия"}: ${e.value}₽</li>`).join("")}</ul>` : ""}
        <p><b>Баланс:</b> ${balance}₽</p>
        ${days > 0 ? `<p><b>Период:</b> ${days} дн.</p>` : ""}
        ${perDay > 0 ? `<p><b>Можно тратить в день:</b> ${perDay}₽</p>` : ""}
        <p>${message}</p>
      `;

    document.getElementById('result').innerHTML = html;

    // сохраняем расчет
    saveData(html);
}

function saveData(resultHtml = null) {
    const data = {
        incomes: getItems('income-list'),
        expenses: getItems('expenses-list'),
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        lastResult: resultHtml || document.getElementById('result').innerHTML
    };
    localStorage.setItem('financeData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('financeData');
    if (saved) {
        const data = JSON.parse(saved);
        data.incomes.forEach(item => addInput('income-list', item.name, item.value));
        data.expenses.forEach(item => addInput('expenses-list', item.name, item.value));
        if (data.startDate) document.getElementById('start-date').value = data.startDate;
        if (data.endDate) document.getElementById('end-date').value = data.endDate;
        if (data.lastResult) document.getElementById('result').innerHTML = data.lastResult;
    } else {
        addInput('income-list');
        addInput('expenses-list');
    }
}

window.onload = loadData;