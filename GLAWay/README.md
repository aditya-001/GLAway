# GLAWay

GLAWay is a full-stack smart food ordering platform for a university canteen. It ships with a student-facing ordering flow, a separate admin panel for canteen staff, JWT-based authentication, menu management, QR/token pickup, animated order tracking, dark mode, admin-controlled motion settings, and Razorpay-ready payment handling.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios
- Backend: Node.js, Express.js, MongoDB with Mongoose
- Payments: Razorpay with mock-payment fallback for local development

## Highlights

- Student UI with animated food cards, horizontal category sliders, cart transitions, QR-based order confirmation, ETA countdown, order history, and order-again flow
- Admin panel with separate login, live order control, menu CRUD with image upload, and animation tuning for the student experience
- Global animation system backed by MongoDB so admins can enable or disable motion, switch between `slide`, `fade`, and `zoom`, and control animation speed
- Dark mode toggle with persistent UI preferences on the frontend
- Global footer with policy, customer care, social handles, and a live feedback submission form

## Folder Structure

```text
GLAWay/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       │   ├── AnimationWrapper.jsx
│       │   ├── Button.jsx
│       │   ├── CartItem.jsx
│       │   ├── FoodCard.jsx
│       │   ├── Loader.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── StatusBadge.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── UISettingsContext.jsx
│       ├── pages/
│       │   ├── AdminDashboardPage.jsx
│       │   ├── AdminLoginPage.jsx
│       │   ├── AnimationSettings.jsx
│       │   ├── CartPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ManageFoodPage.jsx
│       │   ├── MyOrdersPage.jsx
│       │   ├── OrderStatusPage.jsx
│       │   ├── OrderSuccessPage.jsx
│       │   └── SignupPage.jsx
│       ├── services/
│       │   ├── adminService.js
│       │   ├── animationService.js
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── foodService.js
│       │   ├── orderService.js
│       │   └── paymentService.js
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── .env
└── .env.example
```

## Main Routes

### Student UI

- `/login`
- `/signup`
- `/home`
- `/cart`
- `/order-success/:id`
- `/order-status`
- `/order-status/:id`
- `/policy`
- `/feedback`
- `/customer-care`

### Admin UI

- `/admin/login`
- `/admin/dashboard`
- `/admin/manage-food`
- `/admin/animation-settings`

## API Summary

## Frontend Contract

The backend is shaped around the existing frontend in `client/src/services`.

- Base URL: `http://localhost:5000/api`
- User auth header: `Authorization: Bearer <glaway_user_token>`
- Admin auth header: `Authorization: Bearer <glaway_admin_token>`
- Object responses include `success`, `message`, and `data` metadata without breaking the existing frontend object access pattern.
- List endpoints such as `GET /api/food` and `GET /api/order/my-orders` return raw arrays because the current frontend directly calls `setState(data)` on those responses.
- Public `GET /api/food` requests default to available items only, while the existing admin surface can still see hidden items without frontend changes.
- Error responses use:

```json
{
  "success": false,
  "message": "Readable error message",
  "data": null
}
```

## API Summary

### User Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Admin Auth

- `POST /api/admin/signup`
- `POST /api/admin/login`
- `GET /api/admin/me`

### Menu / Food

- `GET /api/food`
- `GET /api/food/:id`
- `POST /api/food`
- `PATCH /api/food/:id`
- `DELETE /api/food/:id`

### Orders

- `POST /api/order`
- `GET /api/order/my-orders`
- `GET /api/order/:id`
- `PATCH /api/order/:id/status`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`

### Payment / Misc

- `GET /api/payment/qr`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `POST /api/feedback`
- `GET /api/feedback`
- `GET /api/animation-settings`
- `PATCH /api/animation-settings`

## Backend Smoke Test

Run this from the repo root to boot the API on a random port and verify the core routes:

```bash
npm --prefix server run smoke
```

The GitHub Actions workflow at [`.github/workflows/backend-smoke.yml`](/home/aditya/Public/GLAWay/.github/workflows/backend-smoke.yml) runs this check on every push.

## Sample Requests And Responses

### 1. User Signup

Request:

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Test Student",
  "email": "student@example.com",
  "password": "student123"
}
```

Response:

```json
{
  "success": true,
  "message": "Signup successful",
  "user": {
    "_id": "661d00000000000000000001",
    "name": "Test Student",
    "email": "student@example.com",
    "role": "User"
  },
  "token": "jwt_token_here"
}
```

### 2. Fetch Menu Items

Request:

```http
GET /api/food?category=Block%20A&foodType=Veg&search=dosa
```

Response:

```json
[
  {
    "_id": "661d00000000000000000002",
    "name": "Masala Dosa Combo",
    "description": "Crispy dosa, sambhar, chutney, and a campus-style filter coffee.",
    "price": 95,
    "category": "Block A",
    "foodType": "Veg",
    "image": "https://...",
    "rating": 4.5,
    "isAvailable": true,
    "prepTime": "12-15 mins"
  }
]
```

### 3. Create Razorpay Order

Request:

```http
POST /api/payment/create-order
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "amount": 173
}
```

Response in local mock mode:

```json
{
  "success": true,
  "message": "Mock Razorpay order created",
  "data": {
    "id": "mock_order_1710000000000"
  },
  "id": "mock_order_1710000000000",
  "amount": 17300,
  "currency": "INR",
  "receipt": "mock_receipt_1710000000000",
  "isMock": true,
  "paymentQr": {
    "upiUri": "upi://pay?pa=your-upi-id@bank&pn=Campus%20Canteen&mc=0000&mode=02&purpose=00",
    "label": "Campus Canteen",
    "provider": "PhonePe",
    "image": "/uploads/payment-qr.jpeg"
  }
}
```

### 4. Fetch Payment QR

Request:

```http
GET /api/payment/qr
Authorization: Bearer <user_token>
```

Response:

```json
{
  "success": true,
  "message": "Payment QR fetched",
  "data": {
    "upiUri": "upi://pay?pa=your-upi-id@bank&pn=Campus%20Canteen&mc=0000&mode=02&purpose=00",
    "label": "Campus Canteen",
    "provider": "PhonePe",
    "image": "/uploads/payment-qr.jpeg"
  },
  "upiUri": "upi://pay?pa=your-upi-id@bank&pn=Campus%20Canteen&mc=0000&mode=02&purpose=00",
  "label": "Campus Canteen",
  "provider": "PhonePe",
  "image": "/uploads/payment-qr.jpeg"
}
```

### 5. Place Order

Request:

```http
POST /api/order
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "foodItem": "661d00000000000000000002",
      "quantity": 2
    }
  ],
  "requestedPickupAt": "2026-04-16T12:20:00.000Z",
  "paymentMethod": "Razorpay",
  "paymentStatus": "Paid",
  "razorpayOrderId": "mock_order_1710000000000",
  "razorpayPaymentId": "mock_payment_1710000000000"
}
```

Response:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "661d00000000000000000003"
  },
  "_id": "661d00000000000000000003",
  "orderId": "GLA-260416-ABCD",
  "user": {
    "_id": "661d00000000000000000001",
    "name": "Test Student",
    "email": "student@example.com"
  },
  "items": [
    {
      "foodItem": {
        "_id": "661d00000000000000000002",
        "name": "Masala Dosa Combo",
        "category": "Block A",
        "image": "https://...",
        "prepTime": "12-15 mins"
      },
      "name": "Masala Dosa Combo",
      "quantity": 2,
      "price": 95
    }
  ],
  "subtotal": 190,
  "platformFee": 8,
  "totalAmount": 198,
  "status": "Pending",
  "paymentStatus": "Paid",
  "paymentMethod": "Razorpay",
  "pickupToken": "GLA-XXXX-YYYY",
  "requestedPickupAt": "2026-04-16T12:20:00.000Z",
  "scheduledPickupAt": "2026-04-16T12:20:00.000Z",
  "timeSlot": "2026-04-16T12:20:00.000Z",
  "pickupTimeLabel": "5:50 pm",
  "estimatedReadyAt": "2026-04-16T12:05:00.000Z",
  "qrPayload": "{\"orderId\":\"GLA-260416-ABCD\",\"token\":\"GLA-XXXX-YYYY\"}"
}
```

### 6. Admin Update Order Status

Request:

```http
PATCH /api/order/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Preparing"
}
```

Response:

```json
{
  "success": true,
  "message": "Order status updated",
  "_id": "661d00000000000000000003",
  "status": "Preparing"
}
```

## Environment Variables

Copy the example file first:

```bash
cp .env.example .env
```

Important values:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `MOCK_RAZORPAY`
- `PAYMENT_QR_UPI`
- `PAYMENT_QR_LABEL`
- `PAYMENT_QR_PROVIDER`
- `PAYMENT_QR_IMAGE_PATH`
- `CAMPUS_TIMEZONE`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Run Commands

Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

Build the frontend:

```bash
cd client
npm run build
```

## Connect Frontend To Backend

The frontend already points to:

```env
VITE_API_URL=http://localhost:5000/api
```

That means no frontend code changes are needed. Just make sure:

1. The backend is running on port `5000`
2. The frontend is running on port `5173`
3. `CLIENT_URL` in `.env` includes the frontend origin

## Backend Notes

- Express middleware includes `cors`, `express.json()`, `express.urlencoded()`, `morgan`, JWT auth middleware, and centralized error handling.
- Menu image uploads are handled with `multer` and served from `/uploads`.
- User and admin auth are separated because the frontend stores separate tokens and calls different profile endpoints.
- Orders store both `requestedPickupAt` and normalized `scheduledPickupAt/timeSlot` values so the UI can show the selected pickup slot and ETA safely.
- Payment QR details can be fetched from `/api/payment/qr`, and the same payload is included in mock payment-order responses for checkout flows that need a static UPI QR.
- The existing order-success and order-status QR remains the pickup-pass QR because the current frontend renders `order.qrPayload` for collection, not for payment.
- If local MongoDB is unavailable, the backend falls back to `mongodb-memory-server` for local development.

## Admin Animation Control

Animation controls are available at `/admin/animation-settings`.

Admins can:

- enable or disable animations globally
- switch the route and component animation style between `slide`, `fade`, and `zoom`
- choose `slow`, `normal`, or `fast` motion speeds

These settings are stored in MongoDB using the `AnimationSettings` model and are consumed by the frontend through `UISettingsContext` and `AnimationWrapper`.

## Local Development Notes

- If local MongoDB is unavailable, the backend falls back to `mongodb-memory-server`.
- If Razorpay keys are not configured, `MOCK_RAZORPAY=true` enables a development payment flow so checkout still works locally.
- The provided PhonePe QR can be served directly from `/uploads/payment-qr.jpeg` and exposed via `/api/payment/qr`.
- A default admin account is seeded automatically from `.env`.
- The student UI includes a dark mode toggle and loads animation settings from the backend on startup.
- Orders store `estimatedReadyAt` so the frontend can show ETA countdowns on the success and status screens.

Default local admin credentials:

```text
Email: admin@glaway.com
Password: admin12345
```

## Production Notes

- Replace mock Razorpay values with real Razorpay credentials.
- Set `MOCK_RAZORPAY=false` in production.
- Point `MONGO_URI` to a persistent MongoDB deployment.
- Uploaded menu images are served from `/uploads`.
