import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';


interface IBasketActions {
    onOrder: () => void; // клик по кнопке оформить
}

interface IBasket {
    items: HTMLElement[];
    total: number;
}

// данные корзины
export class Basket extends Component<IBasket> {
    protected itemsElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected basketButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: IBasketActions) {
        super(container);

        // ищем составляющие
        this.itemsElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        // клик по кнопке оформить + гасим всплытие
        if (actions?.onOrder) {
            this.basketButton.addEventListener('click', (event) => {
                event.stopPropagation();
                actions.onOrder();
            })
        }
    }

    protected set items(goods: HTMLElement[]) {
        // если в корзине чтото есть наполняем ее и с кнопки снимаем блок
        if (goods.length > 0) {
            this.itemsElement.replaceChildren(...goods);
            this.basketButton.removeAttribute('disabled');
        } else {
            // если товаров нет генерим внутри доп элемент вместо списка
            // с надписью корзина пуста
            const basketEmptyTxt = document.createElement('p');
            // добавим класс и текст и добавляем в контейнер на место списка товаров
            basketEmptyTxt.classList.add('basket__empty-text');
            basketEmptyTxt.textContent = 'Корзина пуста';
            this.itemsElement.replaceChildren(basketEmptyTxt);
            // и на блокируем кнопку - по тз
            this.basketButton.setAttribute('disabled', 'true');
        }
    }

    // НЕ СЧИТАЕМ!!!)) Сеттер просто принимает ГОТОВУЮ сумму от Презентера и рисует её
    protected set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }
}