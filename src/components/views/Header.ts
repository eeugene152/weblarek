import { IEvents } from './../base/Events';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface IHeader {
    counter: number;
}

/* ВАЖНО! - никакие данные в компоненте представления не находятся и
никакие данные компонент представления не может предоставлять */
export class Header extends Component<IHeader> {
    protected counterElement: HTMLElement;
    protected busketButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container)
        this.busketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container)

        this.busketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.counterElement.textContent = String(value);
    }
}