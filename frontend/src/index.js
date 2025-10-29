import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Путь к вашему компоненту App
import './styles/App.css';   // Опционально: стили

// Находим DOM-элемент с id="root"
const container = document.getElementById('root');

// Создаём корень (root) с помощью createRoot
const root = createRoot(container);

// Рендерим компонент App в корне
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);