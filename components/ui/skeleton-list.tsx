import {Skeleton} from "@/components/ui/skeleton";

export default function SkeletonList() {
    return <div className={'w-full flex flex-col gap-2'}>
            <Skeleton className={'w-full h-5 bg-gray-200/10 rounded-xl'}/>
            <Skeleton className={'w-1/2 h-5 bg-gray-200/10 rounded-xl'}/>
        </div>
}