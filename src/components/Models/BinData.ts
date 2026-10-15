import { IEvents } from "../base/Events";
import { IProduct } from "./../../types/index";

export class BinData {
  // приватное поле класса
  private products: IProduct[];
  protected events: IEvents; // поле для брокера событий

  // конструктор. добавляем брокер
  constructor(events: IEvents) {
    this.products = []; //массив товаров в корзине создается - пустой изначально
    this.events = events; // брокер событий
  }

  //методы класса
  getProducts(): IProduct[] {
    return this.products;
  }
  addProduct(product: IProduct): void {
    this.products.push(product);
    // метод меняет данные. эмитим событие. с ним не передаем ничего.
    this.events.emit('basket:changed');
  }
  deleteProduct(id: string): void {
    // оставляем в корзине только те продукты, id которых не равен удаляемому.
    this.products = this.products.filter((product) => product.id !== id);
    // метод меняет данные. эмитим событие. с ним не передаем ничего.
    this.events.emit('basket:changed');
  }
  clearBin(): void {
    this.products = [];
    // метод меняет данные. эмитим событие. с ним не передаем ничего.
    this.events.emit('basket:changed');
  }
  getBinProductsCost(): number {
    // событие не генерим. нет операции присваивания. презентер сам получит из него нужное.
    let binCost = 0;
    this.products.forEach((product) => {
      if (product.price) {
        binCost += product.price;
      }
    });
    return binCost;
  }
  countBinProducts(): number {
    // событие не генерим. нет операции присваивания. презентер сам получит из него нужное.
    return this.products.length;
  }
  checkProductInBin(id: string): boolean {
    return this.products.some((product) => product.id === id);
  }
}
