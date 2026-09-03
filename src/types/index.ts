// import { IProduct } from './index';
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

//объект-тип способы оплаты
export type TPayment = 'card' | 'cash' | '';

//объект-тип ошибки заполнения формы покупателя
export type FormErrors = {
    payment?: string;
    address?: string;
    email?: string;
    phone?: string;
};

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
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

// ответ сервера со списком товаров
export interface IProductList {
    total: number;
    items: IProduct[];
}

// Структура заказа для отправки на сервер - данные покупателя+товары из корзины
export interface IOrder extends ICustomer {
    total: number;     // Итоговая стоимость
    items: string[];   // Массив id товаров из заказа
}

// Ответ сервера при успешном оформлении заказа
export interface IOrderResult {
    id: string;        // id созданного заказа
    total: number;     // итоговая сумма
}
