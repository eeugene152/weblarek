import { IProductList, IOrder, IOrderResult, IApi } from "../types/index";

export class AppApi {
  private api: IApi;

  // В конструктор передаем объект-интерфейс IApi=/композиция/
  constructor(api: IApi) {
    this.api = api;
  }

  // Получение списка товаров с сервера
  getProducts(): Promise<IProductList> {
    // убрал грубое приведение к типу - IApi. метод сам подхватит тип и вернет промис
    return this.api.get<IProductList>('/product');
  }

  // Отправка заказа на сервер
  createOrder(order: IOrder): Promise<IOrderResult> {
    // убрал грубое приведение к типу - IApi. метод сам подхватит тип и вернет промис
    return this.api.post<IOrderResult>('/order', order);
  }
}
