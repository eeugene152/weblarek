import { IProduct } from './../../types/index';

export class BinData {
    // приватное поле класса
    private _products: IProduct[];

    // конструктор
    constructor() {
        this._products = []; //массив товаров в корзине создается - пустой изначально
    }

    //методы класса
    getProducts(): IProduct[] {
        return this._products;
    }
    addProduct(product: IProduct): void {
        this._products.push(product);
    }
    deleteProduct(id: string): void {
        let productToDeleteIndex = this._products.findIndex(product => product.id === id);
        if (productToDeleteIndex !== -1) {
            this._products.splice(productToDeleteIndex, 1)
        }
        
    }
    clearBin(): void {
        this._products = [];
    }
    getBinProductsCost(): number {
        let binCost = 0;
        this._products.forEach(product => {
            if (product.price) {
                binCost += product.price;
            }
        })
        return binCost;
    }
    countBinProducts(): number {
        return this._products.length;
        
    }
    checkProductInBin(id: string): boolean {
        return this._products.some(product => product.id === id)
    }
}

