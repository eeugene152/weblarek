// import { IProduct } from './index';
export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods,
  ): Promise<T>;
}

//объект-тип способы оплаты
// оставляем только фактические способы оплаты. если оставить "" - это будет
// неправильно т.к. тут формально будет считаться 3м способом оплаты.
// убираем в -> ICustomer + корректировки в CustomerData и main
export type TPayment = "card" | "cash";

//структура данных товара
export interface IProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
  description: string;
}

//структура данных покупателя
export interface ICustomer {
  payment: TPayment | null; // сотояние когда вариант оплаты не выбран
  email: string;
  phone: string;
  address: string;
}

//объект-тип ошибки заполнения формы покупателя. keyof - вытаскивает названия полей,
// record - новый тип объекта "поля: строка". Pratial - поля необязательны
export type FormErrors = Partial<Record<keyof ICustomer, string>>;

// ответ сервера со списком товаров
export interface IProductList {
  total: number;
  items: IProduct[];
}

// Структура заказа для отправки на сервер - данные покупателя+товары из корзины
export interface IOrder extends ICustomer {
  total: number; // Итоговая стоимость
  items: string[]; // Массив id товаров из заказа
}

// Ответ сервера при успешном оформлении заказа
export interface IOrderResult {
  id: string; // id созданного заказа
  total: number; // итоговая сумма
}
