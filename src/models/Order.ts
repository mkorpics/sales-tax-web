import { Item } from "./Item";

export class Order {
    public orderId: number = 0;
    public orderNumber: string = "";
    public items: Item[] = [];
    public orderDate: Date | null = null;

    public get totalSalesTax(): number {
        const totalSalesTax: number = this.items?.reduce((sum: number, item: Item) => sum + (item.salesTax || 0), 0) || 0;
        return totalSalesTax;
    }
    
    public get total(): number {
        const totalPrice: number = this.items?.reduce((sum: number, item: Item) => sum + (item.price || 0), 0) || 0;
        const total: number = totalPrice + this.totalSalesTax;
        return total;
    }

    public constructor(init?: Partial<Order>) {
        Object.assign(this, init);
    }
}
