import { IProduct, TPayment } from "./types/index";
import "./scss/styles.scss";

// импортируем утилиты
import { EventEmitter } from "./components/base/Events";
import { Api } from "./components/base/Api";
import { API_URL, CDN_URL } from "./utils/constants";
import { cloneTemplate, ensureElement } from "./utils/utils";

// импортируем сервис апи
import { AppApi } from "./components/AppApi";

// импортируем модели
import { CatalogMain } from "./components/Models/CatalogMain";
import { BinData } from "./components/Models/BinData";
import { CustomerData } from "./components/Models/CustomerData";

// импортируем вьюшки
import { Header } from "./components/views/Header";
import { Gallery } from "./components/views/Gallery";
import { Modal } from "./components/views/Modal";
import { CardCatalog } from "./components/views/Card/CardCatalog";
import { CardPreview } from "./components/views/Card/CardPreview";
import { CardBasket } from "./components/views/Card/CardBasket";
import { Basket } from "./components/views/Basket";
import { Success } from "./components/views/Success";
import { FormOrder } from "./components/views/Form/FormOrder";
import { FormContacts } from "./components/views/Form/FormContacts";

// инициализируем базу
// ==========================================
const events = new EventEmitter();

const baseApi = new Api(API_URL); // экземпляр базового api с адресом сервера
const appApi = new AppApi(baseApi); // на его основе - класс AppApi (композиция)

// Глобальные модели данных (передаем им один общий брокер событий)
const catalogModel = new CatalogMain(events);
const basketModel = new BinData(events);
const customerModel = new CustomerData(events);

// фиксируем все шаблоны
// ==========================================
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success"); // для финала

// компоненты view
// ==========================================
// контейнеры которые уже есть на странице изначально
const pageContainer = ensureElement<HTMLElement>(".page");
const modalContainer = ensureElement<HTMLElement>("#modal-container");

// созданные нами основные на их основе
const header = new Header(events, pageContainer);
const gallery = new Gallery(pageContainer);
const modal = new Modal(modalContainer);

// создаем экземпляры вьюшек блоков один раз.
// события кнопок вызываются во вьюшках - передаем ивенты вторыми аргументами туда
const cardPreviewView = new CardPreview(cloneTemplate(cardPreviewTemplate), events);
const basketView = new Basket(cloneTemplate(basketTemplate), events);

const orderFormView = new FormOrder(events, cloneTemplate(orderTemplate) as HTMLFormElement);
const contactsFormView = new FormContacts(events, cloneTemplate(contactsTemplate) as HTMLFormElement);
const successView = new Success(cloneTemplate(successTemplate), {
    onClose: () => modal.close()
});


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
      onClick: () => {
        // и еще передаем в шаблон коллбэк на клик по ней
        events.emit('card:selected', product); // если случается - анонсируется событие "карточка-выбрана"
      },
    });
    // заполняем вьюшку данными товара через render из корневого компонента, в котором тот прописан
    // по замечанию в review явно прописываем поля для заполнения
    // рендерим с явными полями чтобы не "залетели лишние данные", типа id и т.п.
    return cardCatalogView.render({
        title: product.title,
        price: product.price,
        category: product.category,
        image: { src: CDN_URL + product.image, alt: product.title } // исправили путь и добавили текст к картинке
    });
  });

  // передаем html-карточки в компонент галереи для вывода на экран
  gallery.render({ catalog: catalogCards });
});

//================== получение данных ===================================================
appApi
  .getProducts()
  .then((data) => {
    // Из ответа берем массив items и грузим в нашу модель каталога 'catalogModel'
    // там метод сам сгенерирует событие 'items:changed'
    catalogModel.saveProducts(data.items);
  })
  .catch((error) => {
    console.error("Ошибка загрузки товаров:", error);
  });

// слушаем событие 'card:selected', берем переданный product и реагируем на него как услышали
events.on('card:selected', (product: IProduct) => {
  catalogModel.setPreview(product); // передаем товар в модель данных
});

events.on('card:action', () => {
    const product = catalogModel.getPreview();
    if (!product) return; // возврат если ничего не прилетело

    // вилка для корзины было-удаляем, нет - добавляем
    if (basketModel.checkProductInBin(product.id)) {
      basketModel.deleteProduct(product.id);
    } else {
      basketModel.addProduct(product);
    }

    // закрываем модалку по ТЗ
    modal.close();
})

// слушаем событие 'preview:changed'
events.on('preview:changed', () => {
  // прорисовываем карточку товара
  // получаем выбранный товар напрямую ИЗ МОДЕЛИ каталога!
  const product = catalogModel.getPreview();
    if (!product) return;
  cardPreviewView.render({
    title: product.title,
    price: product.price,
    category: product.category,
    description: product.description,
    image: { src: CDN_URL + product.image, alt: product.title }, // исправили путь и добавили текст к картинке
    buttonText: product.price === null  // проверяем цену / наличие в корзине
      ? 'Недоступно'
        // проверяем есть ли товар в корзине
      : basketModel.checkProductInBin(product.id) ? 'Удалить из корзины' : 'Купить',
    buttonDisabled: product.price === null, // не забыли добавить свойство в ICardPreview
  }); 
  // рендерим модалку
  modal.render({ content: cardPreviewView.render() });
});

//=================== КОРЗИНА ==================================================
// слушаем событие 'basket:changed'
events.on('basket:changed', () => {
  const goodsInBasket = basketModel.countBinProducts(); 
  header.render({ counter: goodsInBasket }); // рендерим хедер с иконкой и количеством товаров в корзине

  // получаем из модели BinData актуальный массив товаров в корзине пришедший с сервера
  const productsInBasket = basketModel.getProducts();
  // прогоняем массив товаров через map, превращаем его в массив готовых карточек cardBasket
  // не забываем про индекс, который надо посчитать и передать в карточку товара в корзине
  const basketCards = productsInBasket.map((product, index) => {
    const cardTemplate = cloneTemplate(cardBasketTemplate); // клон пустого шаблона карточки в корзине
    // создаем вьюшку карточки(в корзине)
    const cardBasketView = new CardBasket(cardTemplate, {
      onRemove: () => {
        // Колбэк карточки корзины должен только эмитить
        // сообщение о нажатии кнопки, захватывая id товара
        events.emit('basket:remove', { id: product.id });
      }
    });
    // заполняем вьюшку данными товара через render из корневого компонента, в котором тот прописан
    // закидываем туда все что есть по - ...poduct + на ходу генерим правильный п.номер товара в корзине
    // рендерим с явными полями чтобы не "залетели лишние данные", типа id и т.п.
    return cardBasketView.render({
      title: product.title,
      price: product.price,
      index: index + 1,
    });
  });
  // обновляем список товаров и итоговую сумму в ранее сделанной в open корзине - basketView
  // через ее рендер - туда передаем все готовые карточки + тотальную сумму корзины
  basketView.render({
    items: basketCards,
    total: basketModel.getBinProductsCost(), // Передаем актуальную сумму из модели
    // Кнопка заблокирована (disabled = true), если товаров в корзине ровно 0
    buttonDisabled: goodsInBasket === 0 
  });
  // ЗАПОЛНЕННУЮ basketView далее подхватит опять basket:open и отрисует ее в модалке
});

events.on('basket:remove', (data: { id: string }) => {
  basketModel.deleteProduct(data.id);
  // эмитить не надо. модель после удаления сама вызовет basket:change
});

// слушаем событие 'basket:open'
events.on('basket:open', () => {
  // а потом рендерим модалку. причем basketView - без параметров
  // - все уже заполнено в предыдущих блоках
  modal.render({ content: basketView.render() });
});

events.on('basket:checkout', () => {
  modal.render({ content: orderFormView.render() });
});

// =============== ОРДЕРА ==========================================================
// слушаем событие 'order:open'
events.on('order:open', () => {
  // принудительно запускам наполнение формы актуальными данными
  events.emit('customer:changed');
  // рендерим модалку и в ней готовую заполненную вьюшку формы
  modal.render({
    content: orderFormView.render(),
  });
});

// слушаем клики по кнопкам выбора условий оплаты
events.on<{ payment: TPayment }>('order:payment-change', (data) => {    
    customerModel.setCustomerData({ payment: data.payment });
});
// слушаем появление текста в инпуте адреса
// записываем в модель адрес к примеру { address: 'Lenin street 2' }
events.on('order:change', (data: { field: string; value: string }) => {
  customerModel.setCustomerData({ address: data.value });
}); 

// слушаем изменение данных покупателя в модели
events.on('customer:changed', () => {
  const errors = customerModel.validateCustomerData();
  const customerData = customerModel.getCustomerData();

  // обновляем первую форму заказа без всяких условий (все создано в начале)
  orderFormView.render({
    payment: customerData.payment,
    address: customerData.address,
    valid: !errors.payment && !errors.address,
    errors: [errors.payment, errors.address].filter(Boolean).join(' ')
  });

  // обновляем вторую форму контактов тоже без условий (все создано в начале)
  contactsFormView.render({
      email: customerData.email,
      phone: customerData.phone,
      valid: !errors.email && !errors.phone,
      errors: [errors.email, errors.phone].filter(Boolean).join(' ')
  });
});

// слушаем order:submit - по первой форме.
events.on('order:submit', () => {
  // рендерим модалку и в ней готовую заполненную вьюшку формы
  modal.render({
    content: contactsFormView.render(),
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
  // данные заказа - общ сумма и список id товаров (который собираем через map)
  const finOrder = {
    ...customerModel.getCustomerData(), // собираем все данные покупателя
    total: orderCost, // добавляем тотал кост полученныфй выше
    items: basketModel.getProducts().map((product) => product.id), // собираем массив id-шников проданныъ товаров из корзины
  };


  // отправка заказа на бэкенд. формируем
  appApi.createOrder(finOrder)
    .then((result) => {
      // очищаем МОДЕЛИ - важно очистить в этом блоке - чтобы в случае ошибки/сбоя и дальнейшего кода данные не затерлись
      basketModel.clearBin(); // корзину
      customerModel.clearCustomerData(); // данные покупателя

      // рендерим модалку и в ее контенте отрисовываем вьюшку формы с тотальным рузельтатом
      modal.render({
        content: successView.render({ total: result.total }),
      });
    })
    .catch((error) => {
      // если сервер вернет ошибку. 
      console.error("Ошибка при отправке заказа на сервер!", error);
    });
});

//================ начальное состояние =======================================================
// инициируем начальное состояние строго в конце - когда все слушатели включены.
// событие 'basket:changed' поймается, пустая корзина отрисуется и кнопка заблокируется
basketModel.clearBin();

//дергаем модель покупателя - событие 'customer:changed' сработает,
// очистит все инпуты форм и выставит правильные начальные ошибки
customerModel.clearCustomerData();
