import { test, expect } from 'playwright-test-coverage';

// async function basicInit(page: Page) {
//   let loggedInUser: User | undefined;
//   const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

//   // Authorize login for the given user
//   await page.route('*/**/api/auth', async (route) => {
//     const req = route.request();
//     const method = req.method();
//     if (method === 'POST') {
//       const { name, email, password } = req.postDataJSON();

//       if (validUsers[email]) {
//         await route.fulfill({
//           status: 409,
//           json: { error: 'User already exists' },
//         });
//         return;
//       }
//       const newUser: User = {
//         id: String(Object.keys(validUsers).length + 1),
//         name,
//         email,
//         password,
//         roles: [{ role: Role.Diner }],
//       };
//       validUsers[email] = newUser;
//       loggedInUser = newUser;

//       await route.fulfill({
//         json: {
//           user: {
//             id: newUser.id,
//             name: newUser.name,
//             email: newUser.email,
//             roles: newUser.roles,
//           },
//           token: 'tttttt',
//         },
//       });
//     }
//     if (method === 'PUT') {
//       const loginReq = route.request().postDataJSON();
//       const user = validUsers[loginReq.email];
//       if (!user || user.password !== loginReq.password) {
//         await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
//         return;
//       }
//       loggedInUser = validUsers[loginReq.email];
//       const loginRes = {
//         user: loggedInUser,
//         token: 'abcdef',
//       };
//       expect(route.request().method()).toBe('PUT');
//       await route.fulfill({ json: loginRes });
//     }
//     if (method === 'DELETE') {
//       const authHeader = req.headers()['authorization'];
//       expect(authHeader).toMatch(/^Bearer\s.+/);

//       loggedInUser = undefined;

//       await route.fulfill({
//         json: { message: 'logout successful' },
//       });
//     }
//   });

//   // Return the currently logged in user
//   await page.route('*/**/api/user/me', async (route) => {
//     expect(route.request().method()).toBe('GET');
//     await route.fulfill({ json: loggedInUser });
//   });

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
});