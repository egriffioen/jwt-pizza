import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

test('updateUser username', async ({ page }) => {
  await basicInit(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('updateUser email', async ({ page }) => {
  await basicInit(page);
  let email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('#hs-jwt-modal').getByText('email:')).toBeVisible();
  await page.locator('input[type="email"]').click();
  email = 'newemail@jwt.com'
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText(email);

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText(email);
});

test('updateUser password', async ({ page }) => {
  await basicInit(page);
  let email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('#hs-jwt-modal').getByText('password:')).toBeVisible();
  await page.locator('#password').click();
  await page.locator('#password').fill('123');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('401')).toBeVisible();
});

test('updateUser username as an Admin', async ({ page }) => {
  await basicAdminInit(page);
  const email = 'a@jwt.com'
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'KC' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
  await expect(page.getByText('admin', { exact: true })).toBeVisible();

});


async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const req = route.request();
    const method = req.method();
    if (method === 'POST') {
      const { name, email, password } = req.postDataJSON();

      if (validUsers[email]) {
        await route.fulfill({
          status: 409,
          json: { error: 'User already exists' },
        });
        return;
      }
      const newUser: User = {
        id: String(Object.keys(validUsers).length + 1),
        name,
        email,
        password,
        roles: [{ role: Role.Diner }],
      };
      validUsers[email] = newUser;
      loggedInUser = newUser;

      await route.fulfill({
        json: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            roles: newUser.roles,
          },
          token: 'tttttt',
        },
      });
    }
    if (method === 'PUT') {
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
    }
    if (method === 'DELETE') {
      const authHeader = req.headers()['authorization'];
      expect(authHeader).toMatch(/^Bearer\s.+/);

      loggedInUser = undefined;

      await route.fulfill({
        json: { message: 'logout successful' },
      });
    }
  });

  // Update user
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    const req = route.request();

    if (req.method() !== 'PUT') {
      await route.continue();
      return;
    }

    const authHeader = req.headers()['authorization'];
    expect(authHeader).toMatch(/^Bearer\s.+/);

    if (!loggedInUser) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }

    const updateReq = req.postDataJSON();
    const userId = req.url().split('/').pop();

    if (loggedInUser.id !== userId) {
      await route.fulfill({ status: 403, json: { error: 'Forbidden' } });
      return;
    }

    // Update user in memory
    const updatedUser = {
      ...loggedInUser,
      ...updateReq,
    };

    loggedInUser = updatedUser;
    validUsers[updatedUser.email] = updatedUser;

    await route.fulfill({
      json: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          roles: updatedUser.roles,
        },
        token: 'tttttt',
      },
    });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.goto('/');
}

async function basicAdminInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'a@jwt.com': { id: '3', name: 'Kai Chen', email: 'a@jwt.com', password: 'a', roles: [{ role: Role.Admin }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const req = route.request();
    const method = req.method();
    if (method === 'POST') {
      const { name, email, password } = req.postDataJSON();

      if (validUsers[email]) {
        await route.fulfill({
          status: 409,
          json: { error: 'User already exists' },
        });
        return;
      }
      const newUser: User = {
        id: String(Object.keys(validUsers).length + 1),
        name,
        email,
        password,
        roles: [{ role: Role.Diner }],
      };
      validUsers[email] = newUser;
      loggedInUser = newUser;

      await route.fulfill({
        json: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            roles: newUser.roles,
          },
          token: 'tttttt',
        },
      });
    }
    if (method === 'PUT') {
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
    }
    if (method === 'DELETE') {
      const authHeader = req.headers()['authorization'];
      expect(authHeader).toMatch(/^Bearer\s.+/);

      loggedInUser = undefined;

      await route.fulfill({
        json: { message: 'logout successful' },
      });
    }
  });

  // Update user
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    const req = route.request();

    if (req.method() !== 'PUT') {
      await route.continue();
      return;
    }

    const authHeader = req.headers()['authorization'];
    expect(authHeader).toMatch(/^Bearer\s.+/);

    if (!loggedInUser) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }

    const updateReq = req.postDataJSON();
    const userId = req.url().split('/').pop();

    if (loggedInUser.id !== userId) {
      await route.fulfill({ status: 403, json: { error: 'Forbidden' } });
      return;
    }

    // Update user in memory
    const updatedUser = {
      ...loggedInUser,
      ...updateReq,
    };

    loggedInUser = updatedUser;
    validUsers[updatedUser.email] = updatedUser;

    await route.fulfill({
      json: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          roles: updatedUser.roles,
        },
        token: 'tttttt',
      },
    });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.goto('/');
}



