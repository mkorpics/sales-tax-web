import { Item } from "@/models/Item";
import { Order } from "@/models/Order";

export class OStore {
    private baseControllerUrl = "api/Orders";

    public async getAll(): Promise<Order[]> {
        return [];
    }

    public async get(orderId: string | number): Promise<Order> {
        return new Order();
    }

    public async create(items: Item[]): Promise<Order> {
        return new Order({ items });
    }
}

export const OrderStore: OStore = new OStore();
