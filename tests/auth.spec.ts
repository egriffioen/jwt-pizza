//import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

// test('test', async ({ page }) => {
//   await page.goto('http://localhost:5173/');

//   await page.getByRole('link', { name: 'Register' }).click();
//   await page.getByRole('textbox', { name: 'Full name' }).fill('bob');
//   await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
//   await page.getByRole('textbox', { name: 'Password' }).fill('monkey');
//   await page.getByRole('button', { name: 'Register' }).click();
// });

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('register a user', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Ella');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('ellagriffioen@test.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByText('The web\'s best pizza', { exact: true }).click();
  await page.getByText('JWT Pizza', { exact: true }).click();
});

test('login', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('ellagriffioen@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'E', exact: true }).click();
  await page.getByText('Your pizza kitchen').click();
  await page.getByRole('img', { name: 'Employee stock photo' }).click();
  await page.getByText('Ella', { exact: true }).click();
  await page.getByText('ellagriffioen@test.com').click();
  await page.getByText('diner', { exact: true }).click();
});

test('login using mock', async ({ page }) => {
  await page.goto('/');
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });
}