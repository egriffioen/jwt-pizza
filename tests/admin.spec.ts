import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'a@jwt.com': { id: '3', name: 'Kai Chen', email: 'a@jwt.com', password: 'a', roles: [{ role: Role.Admin }] } };
type Franchise = {
  id: number;
  name: string;
  admins: { id: number; email: string; name: string }[];
  stores: { id: number; name: string }[];
};

let franchises: Franchise[] = [
  {
    id: 2,
    name: 'LotaPizza',
    admins: [
      { id: 3, email: 'a@jwt.com', name: 'Kai Chen' }, // 👈 admin owns this
    ],
    stores: [
      { id: 4, name: 'Lehi' },
      { id: 5, name: 'Springville' },
    ],
  },
];
  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const req = route.request();
    const method = req.method();
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

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
    await page.route(/\/api\/franchise\/\d+\/store\/\d+(\?.*)?$/,async (route) => {
        const req = route.request();
        expect(req.method()).toBe('DELETE');

        const authHeader = req.headers()['authorization'];
        expect(authHeader).toMatch(/^Bearer\s.+/);

        const url = new URL(req.url());
        const match = url.pathname.match(/\/api\/franchise\/(\d+)\/store\/(\d+)/);

        expect(match).not.toBeNull();

        const franchiseId = Number(match![1]);
        const storeId = Number(match![2]);

        expect(franchiseId).toBeGreaterThan(0);
        expect(storeId).toBeGreaterThan(0);

        const franchise = franchises.find(f => f.id === franchiseId);
        expect(franchise).toBeDefined();

        franchise!.stores = franchise!.stores.filter(s => s.id !== storeId);

        await route.fulfill({
        json: { message: 'store deleted' },
        });
    });

  await page.route(/\/api\/franchise(\/\d+)?(\?.*)?$/, async (route) => {
    const req = route.request();
    const method = req.method();
    if (method==='GET') {
        const franchiseRes = franchises //{
        //   franchises: [
        //     {
        //       id: 2,
        //       name: 'LotaPizza',
        //       stores: [
        //         { id: 4, name: 'Lehi' },
        //         { id: 5, name: 'Springville' },
        //         { id: 6, name: 'American Fork' },
        //       ],
        //     },
        //     { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        //     { id: 4, name: 'topSpot', stores: [] },
        //   ],
        // };
        const visibleFranchises = franchises.filter(f =>
            f.admins.some(a => a.email === loggedInUser?.email)
        );

        await route.fulfill({
            json: { franchises: visibleFranchises },
        });
        expect(route.request().method()).toBe('GET');
        //await route.fulfill({ json: {franchises} });
    }
    if (method === 'DELETE') {
        const authHeader = req.headers()['authorization'];
        expect(authHeader).toMatch(/^Bearer\s.+/);

        const url = new URL(req.url());
        const match = url.pathname.match(/\/api\/franchise\/(\d+)/);
        expect(match).not.toBeNull();

        const franchiseId = Number(match![1]);
        franchises = franchises.filter(f => f.id !== franchiseId);
        expect(franchiseId).toBeGreaterThan(0);

        await route.fulfill({
            json: { message: 'franchise deleted' },
        });
    }
    if(method==='POST') {
        const authHeader = req.headers()['authorization'];
        expect(authHeader).toMatch(/^Bearer\s.+/);

        const { name, admins } = req.postDataJSON();

        const newFranchise: Franchise = {
            id: franchises.length + 10,
            name,
            admins: admins.map((a: { email: string }, i: number) => ({
            id: i + 100,
            email: a.email,
            name: 'pizza franchisee',
            })),
            stores: [],
        };

        franchises.push(newFranchise);

        await route.fulfill({
            json: newFranchise,
        });
    }
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
      const req = route.request();
      const method = req.method();

      if (method === 'GET') {
        const authHeader = req.headers()['authorization'];
        expect(authHeader).toMatch(/^Bearer\s.+/);

        await route.fulfill({
          json: {
            dinerId: 4,
            orders: [
              {
                id: 1,
                franchiseId: 1,
                storeId: 1,
                date: '2024-06-05T05:14:40.000Z',
                items: [
                  {
                    id: 1,
                    menuId: 1,
                    description: 'Veggie',
                    price: 0.05,
                  },
                ],
              },
            ],
            page: 1,
          },
        });
      }

      if (method === 'POST') {
        const orderReq = route.request().postDataJSON();
        const orderRes = {
          order: { ...orderReq, id: 23 },
          jwt: 'eyJpYXQ',
        };
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: orderRes });
    }});

  await page.goto('/');
}

test('login admin', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page.getByText('Your pizza kitchen')).toBeVisible();
  await expect(page.getByText('name:')).toBeVisible();
  await expect(page.getByText('email:')).toBeVisible();
  await expect(page.getByText('admin', { exact: true })).toBeVisible();

});


test('admin page', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText('homeadmin-dashboard')).toBeVisible();
  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();

});

test('create franchise', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('pizza franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
  await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
  await expect(page.getByText('homeadmin-dashboardcreate-')).toBeVisible();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
});

test('delete franchise', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('row', { name: 'LotaPizza Kai Chen Close' }).getByRole('button').click();
  await expect(page.getByText('Sorry to see you go')).toBeVisible();
  await expect(page.getByText('homeadmin-dashboardclose-')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
  await expect(page.getByText('homeadmin-dashboard')).toBeVisible();
});

test('delete store', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();

  await page.getByRole('row', { name: 'Lehi ₿ Close' }).getByRole('button').click();
  await expect(page.getByText('Sorry to see you go')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

});