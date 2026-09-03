import { TPayment, ICustomer, FormErrors } from './../../types/index';

export class CustomerData {
    // приватное поле класса
    private _payment: TPayment; // сущность типа оплаты - выбор между ничего и налом, картой
    private _address: string;
    private _email: string;
    private _phone: string;

    // Конструктор инициализирует всё пустыми строками
    constructor() {
        this._payment = '';
        this._address = '';
        this._email = '';
        this._phone = '';
    }

    //методы класса
    setCustomerData(data: Partial<ICustomer>): void {
        if (data.payment !== undefined) {
            this._payment = data.payment;
        }
        if (data.address !== undefined) {
            this._address = data.address;
        }
        if (data.email !== undefined) {
            this._email = data.email;
        }
        if (data.phone !== undefined) {
            this._phone = data.phone;
        }
    }
    getCustomerData(): ICustomer {
        return {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone
        };
    }
    clearCustomerData(): void {
        // Object.keys(this).forEach((key) => {
        //     (this as any)[key] = ''; // иначе ts будет ругаться на динамический ключ
        // });
        // но типа говорят что лучше явная очистка без 'as any' - в некоторых случаях ts опять же на то может ругаться/не видеть..
        this._payment = '';
        this._address = '';
        this._email = '';
        this._phone = '';
    }
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