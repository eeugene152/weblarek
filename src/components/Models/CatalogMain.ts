import { IProduct } from './../../types/index';

export class CatalogMain {
    // приватные поля класса
    private _products: IProduct[];
    private _preview: IProduct | null;

    // конструктор
    constructor() {
        this._products = []; //каталог создается - пустой изначально
        this._preview = null; //превьюшка изначально равна null
    }

    //методы класса
    saveProducts(products: IProduct[]): void {
        this._products = products;
    }
    getProducts(): IProduct[] {
        return this._products;
    }
    getSelectedProduct(id: string): IProduct | undefined {
        let selectedProduct = this._products.find(product => product.id === id)
        return selectedProduct;
    }
    setPreview(product: IProduct): void {
        this._preview = product;
    }
    getPreview(): IProduct | null {
        return this._preview
    }
}