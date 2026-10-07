import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';

interface ICardBasketActions {
    onRemove: () => void; // клик по кнопке удалить из корзины
}

// доп данные к головной Card
interface ICardBasket {
    index: number;
}

export class CardBasket extends Card<ICardBasket> {
    protected itemBasketIndexElement: HTMLElement;
    protected itemRemoveButton: HTMLButtonElement;

    // в контструкторе этого класса протектед не указываем т.к. он такой сделан в родителе
    constructor(container: HTMLElement, actions?: ICardBasketActions) {
        super(container);
        
        // находим элементы
        this.itemBasketIndexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.itemRemoveButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        // клик по кнопке удалить из корзины. + гасим всплытие до карточки и выше
        if (actions?.onRemove) {
            this.itemRemoveButton.addEventListener('click', (event) => {
                event.stopPropagation();
                actions.onRemove();
            })
        }
    }

    protected set index(value: number) {
        this.itemBasketIndexElement.textContent = `${value}`;
    }
}