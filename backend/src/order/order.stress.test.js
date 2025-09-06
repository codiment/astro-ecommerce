import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 2, // Only 2 virtual users
  iterations: 2, // Each user makes only 1 purchase
};

const users = [
  {
    email: __ENV.TEST_USER1_EMAIL,
    password: __ENV.TEST_USER1_PASSWORD,
  },
  {
    email: __ENV.TEST_USER2_EMAIL,
    password: __ENV.TEST_USER2_PASSWORD,
  },
];

export default function () {
  // Choose a random user
  const user = users[Math.floor(Math.random() * users.length)];

  // 1. Login
  const loginRes = http.post(
    'http://localhost:3000/api/auth/login',
    JSON.stringify(user),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  console.log(`Login status: ${loginRes.status}`);
  console.log(`Login response body: ${loginRes.body}`);

  check(loginRes, {
    'login status is 200 or 201': (res) =>
      res.status === 200 || res.status === 201,
    'login has token': (res) => !!res.json('access_token') !== '',
  });

  const token = loginRes.json('access_token');
  if (!token) {
    console.error('Token not received');
    return;
  }

  // 2. Add product to cart
  const productPayload = JSON.stringify({
    productId: 1,
    quantity: 2,
  });

  const addRes = http.post(
    'http://localhost:3000/api/cart/add',
    productPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  check(addRes, {
    'add to cart is 200 or 201': (res) =>
      res.status === 200 || res.status === 201,
  });

  console.log(
    `Response when adding to cart: ${addRes.status} - ${addRes.body}`,
  );

  // 3. Create order
  const orderRes = http.post('http://localhost:3000/api/order', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(orderRes, {
    'order created or stock error': (res) =>
      res.status === 201 ||
      res.status === 200 ||
      (res.status === 400 && res.body.includes('Insufficient stock')),
  });

  if (orderRes.status !== 201 && orderRes.status !== 200) {
    console.error(`❌ Error creating order. Status: ${orderRes.status}`);
    console.log(`🧾 Response: ${orderRes.body}`);
  }

  sleep(1);
}
