import './scss/styles.scss';

// импортируем шаблоны классов
import { CatalogMain } from './components/Models/CatalogMain';
import { BinData } from './components/Models/BinData';
import { CustomerData } from './components/Models/CustomerData';

// импортируем тестовые данные apiProducts
import { apiProducts } from './utils/data';

// Импортируем api класс, адрес и новый слой
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { AppApi } from './components/base/AppApi';


console.log('==== Начинаем тестирование наших классов + методов. ====');
// тестируем основной каталог
console.log('=** Тестирование класса CatalogMain. **=');

const catalog = new CatalogMain();
catalog.saveProducts(apiProducts.items);
console.log('1. Каталог успешно создан.');
console.log('2. Вывод каталога: ', catalog.getProducts());

const findProductId = apiProducts.items[1].id
const findProduct = catalog.getSelectedProduct(findProductId)
console.log(
    '3. Вывод отдельного товара (напр.второго по списку): ',
    findProduct
);
if (findProduct) {
    catalog.setPreview(findProduct);
    console.log('4. Превью с найденым товаром сформировано.');
    console.log('5. Товар из превью: ', catalog.getPreview());
}

// тестируем корзину
console.log('=** Тестирование класса BinData. **=');

const bin = new BinData();

// добавляем пару товаров в корзину
if (apiProducts.items[0]) {
    bin.addProduct(apiProducts.items[0]);
}
const itemToDeleteLater = apiProducts.items[0].id;
if (apiProducts.items[2]) {
    bin.addProduct(apiProducts.items[2]);
}
if (bin.countBinProducts() !== 0) {
    console.log('1. В корзину добавлены товары.');
}
console.log('2. Товары в корзине: ', bin.getProducts());
console.log('3. Количество товаров в корзине: ', bin.countBinProducts());
console.log('4. Стоимость товаров в корзине: ', bin.getBinProductsCost(), ' руб.');
bin.deleteProduct(itemToDeleteLater);
console.log('5. Удаляем первый товар в корзине.');
console.log('Проверяем - оставшиеся товары в корзине: ', bin.getProducts());
console.log('6. Проверяем наличие товарова(удаленного) в корзине -', bin.checkProductInBin(itemToDeleteLater));
bin.clearBin();
console.log('7. Очищаем корзину.');
console.log('Проверяем - товары в корзине: ', bin.getProducts());


// тестируем покупателя
const customer = new CustomerData();

console.log('=** Тестирование класса CustomerData. **=');
console.log('1. Проверка валидации незаполненной формы:');
console.log(customer.validateCustomerData())
// заполняем покупателя частично - только первые два поля
customer.setCustomerData({
    payment: 'card',
    address: 'moscow'
});
console.log('2. У нового покупателя заполнили только два поля - оплата и адрес.');
console.log('В ошибках должно остаться только поля: email и phone:')
console.log(customer.validateCustomerData());
// дозаполняем покупателя
customer.setCustomerData({
    email: 'email.yandex.ru',
    phone: '+7999666444'
})
console.log('3. Заполнили до конца и получаем данные покупателя: ');
console.log(customer.getCustomerData());
if (Object.keys(customer.validateCustomerData()).length === 0) {
    console.log('Проверили на ошибки - "Ошибок не найдено".');
}
customer.clearCustomerData();
console.log('4. Очищаем данные пользователя');
console.log('Выводим его поля: ', customer.getCustomerData());
console.log('Все пусто. Можем провалидировать: ', customer.validateCustomerData());


// тестируем запрос к серверу о товарах. получение
console.log('=** Тестирование класса AppApi. **=');
// экземпляр базового api с адресом сервера
const baseApi = new Api(API_URL);
// на его основе - класс AppApi (композиция)
const appApi = new AppApi(baseApi);

appApi.getProducts()
    .then((data) => {
        console.log('1. Данные с сервера: ', data); // полные данные
        console.log('2. Всего товаров на сервере: ', data.total); // только тотал

        // Из ответа берем массив items и грузим в нашу модель каталога 'catalog'
        catalog.saveProducts(data.items);
        console.log('3. Каталог наполнен товарами, полученными с сервера: ');
        console.log(catalog.getProducts());
        
        console.log('==== Окончание тестирования наших классов + методов. ====');
    })
    .catch((error) => {
        console.error('Произошла ошибка при запросе к серверу:', error);
    });
