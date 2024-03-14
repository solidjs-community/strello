import { Item } from "@prisma/client";
import { deleteCard } from "~/lib/queries";

type CardProps = {
    item: Item
}

export default function Card(props: CardProps) {
    return (
        <li class="border-t-2 border-b-2 -mb-[2px] last:mb-0 cursor-grab active:cursor-grabbing px-2 py-1 border-t-transparent border-b-transparent">
            <div draggable="true" class="bg-white shadow shadow-slate-300 border-slate-300 text-sm rounded-lg w-full py-1 px-2 relative">
                <h3>{props.item.title}</h3>
                <div class="mt-2">&nbsp;</div>
                <form method="post" action={deleteCard}>
                    <button aria-label="Delete card" class="absolute top-4 right-4 hover:text-brand-red" type="submit">
                        Delete
                    </button>
                </form>
            </div>
        </li>
    )
}