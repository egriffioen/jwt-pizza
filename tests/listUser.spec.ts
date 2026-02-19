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
      { id: 3, email: 'a@jwt.com', name: 'Kai Chen' },
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

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
      const req = route.request();
      console.log('REQUEST URL:', req.url());
    expect(req.method()).toBe('GET');

    const authHeader = req.headers()['authorization'];
    expect(authHeader).toMatch(/^Bearer\s.+/);

    const url = new URL(req.url());
    const match = url.pathname.match(/\/api\/franchise\/(\d+)/);
    expect(match).not.toBeNull();

    const userId = Number(match![1]);
    if (loggedInUser &&(Number(loggedInUser.id) === userId ||loggedInUser.roles?.some(r => r.role === Role.Admin))) {
        const userFranchises = franchises.filter(f =>
        f.admins.some(a => a.email === loggedInUser?.email)
        );

        await route.fulfill({json: userFranchises});
    }
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
    await page.route(/\/api\/franchise\/\d+(\?.*)?$/, async (route) => {
        const req = route.request();
        if (req.method() !== 'DELETE') {
            return route.fallback();
        }

        const authHeader = req.headers()['authorization'];
        expect(authHeader).toMatch(/^Bearer\s.+/);

        const url = new URL(req.url());
        const match = url.pathname.match(/\/api\/franchise\/(\d+)/);
        expect(match).not.toBeNull();

        const franchiseId = Number(match![1]);

        franchises = franchises.filter(f => f.id !== franchiseId);

        await route.fulfill({
            json: { message: 'franchise deleted' },
        });
    });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
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

  await page.route(/\/api\/franchise\/\d+\/store(\?.*)?$/, async (route) => {
    const req = route.request();
    expect(req.method()).toBe('POST');

    const authHeader = req.headers()['authorization'];
    expect(authHeader).toMatch(/^Bearer\s.+/);

    const url = new URL(req.url());
    const match = url.pathname.match(/\/api\/franchise\/(\d+)\/store/);
    expect(match).not.toBeNull();

    const franchiseId = Number(match![1]);
    expect(franchiseId).toBeGreaterThan(0);

    const franchise = franchises.find(f => f.id === franchiseId);
    expect(franchise).toBeDefined();

    // mimic backend permission logic
    const isAdmin = loggedInUser?.roles?.some(r => r.role === Role.Admin);
    const isFranchiseAdmin = franchise!.admins.some(a => a.email === loggedInUser?.email);

    expect(isAdmin || isFranchiseAdmin).toBeTruthy();

    const body = req.postDataJSON();

    const newStore = {
        id: franchise!.stores.length + 100,
        name: body.name,
    };

    franchise!.stores.push(newStore);

    await route.fulfill({
        json: newStore,
    });
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

    await page.route(/\/api\/user(\?.*)?$/, async (route) => {
      const req = route.request();
      expect(req.method()).toBe('GET');

      const authHeader = req.headers()['authorization'];
      expect(authHeader).toMatch(/^Bearer\s.+/);

      const url = new URL(req.url());
      const pageParam = Number(url.searchParams.get('page') ?? 0);
      //const limitParam = Number(url.searchParams.get('limit') ?? 2);
      const limitParam = 2;
      const nameFilter = url.searchParams.get('name') ?? '*';

      const allUsers = [
        { id: '3', name: 'Kai Chen', email: 'a@jwt.com', roles: [{ role: Role.Admin }] },
        { id: '4', name: 'Nathan Hacking', email: 'n@jwt.com', roles: [{ role: Role.Admin }] },
        { id: '5', name: 'Jeffrey', email: 'j@jwt.com', roles: [{ role: Role.Franchisee }] },
        { id: '6', name: 'Riley Hacking', email: 'r@jwt.com', roles: [{ role: Role.Diner }] },
      ];

      // Filtering
      const cleaned = nameFilter.replace(/\*/g, '').toLowerCase();
      const filteredUsers = cleaned
        ? allUsers.filter(u => u.name.toLowerCase().includes(cleaned))
        : allUsers;

      // Pagination logic
      const start = pageParam * limitParam;
      const end = start + limitParam;
      const paginatedUsers = filteredUsers.slice(start, end);

      const more = end < filteredUsers.length;

      await route.fulfill({
        json: {
          users: paginatedUsers,
          page: pageParam,
          more,
        },
      });
    });

  await page.goto('/');
}

test('admin page with users', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText('homeadmin-dashboard')).toBeVisible();
  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();

  await expect(page.getByRole('main')).toContainText('Users');

  await expect(page.getByRole('columnheader', { name: 'Name', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Email', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Role', exact: true })).toBeVisible();

  await expect(page.getByRole('cell', { name: 'Kai Chen' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'a@jwt.com' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'admin' }).first()).toBeVisible();


  await expect(page.getByRole('textbox', { name: 'Filter users' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' }).first()).toBeVisible();
});


test('admin can filter users by name', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByText('Kai Chen').first()).toBeVisible();
  await expect(page.getByText('Nathan Hacking')).toBeVisible();

  await page.getByRole('textbox', { name: 'Filter users' }).fill('Jeffrey');
  await page.getByRole('button', { name: 'Submit' }).first().click();

  await expect(page.getByText('Jeffrey')).toBeVisible();
  await expect(page.getByText('Nathan Hacking')).not.toBeVisible();
});

test('admin can paginate users', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();

  // Page 0 should show first 2 users
  await expect(page.getByText('Kai Chen').first()).toBeVisible();
  await expect(page.getByText('Nathan Hacking')).toBeVisible();
  await expect(page.getByText('Jeffrey')).not.toBeVisible();

  await page.getByRole('button', { name: '»' }).first().click();

  // Page 1 should show next users
  await expect(page.getByText('Jeffrey')).toBeVisible();
  await expect(page.getByText('Riley Hacking')).toBeVisible();
  await expect(page.getByText('Nathan Hacking')).not.toBeVisible();
});

test('non-admin cannot access admin page', async ({ page }) => {
  await basicInitDiner(page);

  // Add a non-admin user to validUsers first

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
});

test('filter shows empty state when no users match', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('textbox', { name: 'Filter users' }).fill('zzzzz');
  await page.getByRole('button', { name: 'Submit' }).first().click();

  await expect(page.getByText('Nathan Hacking')).not.toBeVisible();
});

test('delete franchise', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('row', { name: 'Nathan Hacking n@jwt.com admin Delete' }).getByRole('button').click();
  await expect(page.getByText('Nathan Hacking')).not.toBeVisible();

});

async function basicInitDiner(page: Page) {
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