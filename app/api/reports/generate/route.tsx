import { type NextRequest, NextResponse } from "next/server"
import { getClients, getObjects, getTransactions } from "@/lib/db-helpers"
import { formatPriceDetailed } from "@/lib/format"

export async function GET(request: NextRequest) {
  try {
    const [clients, objects, transactions] = await Promise.all([getClients(), getObjects(), getTransactions()])

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)

    const soldObjects = objects.filter((o) => o.status === "sold")
    const availableObjects = objects.filter((o) => o.status === "available")

    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчет CRM Liana - ${new Date().toLocaleDateString("ru-RU")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }
    .stat-card.income { border-left-color: #10b981; }
    .stat-card.expense { border-left-color: #ef4444; }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
    }
    h2 {
      color: #1a1a1a;
      margin: 40px 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
      font-size: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #374151;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tr:hover {
      background: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Отчет CRM Liana</h1>
    <p class="subtitle">Сгенерирован: ${new Date().toLocaleString("ru-RU")}</p>

    <div class="stats-grid">
      <div class="stat-card income">
        <div class="stat-label">Доходы</div>
        <div class="stat-value">${formatPriceDetailed(totalIncome)} ₴</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-label">Расходы</div>
        <div class="stat-value">${formatPriceDetailed(totalExpense)} ₴</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Прибыль</div>
        <div class="stat-value">${formatPriceDetailed(totalIncome - totalExpense)} ₴</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Всего клиентов</div>
        <div class="stat-value">${clients.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Сданных объектов</div>
        <div class="stat-value">${soldObjects.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Свободных объектов</div>
        <div class="stat-value">${availableObjects.length}</div>
      </div>
    </div>

    <h2>Финансовые транзакции</h2>
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Тип</th>
          <th>Сумма</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
        ${transactions
          .slice(0, 50)
          .map(
            (t) => `
          <tr>
            <td>${new Date(t.transaction_date).toLocaleDateString("ru-RU")}</td>
            <td><span class="badge ${t.type === "income" ? "badge-success" : "badge-warning"}">${t.type === "income" ? "Доход" : "Расход"}</span></td>
            <td>${formatPriceDetailed(Number(t.amount))} ₴</td>
            <td>${t.description || "—"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <h2>Все клиенты (${clients.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>ФИО</th>
          <th>Телефон</th>
          <th>Статус звонка</th>
          <th>Дата добавления</th>
          <th>Примечание</th>
        </tr>
      </thead>
      <tbody>
        ${clients
          .map(
            (c) => `
          <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td><span class="badge ${c.call_status === "called" ? "badge-success" : "badge-info"}">${c.call_status === "called" ? "Дозвонились" : "Не звонили"}</span></td>
            <td>${new Date(c.date_added).toLocaleDateString("ru-RU")}</td>
            <td>${c.notes || c.call_notes || "—"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <h2>Объекты недвижимости (${objects.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Адрес</th>
          <th>Статус</th>
          <th>Цена</th>
          <th>Площадь</th>
          <th>Комнаты</th>
        </tr>
      </thead>
      <tbody>
        ${objects
          .map(
            (o) => `
          <tr>
            <td>${o.id}</td>
            <td>${o.address}</td>
            <td><span class="badge ${o.status === "sold" ? "badge-warning" : "badge-success"}">${o.status === "sold" ? "Сдана" : o.status === "has_candidates" ? "Претенденты" : "Свободна"}</span></td>
            <td>${formatPriceDetailed(Number(o.price))} ₴</td>
            <td>${o.area} м²</td>
            <td>${o.rooms || "—"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="footer">
      <p>CRM Liana - Профессиональная система управления недвижимостью</p>
      <p>Этот отчет был автоматически сгенерирован системой</p>
    </div>
  </div>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="liana-report-${new Date().toISOString().split("T")[0]}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Generate report error:", error)
    return NextResponse.json({ error: "Ошибка генерации отчета" }, { status: 500 })
  }
}
