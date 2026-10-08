import { IEvents } from '../base/Events';
import { IProduct } from './../../types/index';

export class BinData {
    // приватное поле класса
    private _products: IProduct[];
    protected events: IEvents; // поле для брокера событий

    // конструктор. добавляем брокер
    constructor(events: IEvents) {
        this._products = []; //массив товаров в корзине создается - пустой изначально
        this.events = events; // брокер событий
    }

    //методы класса
    getProducts(): IProduct[] {
        return this._products;
    }
    addProduct(product: IProduct): void {
        this._products.push(product);
        // метод меняет данные. эмитим событие. передаем измененный список.
        this.events.emit('basket:changed', this._products)
    }
    deleteProduct(id: string): void {
        // оставляем в корзине только те продукты, id которых не равен удаляемому.
        this._products = this._products.filter((product) => product.id !== id);
        // метод меняет данные. эмитим событие. передаем измененный список.
        this.events.emit('basket:changed', this._products)
    }
    clearBin(): void {
        this._products = [];
        // метод меняет данные. эмитим событие. передаем измененный список.
        this.events.emit('basket:changed', this._products)
    }
    getBinProductsCost(): number {
        // событие не генерим. нет операции присваивания. презентер сам получит из него нужное.
        let binCost = 0;
        this._products.forEach(product => {
            if (product.price) {
                binCost += product.price;
            }
        })
        return binCost;
    }
    countBinProducts(): number {
        // событие не генерим. нет операции присваивания. презентер сам получит из него нужное.
        return this._products.length;
    }
    checkProductInBin(id: string): boolean {
        return this._products.some(product => product.id === id)
    }
}

