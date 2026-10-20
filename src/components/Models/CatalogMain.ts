import { IEvents } from '../base/Events';
import { IProduct } from './../../types/index';

export class CatalogMain {
  // приватные поля класса
  private products: IProduct[];
  private preview: IProduct | null;
  protected events: IEvents; // поле для брокера событий

  // конструктор. добавляем брокер событий
  constructor(events: IEvents) {
    this.products = []; //каталог создается - пустой изначально
    this.preview = null; //превьюшка изначально равна null
    this.events = events; // брокер событий добавляем и в конструктор
  }

  //методы класса
  // метод меняет данные, значит должен генерировать событие
  saveProducts(products: IProduct[]): void {
    this.products = products;
    // каталог изменился - делаем эмит. туда передаем измененный массив
    this.events.emit('items:changed');
  }
  // метод тоже меняет данные. делаем эмит.
  setPreview(product: IProduct): void {
    this.preview = product;
    // в эмит передаем изменившийся превью
    this.events.emit('preview:changed');
  }
  // далее методы ничего не меняют
  getProducts(): IProduct[] {
    return this.products;
  }
  getSelectedProduct(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id); // возвращаем сразу результат find (без лишн переменной)
  }
  getPreview(): IProduct | null {
    return this.preview;
  }
}
