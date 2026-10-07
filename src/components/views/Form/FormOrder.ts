import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { Form } from './Form';


// поля для формы ордера
interface IFormOrder {
    address: string;
}

// наследуемся от осн формы и передаем в дженерик интерфейс полей
export class FormOrder extends Form<IFormOrder> {
    protected addressElement: HTMLInputElement;
    protected onLineButton: HTMLButtonElement;
    protected onReceiptButton: HTMLButtonElement;
    
    // в контструкторе этого класса протектед не указываем т.к. он такой сделан в родителе
    constructor(events: IEvents, container: HTMLFormElement) {
        // родителю обязательно нужно отдать брокер событий тоже,
        // чтобы он мог внутри себя делать this.events.emit()
        super(events, container);
        
        this.addressElement = ensureElement<HTMLInputElement>('.form__input', this.container);
        this.onLineButton = ensureElement<HTMLButtonElement>('[name="card"]', this.container);
        this.onReceiptButton = ensureElement<HTMLButtonElement>('[name="cash"]', this.container);

        // вешаем слушатели на кнопки выбора варианта оплаты
        this.onLineButton.addEventListener('click', () => {
            this.events.emit('order:payment-change', { payment: 'card' });
        })
        this.onReceiptButton.addEventListener('click', () => {
            this.events.emit('order:payment-change', { payment: 'cash' });
        })
    }
    
    // сеттер для адреса. защищен. полю-инпуту присваиваем вэлью через 'вэлью'
    protected set address(value: string) {
        this.addressElement.value = value;
    }
    
    // метод ля переключения активности кнопок выбора варианта облаты
    // до момента выбора - делаем третий вариант - ''
    setPaymentClass(activeName: 'card' | 'cash' | ''): void {
        // сначала обе кнопки сбрасываем
        this.onLineButton.classList.remove('button_alt-active');
        this.onReceiptButton.classList.remove('button_alt-active');

        // добавляем класс активности к выбраной пользователем кнопки
        if (activeName === 'card') {
            this.onLineButton.classList.add('button_alt-active');
        } else if (activeName === 'cash') {
            this.onReceiptButton.classList.add('button_alt-active');
        }  // в противном случае у нас остается пока вариант - ''
    }
}