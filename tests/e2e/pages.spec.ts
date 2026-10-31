import { expect, test } from '@playwright/test';

test.describe('serviços', () => {
  test('o índice leva à ficha da prática e o agendamento já escolhe a prática', async ({
    page,
  }) => {
    await page.goto('/servicos/');
    await page
      .getByRole('navigation', { name: 'Práticas nesta página' })
      .getByRole('link', { name: /Reiki/ })
      .click();
    await expect(page).toHaveURL(/#reiki$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Reiki' })).toBeInViewport();

    await page.locator('#reiki').getByRole('link', { name: 'Agendar esta prática' }).click();
    await expect(page).toHaveURL(/\/contato\/\?pratica=reiki$/);
    await expect(page.getByLabel('Prática de interesse')).toHaveValue('reiki');
  });

  test('as perguntas abrem e fecham', async ({ page }) => {
    await page.goto('/en/services/');
    const question = page.getByText('What if I need to cancel?');
    const answer = page.getByText('Just let us know 24 hours in advance');
    await expect(answer).toBeHidden();
    await question.click();
    await expect(answer).toBeVisible();
  });
});

test.describe('formulário de contato (demonstrativo)', () => {
  test('aponta os campos inválidos e leva o foco ao primeiro', async ({ page }) => {
    await page.goto('/contato/');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();

    const name = page.getByLabel('Nome');
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAccessibleDescription('Diga como podemos chamar você.');
    await expect(page.getByRole('alert')).toHaveText(
      'Revise os campos destacados antes de enviar.',
    );

    // o aviso some assim que o campo fica certo
    await name.fill('Ana');
    await expect(name).not.toHaveAttribute('aria-invalid');
  });

  test('confirma sem enviar nada e permite escrever outra mensagem', async ({ page }) => {
    const requests: string[] = [];
    await page.goto('/en/contact/');
    page.on('request', (request) => requests.push(request.url()));

    await page.getByLabel('Name').fill('Ana');
    await page.getByLabel('Email').fill('ana@example.com');
    await page
      .getByRole('textbox', { name: /^Message/ })
      .fill('I would like to try a first session.');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByRole('heading', { name: 'Message ready.' })).toBeVisible();
    expect(requests).toEqual([]);

    await page.getByRole('button', { name: 'Write another message' }).click();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(page.getByLabel('Name')).toBeFocused();
  });
});
