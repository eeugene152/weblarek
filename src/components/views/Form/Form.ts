import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';



// общие данные свойственные всем формам
export interface IForm {
    valid: boolean; // можно ли проводить (управляет disabled у submit)
    errors: string; // текст ошибок валидации
}

// добавим дженерик <T = object> - дочерние классы смогут типизировать свои инпуты
export class Form <T = object> extends Component<IForm & T> {
    protected errorsElement: HTMLElement;
    protected submitButton: HTMLButtonElement;

    constructor(protected events: IEvents, protected container: HTMLFormElement) {
        super(container);

        this.submitButton = ensureElement<HTMLButtonElement>('[type="submit"]', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);
        
         // делегируем события - слушаем изменения в ЛЮБОМ инпуте формы
        this.container.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            // Получаем имя инпута из атрибута name (например, 'address' или 'email')
            const field = target.name;
            // Получаем текущий текст из инпута
            const value = target.value;

            // генерим динамическое событие как- 'order:change', 'contacts:change' и тп
            // имя события настраиваем в дочерних классах пока не поднимется оттуда будет универс-е
            this.events.emit(`${this.container.name}:change`, { field, value });
        });

        // слушаем отправку формы
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('form:submitted');
        });
    }
    
    protected set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    protected set errors(value: string) {
        this.errorsElement.textContent = value;
    }
}