import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { Form } from './Form';



// интерфейс полей для формы контактов
interface IFormContacts {
    email: string;
    phone: string;
}

// опять наследуемся от формы -родителя
export class FormContacts extends Form<IFormContacts> {
    protected emailElement: HTMLInputElement;
    protected phoneElement: HTMLInputElement;

    // не протектим в конструкторе
    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container)

        this.emailElement = ensureElement<HTMLInputElement>('[name="email"]', this.container);
        this.phoneElement = ensureElement<HTMLInputElement>('[name="phone"]', this.container);
    }

    protected set email(value: string) {
        this.emailElement.value = value;
    }
    protected set phone(value: string) {
        this.phoneElement.value = value;
    }
}