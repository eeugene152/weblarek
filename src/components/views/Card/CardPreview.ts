import { categoryMap } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';

// задаем тип категории для смены фона категории в карточке
type CategoryKey = keyof typeof categoryMap;

interface ICardPreviewActions {
    onBuy: () => void; // клик по кнопке «Купить»
}
// данные дополняющие основные из головного Card
interface ICardPreview {
    category: string;
    image: string;
    description: string;
}

export class CardPreview extends Card<ICardPreview> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    protected descriptionElement: HTMLElement;
    protected cardButton: HTMLButtonElement;

    // в контструкторе этого класса протектед не указываем т.к. он такой сделан в родителе
    constructor(container: HTMLElement, actions?: ICardPreviewActions) {
        super(container);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

        // Клик по кнопке → документ поступления. Гасим всплытие, чтобы этот
        // клик не сработал ещё и как клик по телу карточки.
        if (actions?.onBuy) {
            this.cardButton.addEventListener('click', (event) => {
                event.stopPropagation();
                actions.onBuy();
            })
        }
    }

    //Сеттеры для отрисовки данных
    protected set category(value: string) {
        this.categoryElement.textContent = value;

        // перебираем категории. ключ сравниваем с value, находим и 
        // задаем класс изменяющийся в соотвтетствии с категорией
        // - для правильного фона категории
        for (const key in categoryMap) {
            this.categoryElement.classList.toggle(
                categoryMap[key as CategoryKey],
                key === value
            );
        }
    }
    protected set image(value: string) {
        this.imageElement.src = value;
    }
    protected set description(value: string) {
        this.descriptionElement.textContent = value;
    }
    
    // переопредилим родительский сеттер цены, чтобы управлять кнопкой
    // - цена може отсутствовать - кнопка блокируется. текст тоже меняется
    protected set price(value: number | null) {
        if (value === null) {
            this.priceElement.textContent = `Бесценно`;
            this.cardButton.textContent = 'Недоступно';
            this.cardButton.disabled = true; // блок на кнопку ставим
        } else {
            this.priceElement.textContent = `${value} синапсов`;
            this.cardButton.disabled = false; // снимаем блок с кнопки
        }
    }

    // сеттер для текста кнопки в зависимости от.. - 
    protected set buttonText(value: string) {
        if (!this.cardButton.disabled) { // меняем только если она доступна
            // - на варианты - купить и удалить из корзины
            this.cardButton.textContent = value;
        }
    }
}