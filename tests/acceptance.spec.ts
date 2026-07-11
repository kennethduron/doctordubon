import { expect, test, type Download, type Locator, type Page } from "@playwright/test";

const testEmail = process.env.TEST_TECH_EMAIL;
const testPassword = process.env.TEST_TECH_PASSWORD;
const hasCredentials = Boolean(testEmail && testPassword);
const automatedIncomeDescription = "Prueba automatizada - ingreso";
const automatedExpenseDescription = "Prueba automatizada - gasto";
const automatedNotes = "Registro creado por prueba automatizada. Puede eliminarse.";

async function assertNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  expect(hasOverflow).toBe(false);
}

async function assertVisibleText(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 20_000 });
}

async function loginAsTechnicalOwner(page: Page) {
  test.skip(!hasCredentials, "Faltan TEST_TECH_EMAIL y TEST_TECH_PASSWORD.");

  await page.goto("/login");
  await page.getByLabel("Correo").fill(testEmail!);
  await page.getByLabel("Contraseña").fill(testPassword!);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForLoadState("networkidle");

  const pageText = await page.locator("body").innerText();
  if (pageText.includes("Verifique su correo") || pageText.includes("correo")) {
    throw new Error("La cuenta inició sesión, pero el correo no aparece verificado. Revisa emailVerified en Firebase Auth.");
  }
  if (pageText.includes("pendiente de aprobación")) {
    throw new Error("La cuenta inició sesión, pero sigue pendiente. Revisa status: active en Firestore.");
  }
  if (pageText.includes("deshabilitada")) {
    throw new Error("La cuenta está deshabilitada. Revisa status del perfil en Firestore.");
  }

  await expect(page.getByRole("heading", { name: "Panel principal" })).toBeVisible({ timeout: 20_000 });
}

async function fillMovementForm(page: Page, input: {
  category: string;
  paymentMethod: string;
  amount: string;
  description: string;
  notes: string;
}) {
  await page.getByLabel("Categoría").selectOption({ label: input.category });
  await page.getByLabel("Método de pago").selectOption({ label: input.paymentMethod });
  await page.getByLabel("Monto").fill(input.amount);
  await page.getByLabel("Descripción").fill(input.description);
  await page.getByLabel("Observaciones").fill(input.notes);
}

async function maybeDownload(page: Page, buttonName: string, expectedExtension: ".pdf" | ".xlsx") {
  const button = page.getByRole("button", { name: buttonName }).first();
  await expect(button).toBeVisible();

  const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
  await button.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(new RegExp(`\\${expectedExtension}$`));
  return download;
}

async function cleanupAutomatedMovements(page: Page) {
  await page.goto("/libro-diario");
  await expect(page.getByRole("heading", { name: "Libro diario" })).toBeVisible({ timeout: 20_000 });

  for (const description of [automatedIncomeDescription, automatedExpenseDescription]) {
    const movement = page.getByText(description).first();
    if (!(await movement.isVisible().catch(() => false))) continue;

    const container = await getMovementContainer(page, movement);
    const deleteButton = container.getByRole("button", { name: "Eliminar" }).first();

    if (!(await deleteButton.isVisible().catch(() => false))) continue;

    await deleteButton.click();
    await page.getByRole("button", { name: "Eliminar" }).last().click();
    await assertVisibleText(page, "Movimiento eliminado correctamente.");
  }
}

async function getMovementContainer(page: Page, movement: Locator) {
  const tableRow = movement.locator("xpath=ancestor::tr[1]");
  if (await tableRow.count()) return tableRow;

  const card = movement.locator("xpath=ancestor::article[1]");
  if (await card.count()) return card;

  return page.locator("body");
}

test.describe("rutas públicas", () => {
  const publicRoutes = ["/", "/health", "/login", "/registro", "/recuperar-contrasena"];

  for (const route of publicRoutes) {
    test(`${route} responde correctamente`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status()).toBeLessThan(400);
    });
  }

  test("pantallas públicas muestran textos principales", async ({ page }) => {
    await page.goto("/");
    await assertVisibleText(page, /Centro Financiero del Consultorio|Iniciar sesión/);

    await page.goto("/health");
    await assertVisibleText(page, "Sistema activo");
    await assertVisibleText(page, "Centro Financiero del Consultorio");

    await page.goto("/login");
    await assertVisibleText(page, "Centro Financiero del Consultorio");
    await assertVisibleText(page, "Dr. Oscar Dubon");
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

    await page.goto("/registro");
    await assertVisibleText(page, "Crear cuenta");
    await assertVisibleText(page, "Centro Financiero del Consultorio");

    await page.goto("/recuperar-contrasena");
    await assertVisibleText(page, "Recuperar contraseña");
    await expect(page.getByRole("button", { name: "Enviar enlace de recuperación" })).toBeVisible();
  });
});

test.describe.serial("aceptación autenticada", () => {
  test("flujo completo del Técnico operativo", async ({ page }) => {
    await loginAsTechnicalOwner(page);

    await assertVisibleText(page, "Ingresos de hoy");
    await assertVisibleText(page, "Gastos de hoy");
    await assertVisibleText(page, "Balance del día");
    await assertVisibleText(page, "Ingresos del mes");
    await assertVisibleText(page, "Gastos del mes");
    await assertVisibleText(page, "Balance del mes");
    await assertVisibleText(page, "Acciones rápidas");

    await page.getByRole("link", { name: "Nuevo ingreso" }).first().click();
    await expect(page.getByRole("heading", { name: "Ingresos" })).toBeVisible();
    await fillMovementForm(page, {
      category: "Consulta médica",
      paymentMethod: "Efectivo",
      amount: "600.00",
      description: automatedIncomeDescription,
      notes: automatedNotes,
    });
    await page.getByRole("button", { name: "Guardar ingreso" }).click();
    await assertVisibleText(page, "Ingreso guardado correctamente.");

    await page.goto("/gastos");
    await expect(page.getByRole("heading", { name: "Gastos" })).toBeVisible();
    await fillMovementForm(page, {
      category: "Insumos médicos",
      paymentMethod: "Transferencia",
      amount: "250.00",
      description: automatedExpenseDescription,
      notes: automatedNotes,
    });
    await page.getByRole("button", { name: "Guardar gasto" }).click();
    await assertVisibleText(page, "Gasto guardado correctamente.");

    try {
      await page.goto("/libro-diario");
      await expect(page.getByRole("heading", { name: "Libro diario" })).toBeVisible();
      await assertVisibleText(page, automatedIncomeDescription);
      await assertVisibleText(page, automatedExpenseDescription);
      await assertVisibleText(page, "Total ingresos");
      await assertVisibleText(page, "Total gastos");
      await assertVisibleText(page, "Balance neto");

      const incomeContainer = await getMovementContainer(page, page.getByText(automatedIncomeDescription).first());
      const editButton = incomeContainer.getByRole("button", { name: "Editar" }).first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.getByLabel("Observaciones").fill("Editado por prueba automatizada.");
        await page.getByRole("button", { name: "Guardar cambios" }).click();
        await assertVisibleText(page, "Movimiento actualizado correctamente.");
      }

      const pdfDownload: Download = await maybeDownload(page, "Exportar PDF", ".pdf");
      expect(pdfDownload.suggestedFilename()).toContain("libro-diario");
      const excelDownload: Download = await maybeDownload(page, "Exportar Excel", ".xlsx");
      expect(excelDownload.suggestedFilename()).toContain("libro-diario");

      await page.goto("/reportes");
      await expect(page.getByRole("heading", { name: "Reportes" })).toBeVisible();
      await page.getByRole("button", { name: "Generar reporte" }).click();
      await assertVisibleText(page, "Total ingresos");
      await assertVisibleText(page, "Total gastos");
      await assertVisibleText(page, "Balance neto");
      await assertVisibleText(page, "Movimientos");
      await assertVisibleText(page, automatedIncomeDescription);
      await assertVisibleText(page, automatedExpenseDescription);

      const reportPdfDownload: Download = await maybeDownload(page, "Exportar PDF", ".pdf");
      expect(reportPdfDownload.suggestedFilename()).toContain("reporte-financiero");
      const reportExcelDownload: Download = await maybeDownload(page, "Exportar Excel", ".xlsx");
      expect(reportExcelDownload.suggestedFilename()).toContain("reporte-financiero");

      await page.goto("/configuracion");
      await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();
      await assertVisibleText(page, "Nombre del consultorio");
      await assertVisibleText(page, "Nombre del doctor");
      await assertVisibleText(page, "URL del sistema");
      await assertVisibleText(page, "https://doctordubon.vercel.app");

      await page.goto("/usuarios");
      await expect(page.getByRole("heading", { name: "Usuarios y permisos" })).toBeVisible();
      await assertVisibleText(page, "Usuarios del consultorio");
      await assertVisibleText(page, "Técnico operativo");
      await assertVisibleText(page, "Dueño operativo");
      await assertVisibleText(page, "Administrador");
      await expect(page.getByText("technical_owner")).toHaveCount(0);

      await assertResponsivePages(page);
    } finally {
      await cleanupAutomatedMovements(page).catch(() => undefined);
    }

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

async function assertResponsivePages(page: Page) {
  const viewports = [
    { name: "desktop", width: 1280, height: 720 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
  ];
  const routes = ["/dashboard", "/ingresos", "/libro-diario", "/reportes"];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);

      if (viewport.name === "mobile") {
        await expect(page.getByRole("button", { name: /Abrir menú/ })).toBeVisible();
      }

      await expect(page.locator("button, a").first()).toBeVisible();
    }
  }
}
