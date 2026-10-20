import { categoryMap } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';
import { CategoryKey } from '../../../types/index';
import { IEvents } from '../../base/Events';

// данные дополняющие основные из головного Card
interface ICardPreview {
  category: string;
  image: { src: string; alt: string }; // string на объект - добавили текст к картинке
  description: string;
  // Поле нужно, т.к. меняется в зависимости от. но делаем необязательным
  // т.к. изначально при загрузке сервер присылает данные без этого поля
  // в классе и конструкторе поле не делаем, там есть кнопка.
  // только сеттер для него  - а он приклепает текст к кнопке
  buttonText?: string;
  buttonDisabled?: boolean;
}

export class CardPreview extends Card<ICardPreview> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;
  protected cardButton: HTMLButtonElement;
  protected events: IEvents; // заводим поле для брокера

  // в контструкторе этого класса протектед не указываем т.к. он такой сделан в родителе
  constructor(container: HTMLElement, events: IEvents) {
    super(container); // родителю - только контейнер
    this.events = events; // сохраняем брокер в своем поле

    this.categoryElement = ensureElement<HTMLElement>(
      '.card__category',
      this.container,
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      '.card__image',
      this.container,
    );
    this.descriptionElement = ensureElement<HTMLElement>(
      '.card__text',
      this.container,
    );
    this.cardButton = ensureElement<HTMLButtonElement>(
      '.card__button',
      this.container,
    );

    // Клик по кнопке. Всплытие не гасим т.к. модалка
    // все равно закрывается сразу по ТЗ
    // кнопка тут сама кричит в систему
    this.cardButton.addEventListener('click', () => {
        this.events.emit('card:action');
      });
    }
  

  //Сеттеры для отрисовки данных
  set category(value: string) {
    this.categoryElement.textContent = value;

    // перебираем категории. ключ сравниваем с value, находим и
    // задаем класс изменяющийся в соотвтетствии с категорией
    // - для правильного фона категории
    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(
        categoryMap[key as CategoryKey],
        key === value,
      );
    }
  }
  set image(value: { src: string; alt: string }) { // добавили текст к картинке
    this.setImage(this.imageElement, value.src, value.alt);
  }
  protected set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  // подпись и доступность кнопки вычисляется в презентере и
  // передавает через независимые сеттеры:
  set buttonText(value: string) {
    this.cardButton.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.cardButton.disabled = value;
  } 
}
