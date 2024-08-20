const button = document.querySelector('.button');
const counter = document.querySelector('.counter');
const adminButton = document.querySelector('.admin-button');
const mainButton = document.querySelector('#mainButton'); // Select main button once

// Получаем количество кликов из LocalStorage
let count = localStorage.getItem('clickCount'); 
if (count === null) {
    count = 0;
} else {
    count = parseInt(count); 
}

// Получаем информацию о покупках из localStorage
let purchasedItems = localStorage.getItem('purchasedItems');
if (purchasedItems === null) {
    purchasedItems = {}; // Если нет информации, создаем пустой объект
} else {
    purchasedItems = JSON.parse(purchasedItems); // Преобразуем строку в объект
}

counter.textContent = count;

button.addEventListener('click', () => {
    count++;
    counter.textContent = count;
    localStorage.setItem('clickCount', count); 
});

// Добавленный код для меню-кнопки и наложения
const menuButton = document.querySelector('.menu-button');
const overlay = document.querySelector('.overlay');
const closeButton = document.querySelector('.close-button');

let generatedCode = null; // Переменная для хранения сгенерированного кода

menuButton.addEventListener('click', async () => {
    overlay.style.display = 'block';
    closeButton.style.display = 'block';
    adminButton.style.display = 'block'; // Показать кнопку Admin

    // Получение IP и генерация кода при открытии меню
    try {
        const ipAddress = await getIPAddress();
        generatedCode = localStorage.getItem(`code-${ipAddress}`); 
        if (!generatedCode) {
            generatedCode = generateCode(); 
            localStorage.setItem(`code-${ipAddress}`, generatedCode);
        }
        const codeElement = createCodeElement(generatedCode);
        adminButton.parentNode.appendChild(codeElement); // Добавляем код под кнопкой
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось получить IP-адрес!');
    }
});

closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    closeButton.style.display = 'none';
    adminButton.style.display = 'none'; // Скрыть кнопку Admin

    // Удаление элемента с кодом при закрытии меню
    const codeElement = document.querySelector('.code-element');
    if (codeElement) {
        codeElement.remove();
    }
});

adminButton.addEventListener('click', () => {
    const password = prompt("Введите пароль:");
    if (password === "61826") { // Замените "your_secret_password" на ваш пароль
        // Пароль верный, показываем кнопки 1 и 2
        const adminPanel = document.createElement('div');
        adminPanel.classList.add('admin-panel');

        const button1 = document.createElement('button');
        button1.textContent = '1';
        button1.addEventListener('click', () => {
            // Проверяем, не превышает ли баланс лимит
            if (count + 9999999999999 <= 99999999999999) {
                count += 9999999999999; 
                counter.textContent = count;
                localStorage.setItem('clickCount', count); // Обновляем счетчик в localStorage
            } else {
                alert("Максимальный баланс достигнут!");
            }
        });

        const button2 = document.createElement('button');
        button2.textContent = '2';
        button2.addEventListener('click', () => {
            // TODO: логика для добавления 100 монет всем
            // например, можно использовать AJAX-запрос на сервер
        });

        adminPanel.appendChild(button1);
        adminPanel.appendChild(button2);
        document.body.appendChild(adminPanel); // Добавляем панель в конец body
    } else {
        alert("Неверный пароль!");
    }
});

// Кнопка магазина
const shopButton = document.querySelector('.shop-button'); 
const shop = document.querySelector('.shop');
const shopCloseButton = document.querySelector('.shop-close-button');

shopButton.addEventListener('click', () => {
    shop.style.display = shop.style.display === 'none' ? 'flex' : 'none';
});

// Close shop functionality
shopCloseButton.addEventListener('click', () => {
    shop.style.display = 'none';
});

// Функция для генерации кода
function generateCode() {
    return Math.floor(Math.random() * 10000000000).toString(); // 10 цифр
}

// Функция для получения IP-адреса
function getIPAddress() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.ipify.org?format=json');
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response).ip);
            } else {
                reject(new Error('Ошибка получения IP-адреса'));
            }
        };
        xhr.onerror = () => {
            reject(new Error('Ошибка получения IP-адреса'));
        };
        xhr.send();
    });
}

// Функция для создания элемента для кода
function createCodeElement(code) {
    const codeElement = document.createElement('div');
    codeElement.classList.add('code-element');
    codeElement.textContent = code;
    return codeElement;
}

// Магазин
const shopItems = document.querySelectorAll('.item');

// Update the item cost and text when the page loads
shopItems.forEach(item => {
    const cost = parseInt(item.dataset.cost);
    if (purchasedItems[item.dataset.image]) {
        item.dataset.cost = 0;
        item.querySelector('p:last-of-type').textContent = 'Стоимость: Бесплатно';
    }
});

shopItems.forEach(item => {
    item.addEventListener('click', () => {
        const cost = parseInt(item.dataset.cost);
        if (count >= cost) {
            count -= cost;
            counter.textContent = count;
            localStorage.setItem('clickCount', count);

            // Обновляем изображение на кнопке
            mainButton.style.backgroundImage = `url(${item.dataset.image})`; 

            // Закрываем магазин
            shop.style.display = 'none';

            // Сохраняем, что товар куплен
            purchasedItems[item.dataset.image] = true;
            localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));

            // Обновляем стоимость товара
            item.dataset.cost = 0; 
            item.querySelector('p:last-of-type').textContent = 'Стоимость: Бесплатно';

        } else if (cost === 0 || purchasedItems[item.dataset.image]) {  // Проверяем, если товар бесплатный или уже куплен
            // Обновляем изображение на кнопке
            mainButton.style.backgroundImage = `url(${item.dataset.image})`; 

            // Закрываем магазин
            shop.style.display = 'none';
        } else {
            alert("Недостаточно монет!");
        }
    });
});
