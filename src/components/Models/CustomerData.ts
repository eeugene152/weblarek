import { IEvents } from "../base/Events";
import { TPayment, ICustomer, FormErrors } from "./../../types/index";

export class CustomerData {
  // приватное поле класса
  private payment: TPayment | null; // сущность типа оплаты - выбор между ничего и налом, картой. Корр.- или состояние "не выбрано"
  private address: string;
  private email: string;
  private phone: string;
  protected events: IEvents; // поле для брокера событий

  // Конструктор инициализирует всё пустыми строками. добавляем брокер событий
  constructor(events: IEvents) {
    this.payment = null; // Корр. изначально состояние "не выбрано"
    this.address = "";
    this.email = "";
    this.phone = "";
    this.events = events; // брокер событий добавляем и в конструктор
  }

  //методы класса
  setCustomerData(data: Partial<ICustomer>): void {
    // чтобы не эмитить в каждом условии делаем переменную изменений
    let isChanged = false;

    if (data.payment !== undefined) {
      this.payment = data.payment;
      isChanged = true;
    }
    if (data.address !== undefined) {
      this.address = data.address;
      isChanged = true;
    }
    if (data.email !== undefined) {
      this.email = data.email;
      isChanged = true;
    }
    if (data.phone !== undefined) {
      this.phone = data.phone;
      isChanged = true;
    }

    // если переменная поменялась то делаем эмит
    if (isChanged) {
      // вытаскиваем полные измененные данные методом и передаем в эмит
      this.events.emit("customer:changed", this.getCustomerData());
    }
  }
  // метод не меняет данные эмита нет
  getCustomerData(): ICustomer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }
  // метод меняет данные. в конце эмитим. передаем опять полные данные через метод getCustomerData
  clearCustomerData(): void {
    //  лучше явная очистка без 'this as any[key]' - в некоторых случаях ts опять же на то может ругаться/не видеть..
    this.payment = null; // Корр. при очистке скидываем в null - "не выбрано"
    this.address = "";
    this.email = "";
    this.phone = "";

    this.events.emit("customer:changed", this.getCustomerData());
  }
  // метод ничего не меняет. эмит не нужен
  validateCustomerData(): FormErrors {
    // создадим объект ошибок. сначала пустым
    const errors: FormErrors = {};
    if (this.payment === null) { // Корр. - проверяем на null - "не выбран вариант оплаты"
      errors.payment = "Не выбран тип оплаты.";
    }
    if (this.address === "") {
      errors.address = "Не указан адрес покупателя.";
    }
    if (this.email === "") {
      errors.email = "Не указан email покупателя.";
    }
    if (this.phone === "") {
      errors.phone = "Не указан телефон покупателя.";
    }
    return errors;
  }
}
