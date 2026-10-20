import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { Form } from './Form';
import { ICustomer } from '../../../types/index';

// чтобы вручную не перечислять поля наследуем их прямо из данных покупателя
interface IFormOrder extends Pick<ICustomer, 'address' | 'payment'> {};

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

    this.addressElement = ensureElement<HTMLInputElement>(
      '.form__input',
      this.container,
    );
    this.onLineButton = ensureElement<HTMLButtonElement>(
      '[name="card"]',
      this.container,
    );
    this.onReceiptButton = ensureElement<HTMLButtonElement>(
      '[name="cash"]',
      this.container,
    );

    // вешаем слушатели на кнопки выбора варианта оплаты
    this.onLineButton.addEventListener('click', () => {
      this.events.emit('order:payment-change', { payment: 'card' });
    });
    this.onReceiptButton.addEventListener('click', () => {
      this.events.emit('order:payment-change', { payment: 'cash' });
    });
  }

  // сеттер для адреса. защищен. полю-инпуту присваиваем вэлью через 'вэлью'
  set address(value: string) {
    this.addressElement.value = value;
  }

  // сеттер для переключения активности кнопок выбора варианта облаты
  set payment(activeName: ICustomer['payment']) {
    // поскольку из вариантов оплаты мы убрали 'пусто' код здесь можно
    // упростить до toggle - убираем принудительное общее обнуление и проверку if-else
    this.onLineButton.classList.toggle('button_alt-active', activeName === 'card');
    this.onReceiptButton.classList.toggle('button_alt-active', activeName === 'cash');
  }
}
