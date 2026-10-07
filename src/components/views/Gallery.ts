import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface IGallery {
    catalog: HTMLElement[];
}

// VIEW — список карточек. Про товары не знает ничего:
// принимает готовые элементы и раскладывает их в контейнере.
export class Gallery extends Component<IGallery> {
    protected catalogElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this.catalogElement = ensureElement<HTMLElement>('.gallery', this.container);
    }
    
    // Сеттер protected: снаружи компонент обновляется только через render().
    // а рендер зашит в основной компонент
    protected set catalog(items: HTMLElement[]) {
        this.catalogElement.replaceChildren(...items);
    }
}