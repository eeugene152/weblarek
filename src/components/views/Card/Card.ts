import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';


// пишем общие данные, своейственные для всех карточек
export interface ICard {
    title: string;
    price: number | null;
}

// пишем общий класс карточки, который будем использовать в других испостасях
// добавляем параметр Т - для дочерних классов которые будут добавлять свое
// Чтобы использовать T внутри <ICard & T>, сам класс должен объявить этот
// параметр <T = object>
export abstract class Card<T = object> extends Component<ICard & T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        
        // проверяем наличие в разметке
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container)
    }
    
    // защита. все доступно через рендер()
    protected set title(value: string) {
        this.titleElement.textContent = value;
    }
    protected set price(value: number | null) {
        // отрабатываем два варианта - где есть цена - даем с валютой. нет - Бесценно
        if (value === null) {
            this.priceElement.textContent = `Бесценно`
        } else {
            this.priceElement.textContent = `${value} синапсов`
        }
    }
}