const { expect, test } = require("@playwright/test");

test.describe("energy chain learning", () => {
  test("serves the corrected poster on the presentation and the hub", async ({ page }) => {
    await page.goto("/index.html");
    const presentationPoster = page.locator('img[src="images/accueil-technoquest.png?v=3"]');
    await expect(presentationPoster).toBeVisible();
    await expect(presentationPoster).toHaveJSProperty("complete", true);
    expect(await presentationPoster.evaluate(image => image.naturalWidth)).toBeGreaterThan(1000);

    await page.goto("/parcours.html");
    const hubPoster = page.locator('img[src="images/accueil-technoquest.png?v=3"]');
    await expect(hubPoster).toBeVisible();
    expect(await hubPoster.evaluate(image => image.naturalWidth)).toBeGreaterThan(1000);
  });

  test("offers guided, supported and autonomous energy-chain levels", async ({ page }) => {
    await page.goto("/seance-3.html");
    const card = page.locator(".energy-learning-card");
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-energy-level", "guided");
    await expect(card).toContainText("L’Arduino ne fournit jamais l’énergie à la pompe");
    await expect(card).toContainText("Alimentation séparée 12 V DC");
    await expect(card).toContainText("Électrique → mécanique et hydraulique");

    await card.locator('[data-energy-level="supported"]').click();
    await expect(card).toHaveAttribute("data-energy-level", "supported");
    await expect(card.locator("[data-energy-role]")).toHaveCount(4);
    await expect(card.locator(".energy-lane--power")).toContainText("À retrouver");

    const supportedRoles = ["Alimenter", "Distribuer", "Convertir", "Transmettre / agir"];
    for (let index = 0; index < supportedRoles.length; index += 1) {
      await card.locator(`[data-energy-role="${index}"]`).selectOption(supportedRoles[index]);
    }
    await card.locator('[data-energy-action="check"]').click();
    await expect(card.locator(".energy-feedback")).toHaveClass(/is-success/);

    await card.locator('[data-energy-level="autonomous"]').click();
    await expect(card).toHaveAttribute("data-energy-level", "autonomous");
    await expect(card.locator("[data-energy-component]")).toHaveCount(4);
    await expect(card.locator(".energy-lane--power")).toContainText("À reconstruire");

    await card.locator('[data-energy-component="0"]').selectOption("Arduino");
    await card.locator('[data-energy-role="0"]').selectOption("Alimenter");
    await card.locator('[data-energy-action="check"]').click();
    await expect(card.locator(".energy-feedback")).toContainText("Il reste au moins une réponse");

    const components = [
      "Alimentation séparée 12 V DC",
      "Contacts de puissance du relais",
      "Pompe à eau",
      "Tuyau puis sol"
    ];
    for (let index = 0; index < components.length; index += 1) {
      await card.locator(`[data-energy-component="${index}"]`).selectOption(components[index]);
      await card.locator(`[data-energy-role="${index}"]`).selectOption(supportedRoles[index]);
    }
    await card.locator('[data-energy-action="check"]').click();
    await expect(card.locator(".energy-feedback")).toHaveClass(/is-success/);
    await expect(card.locator(".energy-answer.is-correct")).toHaveCount(4);
  });

  test("keeps the learning activity inside a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/seance-3.html");
    const card = page.locator(".energy-learning-card");
    await expect(card).toBeVisible();
    const cardOverflow = await card.evaluate(element => element.scrollWidth - element.clientWidth);
    expect(cardOverflow).toBeLessThanOrEqual(1);
  });
});
