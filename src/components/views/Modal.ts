import { IEvents } from './../base/Events';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

// Данные модалки — готовый DOM-элемент, который нужно показать.
interface IModalData {
    content: HTMLElement;
}

// VIEW — модальное окно. Универсальный контейнер:
// в .modal__content кладётся любой готовый DOM-элемент (например, форма).
// Закрывается по кнопке и по клику на оверлей (клик внутри окна гасится).
export class Modal extends Component<IModalData> {
    protected closeButtonElement: HTMLButtonElement;
    protected contentElement: HTMLElement;
    protected windowElement: HTMLElement;
    
    constructor(protected event: IEvents, container: HTMLElement) {
        super(container);

        this.closeButtonElement = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);
        this.windowElement = ensureElement<HTMLElement>('.modal__container', this.container);

        this.closeButtonElement.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        // чтобы не закрывался при клике по себе
        this.windowElement.addEventListener('click', (event) => event.stopPropagation())

    }

    // прописываем сеттер - когда надо добавить контент из-вне
    // также делаем его protected тк. доступ тольк4о через render изначального компонента
    protected set content(value: HTMLElement) {
        this.contentElement.replaceChildren(value)
    }

    // методы - команды компоненту (ничего не меняют - открыть/закрыть)
    close(): void {
        this.container.classList.remove('modal_active');
        this.contentElement.replaceChildren(); // при закрытии очищается - не надо хранить инфо в закрытом окне
    }

    open(): void {
        this.container.classList.add('modal_active'); // добавляем активку
    }

    // переопределяем метод рендер - используем родительский стандарт, но
    // добавляем собственный метод - "открытие модалки"
    render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}