import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

// интерфейс данных для окна success
interface ISuccess {
    total: number; // списанная сумма заказа
};

// действия (закрытие окна)
interface ISuccessActions {
    onClose: () => void; // клик по кнопке
};

// данные окна успеха
export class Success extends Component<ISuccess> {
    protected totalElement: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ISuccessActions) {
        super(container);

        // ищем составляющие
        this.totalElement = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        // клик по кнопке. гасить всплытие не будем т.к. по факту она все равно закроет окно
        if (actions?.onClose) {
            this.closeButton.addEventListener('click', actions.onClose);
        }
    };
    // НЕ СЧИТАЕМ!!!)) Сеттер просто принимает ГОТОВУЮ сумму от Презентера и рисует её
    protected set total(value: number) {
        this.totalElement.textContent = `Списано ${value} синапсов`;
    };
};
