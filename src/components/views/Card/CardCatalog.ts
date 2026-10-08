import { categoryMap } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';

// задаем тип категории для смены фона категории в карточке
type CategoryKey = keyof typeof categoryMap;
// данные дополняющие основные из головного Card
interface ICardCatalog {
    category: string;
    image: string;
}
// Обработчик действий пользователя на карточке. Карточка — динамический
// компонент: события не эмитит, а получает готовые коллбеки через конструктор.
// делаем так а не через ..this.events.emit - чтобы не нарушать принцип изолированности
// и не иметь жесткой завязки на конкретный глобальный брокер
interface ICardCatalogActions {
  onClick: () => void; // клик по телу карточки — подробности в модальном окне
} 

// VIEW — карточка товара в каталоге. титул и цену наследует абстрактного Card
// от себя - кнопка купить
export class CardCatalog extends Card<ICardCatalog> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    
    // в контструкторе этого класса протектед не указываем т.к. он такой сделан в родителе
    constructor(container: HTMLElement, actions?: ICardCatalogActions) {
        super(container);

        //находим доп компоненты
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container)

        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick)
        }
    }

    // сеттеры для двух новых полей
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

    set image(value: string) {
        this.imageElement.src = value;  //src - для картинок
    }
}