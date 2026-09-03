import { IProductList, IOrder, IOrderResult, IApi } from '../../types/index';

export class AppApi {
    private _api: IApi;

    // В конструктор передаем объект-интерфейс IApi=/композиция/
    constructor(api: IApi) {
        this._api = api;
    }

    // Получение списка товаров с сервера
    getProducts(): Promise<IProductList> {
        return this._api.get('/product') as Promise<IProductList>;
    }

    // Отправка заказа на сервер
    createOrder(order: IOrder): Promise<IOrderResult> {
        return this._api.post('/order', order) as Promise<IOrderResult>;
    }
}
