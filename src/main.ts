import { IProduct } from './types/index';
import './scss/styles.scss';

// импортируем утилиты
import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

// ВРЕМЕННО! ВМЕСТО СЕТИ: Импортируем готовый моковый массив из utils/data.ts
// import { apiProducts } from './utils/data';

// импортируем сервис апи
import { AppApi } from './components/AppApi';

// импортируем модели
import { CatalogMain } from './components/Models/CatalogMain';
import { BinData } from './components/Models/BinData';
import { CustomerData } from './components/Models/CustomerData';

// импортируем вьюшки
import { Header } from './components/views/Header';
import { Gallery } from './components/views/Gallery';
import { Modal } from './components/views/Modal';
import { CardCatalog } from './components/views/Card/CardCatalog';
import { CardPreview } from './components/views/Card/CardPreview';
import { CardBasket } from './components/views/Card/CardBasket';
import { Basket } from './components/views/Basket';
import { Success } from './components/views/Success';
import { FormOrder } from './components/views/Form/FormOrder';
import { FormContacts } from './components/views/Form/FormContacts';



// инициализируем базу
// ==========================================
const events = new EventEmitter();
// ВКЛЮЧЕНО ДЛЯ СЕРВЕРА!!!***************************************************************/
const baseApi = new Api(API_URL);  // экземпляр базового api с адресом сервера - СЕРВЕР НЕ РАБОТАЕТ!
const appApi = new AppApi(baseApi);  // на его основе - класс AppApi (композиция) - СЕРВЕР НЕ РАБОТАЕТ!
//КОНЕЦ БЛОКА ВКЛЮЧЕНО ДЛЯ СЕРВЕРА*******************************************************/

// Глобальные модели данных (передаем им один общий брокер событий)
const catalogModel = new CatalogMain(events);
const basketModel = new BinData(events);
const customerModel = new CustomerData(events);

// фиксируем все шаблоны
// ==========================================
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success'); // для финала

// компоненты view
// ==========================================
// контейнеры которые уже есть на странице изначально
const pageContainer = ensureElement<HTMLElement>('.page');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// созданные нами основные на их основе
const header = new Header(events, pageContainer);
const gallery = new Gallery(pageContainer);
const modal = new Modal(events, modalContainer);
// создаем глобальные переменные, чтобы переиспользовать в разных блоках
let basketView: Basket;
let orderFormView: FormOrder | null = null; // | null - иначе на зануление формы TS будет ругаться
let contactsFormView: FormContacts | null = null; // | null - иначе на зануление формы TS будет ругаться

// ==========================================
// Обработчики событий
// ==========================================

// каталог изменился → забрать товары у модели и перерисовать карточки.
// слушаем событие 'items:changed' от нашей модели данных
events.on('items:changed', () => {
    // получаем из модели актуальный массив товаров пришедший с сервера
    const products = catalogModel.getProducts();
    // прогоняем массив товаров через map, превращаем его в массив готовых карточек cardCatalog
    const catalogCards = products.map((product) => {
        const cardTemplate = cloneTemplate(cardCatalogTemplate); // клон пустого шаблона карточки в каталоге
        // создаем вьюшку карточки
        const cardCatalogView = new CardCatalog(cardTemplate, {
            onClick: () => { // и еще передаем в шаблон коллбэк на клик по ней
                events.emit('card:selected', product); // если случается - анонсируется событие "карточка-выбрана"
            }
        });
        // заполняем вьюшку данными товара через render из корневого компонента, в котором тот прописан
        return cardCatalogView.render(product);
    });

    // передаем html-карточки в компонент галереи для вывода на экран
    gallery.render({ catalog: catalogCards });
});


//================== получение данных ===================================================
// ВКЛЮЧЕНО ДЛЯ СЕРВЕРА!!!***************************************************************/
// ВАЖНО - почему-то не работает сервер (поддержка не сказала когда починят)
// запрашиваем данные с сервера при старте приложения
// ==========================================
appApi.getProducts()
    .then((data) => {
        // Из ответа берем массив items и грузим в нашу модель каталога 'catalogModel'
        // там метод сам сгенерирует событие 'items:changed'
        catalogModel.saveProducts(data.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров:', error);
    });
//КОНЕЦ БЛОКА ВКЛЮЧЕНО ДЛЯ СЕРВЕРА*******************************************************/

// ВРЕМЕННО ОТКЛЮЧЕНО ******************************* - ДЛЯ МОКОВ *********************/
// // ВРЕМЕННО! напрямую из data.ts скармливаем модели наши готовые товары. 
// // модель запишет их и сгенерирует точно такое же событие items:changed
// catalogModel.saveProducts(apiProducts.items);
//КОНЕЦ БЛОКА ВРЕМЕННО ОТКЛЮЧЕНО*******************************************************/
//================== получение данных ===================================================


// слушаем событие 'card:selected', берем переданный product и реагируем на него как услышали
events.on('card:selected', (product: IProduct) => {
    catalogModel.setPreview(product); // передаем товар в модель данных
});

// слушаем событие 'preview:changed'
events.on('preview:changed', (product: IProduct) => {
    const cardTemplate = cloneTemplate(cardPreviewTemplate); // клон шаблона
    const cardPreviewView = new CardPreview(cardTemplate, { // вьюшка на основе клона + действие на клик
        // вилка действий. если товар уже в корзине
        onBuy: () => {
            if (basketModel.checkProductInBin(product.id)) {
                // если товар уже в корзине - убраем его оттуда и переключаем текст кнопки на "купить"
                basketModel.deleteProduct(product.id);
                cardPreviewView.render({ buttonText: 'Купить' });
            } else {
                //если товара нет - добавляем в модель корзины
                basketModel.addProduct(product)
                // а на кнопку вешаем текст - 
                cardPreviewView.render({ buttonText: 'Удалить из корзины' });
            }
        }
    });
    
    // прорисовываем карточку товара
    // сразу проверяе есть ли товар в корзине и пишем вилку вариантов для true/false - удалить/купитть
    const currentButtonText = basketModel.checkProductInBin(product.id)?'Удалить из корзины':'Купить'
    modal.render({
        content: cardPreviewView.render({
            // грузим все что есть
            ...product,
            // но поле buttonText - таким каким сделали выше
            buttonText: currentButtonText
        })
    });
});

//=================== КОРЗИНА ==================================================
// слушаем событие 'basket:changed'
events.on('basket:changed', () => {
    const goodsInBasket = basketModel.countBinProducts();
    header.render({ counter:  goodsInBasket}) // рендерим хедер с иконкой и количеством товаров в корзине

    // на этот слушатель завязываем развитие слушателя basket:open - если вьюшка создана уже
    if (basketView) {
        // получаем из модели BinData актуальный массив товаров в корзине пришедший с сервера
        const productsInBasket = basketModel.getProducts();
        // прогоняем массив товаров через map, превращаем его в массив готовых карточек cardBasket
        // не забываем про индекс, который надо посчитать и передать в карточку товара в корзине
        const basketCards = productsInBasket.map((product, index) => {
            const cardTemplate = cloneTemplate(cardBasketTemplate); // клон пустого шаблона карточки в корзине
            // создаем вьюшку карточки(в корзине)
            const cardBasketView = new CardBasket(cardTemplate, {
                onRemove: () => {
                    // и еще передаем в шаблон коллбэк на клик по кнопке удалить.
                    // причем он запустит basket:changed и корзинка перерисуется
                    basketModel.deleteProduct(product.id);
                }
            });
            // заполняем вьюшку данными товара через render из корневого компонента, в котором тот прописан
            // закидываем туда все что есть по - ...poduct + на ходу генерим правильный п.номер товара в корзине
            return cardBasketView.render({
                ...product,
                index: index + 1
            });
        });
        
        // обновляем список товаров и итоговую сумму в ранее сделанной в open корзине - basketView
        // через ее рендер - туда передаем все готовые карточки + тотальную сумму корзины
        basketView.render({
            items: basketCards,
            total: basketModel.getBinProductsCost() // Передаем актуальную сумму из модели!
        });
        // ЗАПОЛНЕННУЮ basketView далее подхватит опять basket:open и отрисует ее в модалке
    }
});

// слушаем событие 'basket:open'
events.on('basket:open', () => {
    const basketT = cloneTemplate(basketTemplate) // созадаем темплейт корзинки
    // переменную basketView создали глобально вначале, чтобы ее видели разные блоки
    basketView = new Basket(basketT, {  // на его основе создаем вьюшку корзинки + коллбэк на клик onOrder
        onOrder: () => {
            events.emit('order:open');
        }
    });
    // вызываем событие basket:changed - заполняем актуальными товарами корзину при открытии
    events.emit('basket:changed'); // тот блок обработает basketView и вернет готовым
    // а потом рендерим модалку. причем basketView - без параметров
    // - все уже заполнено в предыдущем блоке, когда сработал basket:change emit
    // тут просто отрисовка готового
    modal.render({ content: basketView.render() })
});



// =============== ОРДЕРА ==========================================================
// слушаем событие 'order:open'
events.on('order:open', () => {
    const orderT = cloneTemplate(orderTemplate); // создаем темплейт ордера
    // создаем вьюшку формы заказа. ВАЖНО - привести к html-форме! иначе ругается
    orderFormView = new FormOrder(events, orderT as HTMLFormElement);

    // забираем актуальные данные и ошибки из модельки
    const customerData = customerModel.getCustomerData(); // {payment, address, email, phone}
    // формируем данные об ошибках
    const errors = customerModel.validateCustomerData();
    // светим кнопку оплаты если она уже была выбрана ранее
    orderFormView.setPaymentClass(customerData.payment);

    // рендерим форму с сохраненными данными (если есть) и актуальными ошибками
    orderFormView.render({
        address: customerData.address, // передаем адрес чтобы сработал сеттер и заполнил инпут
        valid: !errors.payment && !errors.address, // общая кнопка доступна если нет ошибок по этим полям
        // вариант - вывести сразу все ошибки, какие есть, а не по очереди. по мере заполнения они будут отскакивать
        errors: [errors.payment, errors.address].filter(Boolean).join(' ')
    });

    // рендерим модалку и в ней готовую заполненную вьюшку формы
    modal.render({
        content: orderFormView.render()
    });
});

// слушаем клики по кнопкам выбора условий оплаты
events.on('order:payment-change', (data: { payment: 'card' | 'cash' }) => {
    customerModel.setCustomerData({ payment: data.payment });
});

// слушаем появление текста в инпуте адреса
events.on('order:change', (data: { field: string; value: string }) => {
    // записываем в модель адрес к примеру { address: 'Lenin street 2' }
    if (data.field === 'address' || data.field === 'text' || orderFormView) {
        customerModel.setCustomerData({ address: data.value });
    } else {
        customerModel.setCustomerData({ [data.field]: data.value });
    }
});

// слушаем изменение данных покупателя в модели
events.on('customer:changed', () => {
    const errors = customerModel.validateCustomerData();
    const customerData = customerModel.getCustomerData();

    // если форма ордера открыта
    if (orderFormView) {
        // светим активную кнопку оплаты через toggle-метод
        orderFormView.setPaymentClass(customerData.payment);
        // обновляем состояние кнопки "далее" и текст ошибок
        orderFormView.render({
            valid: !errors.payment && !errors.address, // ок если заполнены оплата и адрес
            errors: errors.payment || errors.address || '' // Выводим актуальную ошибку шага
        });
    }
    // если форма контактов открыта
    if (contactsFormView) {
        contactsFormView.render({
            valid: !errors.email && !errors.phone, // ок если заполнены почта и телефон
            errors: errors.email || errors.phone || '' // вариант ошибок не все сразу а поочереди
        });
    }
});

// слушаем order:submit - по первой форме.
events.on('order:submit', () => {
    const contactsT = cloneTemplate(contactsTemplate); // создаем темплейт контактов
    contactsFormView = new FormContacts(events, contactsT as HTMLFormElement);
    orderFormView = null; // зануляем первую форму чтобы события модели ее больше не трогали

    // собираем данные и ошибки
    const customerData = customerModel.getCustomerData();
    const errors = customerModel.validateCustomerData();

    // рендерим форму с сохраненными данными (если есть) и актуальными ошибками
    contactsFormView.render({
        email: customerData.email, // заполнит инпут email через сеттер
        phone: customerData.phone, // заполнит инпут email через сеттер
        valid: !errors.email && !errors.phone,
        errors: [errors.email, errors.phone].filter(Boolean).join(' ')
    });

    // рендерим модалку и в ней готовую заполненную вьюшку формы
    modal.render({
        content: contactsFormView.render()
    });
});

// слушаем инпуты второго шага -email/phone
events.on('contacts:change', (data: { field: string; value: string }) => {
    customerModel.setCustomerData({ [data.field]: data.value });
});

//=================== ОТПРАВКА ЗАКАЗА ==================================================
// слуашем успешный сабмит по второй форме
events.on('contacts:submit', () => {
    // достаем текущий кост товаров в корзине и передаем его в рендер окна успеха
    const orderCost = basketModel.getBinProductsCost();

    // по тз нужна отправвка заказа на сервер. собираем заказ - 
    // в соответствии с IOrder - 1. данные кастомера (оплата, мыло, тел, адрес)
    // 2. данные заказа - общ сумма и список id товаров (который собираем через map)
    const finOrder = {
        ...customerModel.getCustomerData(), // собираем все данные покупателя
        total: orderCost, // добавляем тотал кост полученныфй выше
        items: basketModel.getProducts().map(product => product.id) // собираем массив id-шников проданныъ товаров из корзины
    };

    // ВКЛЮЧЕНО ДЛЯ СЕРВЕРА!!! **************************************************************/
    // отправка заказа на бэкенд. формируем 
    appApi.createOrder(finOrder)
        .then((result) => {
            // очищаем МОДЕЛИ - важно очистить в этом блоке - чтобы в случае ошибки/сбоя и дальнейшего кода данные не затерлись
            basketModel.clearBin(); // корзину
            customerModel.clearCustomerData(); // данные покупателя
            contactsFormView = null; //зануляем вьюшку контактов
        
            // окно успеха
            const successT = cloneTemplate(successTemplate); // создаем темплейт финалки
            const successView = new Success(successT, { // вьюшка на основе клона + действие на клик
                onClose: () => {
                    modal.close();
                }
            })
            
            successView.render({ // закидываем во вьюшку сумму покупки
                total: orderCost
            });
            // рендерим модалку и в ней отрисовываем готовую заполненную вьюшку формы
            modal.render({
                content: successView.render()
            });
        }).catch((error) => {
            // если сервер вернет ошибку
            console.error('Ошибка при отправке заказа на сервер!', error)
        });
    //КОНЕЦ БЛОКА ВКЛЮЧЕНО ДЛЯ СЕРВЕРА*******************************************************/
    
    // ВРЕМЕННО ОТКЛЮЧЕНО ******************************* - ДЛЯ МОКОВ *********************/
    // ВРЕМЕННО ОТКЛЮЧЕНО!!! через консол - ДЛЯ МОКОВ - "типа отправка данных на сервер"
    // console.log('отправляем заказ на сервер', finOrder);
    // // очищаем МОДЕЛИ
    // basketModel.clearBin(); // корзину
    // customerModel.clearCustomerData(); // данные покупателя
    // contactsFormView = null; //зануляем вьюшку контактов

    // // окно успеха
    // const successT = cloneTemplate(successTemplate); // создаем темплейт финалки
    // const successView = new Success(successT, { // вьюшка на основе клона + действие на клик
    //     onClose: () => {
    //         modal.close();
    //     }
    // });
    
    // successView.render({ // закидываем во вьюшку сумму покупки
    //     total: orderCost
    // });
    // // рендерим модалку и в ней отрисовываем готовую заполненную вьюшку формы
    // modal.render({
    //     content: successView.render()
    // });
    //КОНЕЦ БЛОКА ОТКЛЮЧЕНО****************************************************************/
});
