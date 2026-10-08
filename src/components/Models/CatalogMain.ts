import { IEvents } from '../base/Events';
import { IProduct } from './../../types/index';

export class CatalogMain {
    // приватные поля класса
    private _products: IProduct[];
    private _preview: IProduct | null;
    protected events: IEvents; // поле для брокера событий

    // конструктор. добавляем брокер событий
    constructor(events: IEvents) {
        this._products = []; //каталог создается - пустой изначально
        this._preview = null; //превьюшка изначально равна null
        this.events = events; // брокер событий добавляем и в конструктор
    }

    //методы класса
    // метод меняет данные, значит должен генерировать событие 
    saveProducts(products: IProduct[]): void {
        this._products = products;
        // каталог изменился - делаем эмит. туда передаем измененный массив
        this.events.emit('items:changed', { 'items': this._products });
    }
    // метод тоже меняет данные. делаем эмит.
    setPreview(product: IProduct): void {
        this._preview = product;
        // в эмит передаем изменившийся превью
        this.events.emit('preview:changed', this._preview)
    }
    // далее методы ничего не меняют
    getProducts(): IProduct[] {
        return this._products;
    }
    getSelectedProduct(id: string): IProduct | undefined {
        return this._products.find(product => product.id === id); // возвращаем сразу результат find (без лишн переменной)
    }
    getPreview(): IProduct | null {
        return this._preview
    }
}