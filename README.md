# Venkatalakshmi Mess - Food Ordering App

A React-based web application for Venkatalakshmi Mess where customers can browse menu items, add to cart, and place orders for delivery or pickup.

## Features

- Browse menu items by category
- Menu updates based on time of day and day of week
- Add items to cart with quantity adjustment
- Apply promo codes for discounts
- Secure checkout with Razorpay integration
- Order tracking and receipt generation

## Project Structure

```
├── src/
│   ├── Componenets/      # React components (misspelled - legacy)
│   │   ├── Cart/         # Cart-related components
│   │   ├── Landing/      # Landing page components
│   │   ├── OrderPage/    # Order page components
│   │   ├── common/       # Shared UI components
│   │   ├── form/         # Form components
│   │   ├── order-sucess/ # Order success page
│   │   └── utils/        # Utility functions
│   ├── constants/        # Application constants
│   ├── services/         # Service layer for data operations
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
└── public/               # Static assets
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# API base URL
VITE_API_BASE_URL=your-api-base-url
```

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your configuration
4. Run development server with `npm run dev`

## Database Structure

The application relies on a backend API to interact with the database. The frontend does not directly access Supabase.


## Handling User Data

User data is stored in session storage for the duration of the browser session, providing a balance between user convenience and privacy. After a successful order, the data is sent to the backend API for order processing.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
