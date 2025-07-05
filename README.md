# E-Commerce Web Application

A modern e-commerce platform built with PHP (backend) and vanilla JavaScript (frontend). This project features category-based product browsing, banners, featured and random (new arrival) products, and a responsive, visually appealing UI.

## Features

- Dynamic product categories and navigation
- Featured products and new arrivals (randomized)
- Product quick view and add-to-cart overlay
- Responsive design with Swiper.js banners
- Backend endpoints for categories, banners, featured, random, and category-specific products
- Clean, maintainable code with reusable backend and frontend logic

## Folder Structure

```
user/
  backend/
    db.php
    menu.php
    banners.php
    featured.php
    electronics.php
    food.php
    men.php
    women.php
    children.php
    product_category.php
    random.php
  frontend/
    global.js
    index.html
    style.css
images/
```

## Backend (PHP)
- All API endpoints are in `user/backend/`.
- `db.php`: Database connection.
- `menu.php`: Returns active categories.
- `banners.php`: Returns banner data.
- `featured.php`: Returns featured products.
- `random.php`: Returns random products (new arrivals).
- `product_category.php`: Reusable logic for category endpoints.
- Category endpoints (e.g., `men.php`, `women.php`) use `product_category.php` for DRY code.

## Frontend (JS/HTML/CSS)
- `global.js`: Handles all dynamic UI, fetches data, renders products, overlays, and navigation.
- `index.html`: Main page structure. Includes sections for banners, featured products, and new arrivals.
- `style.css`: Unified, modern, responsive styles.

## Setup

1. **Database**: Import your products and categories into a MySQL database. Update `db.php` with your credentials.
2. **Backend**: Place the `user/backend/` folder on your PHP server (e.g., XAMPP's `htdocs`).
3. **Frontend**: Open `user/frontend/index.html` in your browser. Make sure the backend endpoints are accessible (adjust URLs if needed).
4. **Images**: Place product and banner images in the `images/` folder or update image paths in the database.

## Usage
- Browse categories via the navigation bar.
- View featured products and new arrivals.
- Click on a product's quick view or add to cart to see the overlay with details.
- Banners are displayed using Swiper.js.

## Customization
- Add new categories by updating the database and creating a corresponding PHP file in `backend/` (using `product_category.php`).
- Adjust styles in `style.css` for branding.
- Extend product overlay and cart logic in `global.js` as needed.

## Dependencies
- [Swiper.js](https://swiperjs.com/) for banners
- [Font Awesome](https://fontawesome.com/) for icons

## License
MIT License
