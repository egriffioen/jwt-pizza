//import { test, expect } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

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