import { Item } from "@/models/Item";
import { ItemInput } from "@/models/ItemInput";

export class SCIStore {
    private baseControllerUrl: string = 'api/ShoppingCartItems';

    public async getAll(): Promise<Item[]> {
        return [];
    }

    public async create(input: ItemInput): Promise<Item> {
        return new Item();
    }

    public async delete(itemId: number): Promise<void> {
        // call delete
    }
}

export const ShoppingCartItemStore: SCIStore = new SCIStore();
