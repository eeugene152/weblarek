import { IEvents } from '../base/Events';
import { TPayment, ICustomer, FormErrors } from './../../types/index';

export class CustomerData {
    // приватное поле класса
    private _payment: TPayment; // сущность типа оплаты - выбор между ничего и налом, картой
    private _address: string;
    private _email: string;
    private _phone: string;
    protected events: IEvents; // поле для брокера событий

    // Конструктор инициализирует всё пустыми строками. добавляем брокер событий
    constructor(events: IEvents) {
        this._payment = '';
        this._address = '';
        this._email = '';
        this._phone = '';
        this.events = events; // брокер событий добавляем и в конструктор
    }

    //методы класса
    setCustomerData(data: Partial<ICustomer>): void {
        // чтобы не эмитить в каждом условии делаем переменную изменений
        let isChanged = false;

        if (data.payment !== undefined) {
            this._payment = data.payment;
            isChanged = true;
        }
        if (data.address !== undefined) {
            this._address = data.address;
            isChanged = true;
        }
        if (data.email !== undefined) {
            this._email = data.email;
            isChanged = true;
        }
        if (data.phone !== undefined) {
            this._phone = data.phone;
            isChanged = true;
        }
        
        // если переменная поменялась то делаем эмит
        if (isChanged) {
            // вытаскиваем полные измененные данные методом и передаем в эмит
            this.events.emit('customer:changed', this.getCustomerData())
        }
    }
    // метод не меняет данные эмита нет
    getCustomerData(): ICustomer {
        return {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone
        };
    }
    // метод меняет данные. в конце эмитим. передаем опять полные данные через метод getCustomerData
    clearCustomerData(): void {
        //  лучше явная очистка без 'this as any[key]' - в некоторых случаях ts опять же на то может ругаться/не видеть..
        this._payment = '';
        this._address = '';
        this._email = '';
        this._phone = '';

        this.events.emit('customer:changed', this.getCustomerData())
    }
    // метод ничего не меняет. эмит не нужен
    validateCustomerData(): FormErrors {
        // создадим объект ошибок. сначала пустым
        const errors: FormErrors = {}
        if (this._payment === '') {
            errors.payment = 'Не выбран тип оплаты.';
        }
        if (this._address === '') {
            errors.address = 'Не указан адрес покупателя.';
        }
        if (this._email === '') {
            errors.email = 'Не указан email покупателя.';
        }
        if (this._phone === '') {
            errors.phone = 'Не указан телефон покупателя.';
        }
        return errors;
    }
}