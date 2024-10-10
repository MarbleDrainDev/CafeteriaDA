# React Login Project

This project demonstrates a simple login system with role-based views using React and TypeScript.

## Features

- Login page that accepts a username
- Role-based views for Admin, Cajero, and Mesero
- Tailwind CSS for styling
- TypeScript for type safety

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Project Structure

```
software/
├── .gitignore
├── package.json
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── logo192.png
│   └── manifest.json
├── README.md
└── src/
    ├── assets/
    │   └── styles/
    │       └── header.css
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── AdminView.tsx
    │   ├── CajeroView.tsx
    │   └── MeseroView.tsx
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

## Usage

1. Enter one of the following usernames to log in:
   - Admin
   - Cajero
   - Mesero
2. The corresponding view will be displayed based on the entered username.
3. Any other username will result in an "Acceso no autorizado o Usuario incorrecto" message.

## Customization

To change the hardcoded usernames or add more roles, modify the `App.tsx` file. Look for the following comment:

```typescript
// TODO: Replace this array with data from a database
if (['Admin', 'Cajero', 'Mesero'].includes(username)) {
  setUser(username);
} else {
  alert('Acceso no autorizado o Usuario incorrecto');
}
```

Replace this condition with a database query or API call to validate users and their roles.