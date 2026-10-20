import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

interface IBasket {
  items: HTMLElement[];
  total: number;
  buttonDisabled?: boolean;
}

// данные корзины
export class Basket extends Component<IBasket> {
  protected itemsElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected events: IEvents; // заводим поле для брокера

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events; // сохраняем брокер в своем поле

    // ищем составляющие
    this.itemsElement = ensureElement<HTMLElement>(
      ".basket__list",
      this.container,
    );
    this.totalElement = ensureElement<HTMLElement>(
      ".basket__price",
      this.container,
    );
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container,
    );

    // клик по кнопке оформить
    this.basketButton.addEventListener('click', () => {
      this.events.emit('basket:checkout'); // новое имя события по ревью
    });
  }

  protected set items(goods: HTMLElement[]) {
    // пофигу, пустой массив пришел или полный- сеттер просто берет его и вставляет в список
    this.itemsElement.replaceChildren(...goods);
  }

  protected set buttonDisabled(value: boolean) {
    this.basketButton.disabled = value;
  }
  
  // НЕ СЧИТАЕМ!!!)) Сеттер просто принимает ГОТОВУЮ сумму от Презентера и рисует её
  protected set total(value: number) { 
    this.totalElement.textContent = `${value} синапсов`; 
  } 
}
